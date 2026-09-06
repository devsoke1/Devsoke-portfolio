"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireAdminForMutation } from "@/lib/auth/session";
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPostById,
  updateBlogPost,
} from "@/lib/blog/repository";
import { revalidateBlogPaths } from "@/lib/blog/revalidation";
import {
  blogPostSchema,
  formatZodErrors,
  normalizeBlogSlug,
  type FormErrors,
} from "@/lib/blog/validation";

export type BlogFormState = {
  message: string;
  errors: FormErrors;
};

function getBlogMutationState(error: unknown): BlogFormState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        message: "A blog post with this slug already exists.",
        errors: {
          slug: ["A blog post with this slug already exists."],
        },
      };
    }
  }

  return {
    message: "Unable to save blog post. Please check the form and try again.",
    errors: {},
  };
}

export async function createBlogPostAction(
  _previousState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await requireAdminForMutation();

  const rawSlug = String(formData.get("slug") ?? "");
  const normalizedSlug = normalizeBlogSlug(rawSlug);

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: normalizedSlug,
    category: String(formData.get("category") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    featuredMediaId: formData.get("featuredMediaId")
      ? String(formData.get("featuredMediaId")).trim()
      : null,
    author: String(formData.get("author") ?? "").trim(),
    readTime: String(formData.get("readTime") ?? "").trim(),
    status: String(formData.get("status") ?? "DRAFT"),
    publishedAt: formData.get("publishedAt")
      ? String(formData.get("publishedAt"))
      : null,
  };

  const parsed = blogPostSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      message: "Please correct the highlighted errors.",
      errors: formatZodErrors(parsed.error),
    };
  }

  try {
    const post = await createBlogPost(parsed.data);
    revalidateBlogPaths([post.slug]);
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return getBlogMutationState(error);
  }

  redirect("/admin/blog");
}

export async function updateBlogPostAction(
  id: string,
  _previousState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await requireAdminForMutation();

  const existing = await getAdminBlogPostById(id);
  if (!existing) {
    redirect("/admin/blog?error=missing");
  }

  const rawSlug = String(formData.get("slug") ?? "");
  const normalizedSlug = normalizeBlogSlug(rawSlug);

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: normalizedSlug,
    category: String(formData.get("category") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    featuredMediaId: formData.get("featuredMediaId")
      ? String(formData.get("featuredMediaId")).trim()
      : null,
    author: String(formData.get("author") ?? "").trim(),
    readTime: String(formData.get("readTime") ?? "").trim(),
    status: String(formData.get("status") ?? existing.status),
    publishedAt: formData.get("publishedAt")
      ? String(formData.get("publishedAt"))
      : existing.publishedAt,
  };

  const parsed = blogPostSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      message: "Please correct the highlighted errors.",
      errors: formatZodErrors(parsed.error),
    };
  }

  try {
    const updated = await updateBlogPost(id, parsed.data);
    revalidateBlogPaths([existing.slug, updated.slug]);
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return getBlogMutationState(error);
  }

  redirect("/admin/blog");
}

export async function deleteBlogPostAction(id: string) {
  await requireAdminForMutation();

  const existing = await getAdminBlogPostById(id);
  if (!existing) {
    redirect("/admin/blog?error=missing");
  }

  await deleteBlogPost(id);
  revalidateBlogPaths([existing.slug]);

  redirect("/admin/blog");
}

