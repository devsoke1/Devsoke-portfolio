import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBlogPostById } from "@/lib/blog/repository";
import EditBlogPostClient from "./EditBlogPostClient";

export const dynamic = "force-dynamic";

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const post = await getAdminBlogPostById(id);
  if (!post) {
    notFound();
  }

  return <EditBlogPostClient admin={admin} post={post} />;
}

