"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdminForMutation } from "@/lib/auth/session";
import {
  FaqServiceSelectionError,
  createFaq,
  deleteFaq,
  getAdminFaqById,
  toggleFaqPublished,
  updateFaq,
} from "@/lib/faqs/repository";
import { revalidateFaqPaths } from "@/lib/faqs/revalidation";
import type { FaqFormErrors } from "@/lib/faqs/validation";
import {
  formatFaqZodErrors,
  parseFaqFormData,
} from "@/lib/faqs/validation";

export type FaqFormState = {
  message: string;
  errors: FaqFormErrors;
};

function getFaqMutationState(error: unknown): FaqFormState {
  if (error instanceof FaqServiceSelectionError) {
    return {
      message: error.message,
      errors: { serviceId: error.message },
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        message: "A FAQ with this generated key already exists. Please adjust the question and try again.",
        errors: { question: "A FAQ with this generated key already exists." },
      };
    }

    if (error.code === "P2025") {
      return {
        message: "FAQ was not found.",
        errors: {},
      };
    }
  }

  console.error("FAQ mutation failed.");
  return {
    message: "Unable to save the FAQ. Please review the form and try again.",
    errors: {},
  };
}

export async function createFaqAction(
  _previousState: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  await requireAdminForMutation();

  const parsed = parseFaqFormData(formData);

  if (!parsed.success) {
    return {
      message: "Fix the highlighted FAQ fields.",
      errors: formatFaqZodErrors(parsed.error),
    };
  }

  let faq: Awaited<ReturnType<typeof createFaq>>;

  try {
    faq = await createFaq(parsed.data);
  } catch (error) {
    return getFaqMutationState(error);
  }

  revalidateFaqPaths(faq);
  redirect("/admin/faqs?status=created");
}

export async function updateFaqAction(
  id: string,
  _previousState: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  await requireAdminForMutation();

  const existingFaq = await getAdminFaqById(id);

  if (!existingFaq) {
    return {
      message: "FAQ was not found.",
      errors: {},
    };
  }

  const parsed = parseFaqFormData(formData);

  if (!parsed.success) {
    return {
      message: "Fix the highlighted FAQ fields.",
      errors: formatFaqZodErrors(parsed.error),
    };
  }

  let faq: Awaited<ReturnType<typeof updateFaq>>;

  try {
    faq = await updateFaq(id, parsed.data);
  } catch (error) {
    return getFaqMutationState(error);
  }

  revalidateFaqPaths(existingFaq);
  revalidateFaqPaths(faq);
  redirect("/admin/faqs?status=updated");
}

export async function toggleFaqPublishedAction(formData: FormData) {
  await requireAdminForMutation();

  const id = String(formData.get("id") ?? "");
  const faq = await toggleFaqPublished(id);

  if (!faq) {
    redirect("/admin/faqs?error=missing");
  }

  revalidateFaqPaths(faq);
  redirect(`/admin/faqs?status=${faq.isPublished ? "published" : "unpublished"}`);
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdminForMutation();

  const id = String(formData.get("id") ?? "");
  const result = await deleteFaq(id);

  if (result.ok) {
    revalidateFaqPaths(result.faq);
    redirect("/admin/faqs?status=deleted");
  }

  redirect("/admin/faqs?error=missing");
}
