import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedBlogPostBySlug,
  getRelatedPublishedBlogPosts,
} from "@/lib/blog/repository";
import { resolveImageUrl } from "@/lib/media/resolve";
import BlogPostDetailClient from "./BlogPostDetailClient";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Devsoke",
    };
  }

  const imageUrl = resolveImageUrl(post);

  return {
    title: `${post.title} | Devsoke Newsroom`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPublishedBlogPosts(post.slug, post.category, 3);

  return <BlogPostDetailClient post={post} relatedPosts={relatedPosts} />;
}
