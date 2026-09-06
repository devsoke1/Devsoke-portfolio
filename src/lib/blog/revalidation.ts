import { revalidatePath } from "next/cache";

export function revalidateBlogPaths(slugs: Array<string | null | undefined> = []) {
  try {
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    revalidatePath("/admin/dashboard");

    for (const slug of slugs) {
      if (slug && slug.trim().length > 0) {
        revalidatePath(`/blog/${slug}`);
      }
    }
  } catch (error) {
    console.error("Failed to revalidate blog paths:", error);
  }
}

