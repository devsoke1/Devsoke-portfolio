import { revalidatePath } from "next/cache";

export function revalidateMediaPaths() {
  try {
    revalidatePath("/admin/media");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/blog");
    revalidatePath("/work");
    revalidatePath("/blog");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to revalidate media paths:", error);
  }
}

