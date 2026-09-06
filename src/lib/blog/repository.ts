import "server-only";

import { db } from "@/lib/db";
import type { BlogPost as PrismaBlogPost, PostStatus } from "@prisma/client";
import type { AdminBlogPost, BlogPost, BlogStats } from "./types";
import type { BlogPostInput } from "./validation";

type BlogPostWithMedia = PrismaBlogPost & {
  featuredMedia?: { id: string } | null;
};

function toBlogPost(post: BlogPostWithMedia): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    summary: post.summary,
    content: post.content,
    image: post.image,
    featuredMediaId: post.featuredMediaId,
    featuredMedia: post.featuredMedia ? { id: post.featuredMedia.id } : null,
    author: post.author,
    readTime: post.readTime,
    status: post.status as BlogPost["status"],
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

function toAdminBlogPost(post: BlogPostWithMedia): AdminBlogPost {
  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  return {
    ...toBlogPost(post),
    wordCount,
  };
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const posts = await db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  return posts.map(toBlogPost);
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await db.blogPost.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
  });

  return post ? toBlogPost(post) : null;
}

export async function getRelatedPublishedBlogPosts(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<BlogPost[]> {
  // First attempt: same category
  const sameCategoryPosts = await db.blogPost.findMany({
    where: {
      slug: { not: currentSlug },
      category: { equals: category, mode: "insensitive" },
      status: "PUBLISHED",
    },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });

  if (sameCategoryPosts.length >= limit) {
    return sameCategoryPosts.map(toBlogPost);
  }

  // Second attempt: fill remaining slots with recent published posts
  const needed = limit - sameCategoryPosts.length;
  const excludedSlugs = [currentSlug, ...sameCategoryPosts.map((p) => p.slug)];

  const additionalPosts = await db.blogPost.findMany({
    where: {
      slug: { notIn: excludedSlugs },
      status: "PUBLISHED",
    },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
    orderBy: [{ publishedAt: "desc" }],
    take: needed,
  });

  return [...sameCategoryPosts, ...additionalPosts].map(toBlogPost);
}

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const posts = await db.blogPost.findMany({
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return posts.map(toAdminBlogPost);
}

export async function getAdminBlogPostById(id: string): Promise<AdminBlogPost | null> {
  const post = await db.blogPost.findUnique({
    where: { id },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
  });

  return post ? toAdminBlogPost(post) : null;
}

export async function getAdminBlogPostBySlug(slug: string): Promise<AdminBlogPost | null> {
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
  });

  return post ? toAdminBlogPost(post) : null;
}

export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  let publishedAt: Date | null = null;
  if (input.status === "PUBLISHED") {
    publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
  }

  const created = await db.blogPost.create({
    data: {
      slug: input.slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      content: input.content,
      image: input.image,
      featuredMediaId: input.featuredMediaId ?? null,
      author: input.author,
      readTime: input.readTime,
      status: input.status as PostStatus,
      publishedAt,
    },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
  });

  return toBlogPost(created);
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<BlogPost> {
  const existing = await db.blogPost.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("BlogPost not found");
  }

  let publishedAt: Date | null = existing.publishedAt;

  if (input.status === "PUBLISHED") {
    if (!publishedAt) {
      // First time transitioning to published
      publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
    } else if (input.publishedAt) {
      // User explicitly updated the publish date
      publishedAt = new Date(input.publishedAt);
    }
  } else if (input.status === "DRAFT" || input.status === "ARCHIVED") {
    // Preserve original publishedAt if it existed, or if user explicitly provided a date
    if (input.publishedAt) {
      publishedAt = new Date(input.publishedAt);
    }
  }

  const updated = await db.blogPost.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      content: input.content,
      image: input.image,
      featuredMediaId: input.featuredMediaId ?? null,
      author: input.author,
      readTime: input.readTime,
      status: input.status as PostStatus,
      publishedAt,
    },
    include: {
      featuredMedia: {
        select: { id: true },
      },
    },
  });

  return toBlogPost(updated);
}

export async function deleteBlogPost(id: string): Promise<{ ok: boolean }> {
  await db.blogPost.delete({
    where: { id },
  });

  return { ok: true };
}

export async function getBlogStats(): Promise<BlogStats> {
  const [total, published, draft, archived] = await Promise.all([
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "DRAFT" } }),
    db.blogPost.count({ where: { status: "ARCHIVED" } }),
  ]);

  return {
    total,
    published,
    draft,
    archived,
  };
}
