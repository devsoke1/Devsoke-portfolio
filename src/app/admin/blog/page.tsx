import { requireAdmin } from "@/lib/auth/session";
import { getAdminBlogPosts } from "@/lib/blog/repository";
import BlogListClient from "./BlogListClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const admin = await requireAdmin();
  const posts = await getAdminBlogPosts();

  return <BlogListClient admin={admin} posts={posts} />;
}

