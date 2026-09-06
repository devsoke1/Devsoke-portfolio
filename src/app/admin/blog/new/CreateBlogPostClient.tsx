"use client";

import AdminShell from "../../_components/AdminShell";
import BlogPostForm from "../_components/BlogPostForm";
import { createBlogPostAction } from "../actions";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

export default function CreateBlogPostClient({ admin }: { admin: AdminSummary }) {
  return (
    <AdminShell admin={admin} active="blog">
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <BlogPostForm
          adminName={admin.name}
          action={createBlogPostAction}
          mode="create"
        />
      </div>
    </AdminShell>
  );
}
