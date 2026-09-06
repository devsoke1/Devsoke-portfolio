"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "crypto";
import { requireAdminForMutation } from "@/lib/auth/session";
import {
  createInquiry,
  deleteInquiry,
  updateInquiryNotes,
  updateInquiryStatus,
} from "./repository";
import {
  formatZodErrors,
  inquirySubmissionSchema,
  updateInquiryNotesSchema,
  updateInquiryStatusSchema,
} from "./validation";
import type { BookingStatus } from "@prisma/client";
import type { InquirySubmissionResponse } from "./types";

async function getHashedClientIp(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const realIp = headerList.get("x-real-ip");
    const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const salt = process.env.AUTH_SECRET || "devsoke-ip-salt";
    return crypto.createHmac("sha256", salt).update(rawIp).digest("hex").slice(0, 32);
  } catch {
    return null;
  }
}

export async function submitInquiryAction(
  _prevState: InquirySubmissionResponse | null,
  formData: FormData
): Promise<InquirySubmissionResponse> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    // Silent drop for automated spam bots filling the honeypot
    return {
      success: true,
      message: "Thank you, your project inquiry has been received.",
    };
  }

  const renderTime = formData.get("_t");
  if (renderTime) {
    const elapsed = Date.now() - Number(renderTime);
    if (!isNaN(elapsed) && elapsed > 0 && elapsed < 1200) {
      // Form submitted in under 1.2 seconds, typical of headless automation
      return {
        success: false,
        message: "Form submitted too quickly. Please try again.",
      };
    }
  }

  const rawPayload = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    company: formData.get("company") ? String(formData.get("company")).trim() : null,
    service: String(formData.get("service") ?? "").trim(),
    budget: String(formData.get("budget") ?? "").trim(),
    timeline: String(formData.get("timeline") ?? "").trim(),
    preferredDate: String(formData.get("date") ?? formData.get("preferredDate") ?? "").trim(),
    message: formData.get("message") ? String(formData.get("message")).trim() : null,
    source: (String(formData.get("source") ?? "BOOKING_MODAL") as "BOOKING_MODAL" | "CONTACT_PAGE"),
    projectContext: formData.get("projectContext")
      ? String(formData.get("projectContext")).trim()
      : null,
    entryPath: formData.get("entryPath")
      ? String(formData.get("entryPath")).trim()
      : null,
    referrer: formData.get("referrer")
      ? String(formData.get("referrer")).trim()
      : null,
    ctaLabel: formData.get("ctaLabel")
      ? String(formData.get("ctaLabel")).trim()
      : null,
    ctaLocation: formData.get("ctaLocation")
      ? String(formData.get("ctaLocation")).trim()
      : null,
    submissionToken: formData.get("submissionToken")
      ? String(formData.get("submissionToken")).trim()
      : null,
    website: honeypot,
    _t: renderTime ? Number(renderTime) : undefined,
  };

  const parsed = inquirySubmissionSchema.safeParse(rawPayload);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted errors.",
      errors: formatZodErrors(parsed.error),
    };
  }

  try {
    const ipHash = await getHashedClientIp();
    const inquiry = await createInquiry(parsed.data, ipHash);

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Thank you! Your project inquiry has been received.",
      inquiryId: inquiry.id,
    };
  } catch (error) {
    console.error("Inquiry submission error:", error);
    const errorMessage =
      error instanceof Error &&
      (error.message.includes("Rate limit exceeded") || error.message.includes("Too many inquiries"))
        ? error.message
        : "Unable to record your inquiry. Please try again shortly.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function updateInquiryStatusAction(
  id: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  await requireAdminForMutation();

  const parsed = updateInquiryStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { success: false, error: "Invalid inquiry status provided." };
  }

  try {
    await updateInquiryStatus(id, parsed.data.status);
    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update inquiry status:", error);
    return { success: false, error: "Failed to update status in database." };
  }
}

export async function updateInquiryNotesAction(
  id: string,
  notes: string | null
): Promise<{ success: boolean; error?: string }> {
  await requireAdminForMutation();

  const parsed = updateInquiryNotesSchema.safeParse({ notes });
  if (!parsed.success) {
    return { success: false, error: "Invalid notes content." };
  }

  try {
    await updateInquiryNotes(id, parsed.data.notes);
    revalidatePath(`/admin/inquiries/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update inquiry notes:", error);
    return { success: false, error: "Failed to update notes in database." };
  }
}

export async function deleteInquiryAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminForMutation();

  try {
    await deleteInquiry(id);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inquiry:", error);
    return { success: false, error: "Failed to delete inquiry record." };
  }
}
