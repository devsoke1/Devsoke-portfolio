import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/blog/repository";
import BlogListClient from "./BlogListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights & Articles | Devsoke",
  description:
    "Technical guides, visual system design rules, and updates from the Devsoke engineering desk.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return <BlogListClient posts={posts} />;
}
