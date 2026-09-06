"use server";

import { requireAdminForMutation } from "@/lib/auth/session";
import { deleteMediaRecord, updateMediaAltText } from "@/lib/media/repository";
import { revalidateMediaPaths } from "@/lib/media/revalidation";
import { updateMediaAltSchema } from "@/lib/media/validation";

export async function updateMediaAltAction(
  id: string,
  rawAlt: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminForMutation();

    const parsed = updateMediaAltSchema.safeParse({ alt: rawAlt });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid alt text.",
      };
    }

    await updateMediaAltText(id, parsed.data.alt);
    revalidateMediaPaths();

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Failed to update alt text.",
    };
  }
}

export async function deleteMediaAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminForMutation();

    const result = await deleteMediaRecord(id);
    if (!result.success) {
      return result;
    }

    revalidateMediaPaths();
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      error: err.message || "Failed to delete media item.",
    };
  }
}

