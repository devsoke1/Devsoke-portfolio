import { PrismaClient, PostStatus } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { DEFAULT_POSTS } from "../src/utils/blogData";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

async function migrateBlogData() {
  console.log("==========================================");
  console.log("Devsoke Static Blog -> PostgreSQL Migration");
  console.log("==========================================");

  console.log(`\n📦 Found ${DEFAULT_POSTS.length} static blog articles.`);

  console.log("\n⏳ Migrating Articles...");
  for (const post of DEFAULT_POSTS) {
    const publishedAt = new Date(post.date);

    const upserted = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        category: post.category,
        summary: post.summary,
        content: post.content.trim(),
        image: post.image,
        author: post.author,
        readTime: post.readTime,
        status: PostStatus.PUBLISHED,
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      },
      create: {
        slug: post.slug,
        title: post.title,
        category: post.category,
        summary: post.summary,
        content: post.content.trim(),
        image: post.image,
        author: post.author,
        readTime: post.readTime,
        status: PostStatus.PUBLISHED,
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      },
    });

    console.log(`  ✓ Article: "${upserted.title}" (${upserted.slug}) -> ID: ${upserted.id}`);
  }

  const finalTotalCount = await prisma.blogPost.count();
  const finalPublishedCount = await prisma.blogPost.count({ where: { status: "PUBLISHED" } });
  const finalDraftCount = await prisma.blogPost.count({ where: { status: "DRAFT" } });
  const finalArchivedCount = await prisma.blogPost.count({ where: { status: "ARCHIVED" } });

  console.log("\n==========================================");
  console.log("Blog Migration Parity Summary");
  console.log("==========================================");
  console.log(`Static Posts Count : ${DEFAULT_POSTS.length}`);
  console.log(`Database Total     : ${finalTotalCount}`);
  console.log(`Database Published : ${finalPublishedCount}`);
  console.log(`Database Drafts    : ${finalDraftCount}`);
  console.log(`Database Archived  : ${finalArchivedCount}`);

  if (finalTotalCount === DEFAULT_POSTS.length && finalPublishedCount === DEFAULT_POSTS.length) {
    console.log("\n✅ Perfect parity confirmed! Static blog posts are now in PostgreSQL.");
  } else {
    console.warn("\n⚠️ Parity discrepancy detected. Check blogPost table.");
  }
}

migrateBlogData()
  .catch((e) => {
    console.error("❌ Migration failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

