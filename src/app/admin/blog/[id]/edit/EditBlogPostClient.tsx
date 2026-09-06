"use client";

import AdminShell from "../../../_components/AdminShell";
import BlogPostForm from "../../_components/BlogPostForm";
import { updateBlogPostAction } from "../../actions";
import type { AdminBlogPost } from "@/lib/blog/types";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

export default function EditBlogPostClient({
  admin,
  post,
}: {
  admin: AdminSummary;
  post: AdminBlogPost;
}) {
  const boundAction = updateBlogPostAction.bind(null, post.id);

  return (
    <AdminShell admin={admin} active="blog">
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <BlogPostForm
          initialData={post}
          adminName={admin.name}
          action={boundAction}
          mode="edit"
        />
      </div>
    </AdminShell>
  );
}

