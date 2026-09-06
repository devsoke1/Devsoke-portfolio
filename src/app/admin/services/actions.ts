"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdminForMutation } from "@/lib/auth/session";
import {
  createService,
  deleteService,
  getAdminServiceById,
  updateService,
} from "@/lib/services/repository";
import { revalidatePortfolioPaths } from "@/lib/portfolio/revalidation";
import type { FormErrors } from "@/lib/portfolio/validation";
import {
  formatZodErrors,
  parseServiceFormData,
} from "@/lib/portfolio/validation";

export type ServiceFormState = {
  message: string;
  errors: FormErrors;
};


function getServiceMutationState(error: unknown): ServiceFormState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        message: "A service with this slug already exists.",
        errors: { slug: "A service with this slug already exists." },
      };
    }

    if (error.code === "P2025") {
      return {
        message: "Service was not found.",
        errors: {},
      };
    }
  }

  console.error("Service mutation failed.");
  return {
    message: "Unable to save the service. Please review the form and try again.",
    errors: {},
  };
}

export async function createServiceAction(
  _previousState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdminForMutation();

  const parsed = parseServiceFormData(formData);

  if (!parsed.success) {
    return {
      message: "Fix the highlighted service fields.",
      errors: formatZodErrors(parsed.error),
    };
  }

  let createdService: Awaited<ReturnType<typeof createService>>;

  try {
    createdService = await createService(parsed.data);
  } catch (error) {
    return getServiceMutationState(error);
  }

  revalidatePortfolioPaths({
    serviceSlugs: [createdService.slug],
  });
  redirect("/admin/services?status=created");
}

export async function updateServiceAction(
  id: string,
  _previousState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdminForMutation();

  const existingService = await getAdminServiceById(id);

  if (!existingService) {
    return {
      message: "Service was not found.",
      errors: {},
    };
  }

  const parsed = parseServiceFormData(formData);

  if (!parsed.success) {
    return {
      message: "Fix the highlighted service fields.",
      errors: formatZodErrors(parsed.error),
    };
  }

  let updatedService: Awaited<ReturnType<typeof updateService>>;

  try {
    updatedService = await updateService(id, parsed.data);
  } catch (error) {
    return getServiceMutationState(error);
  }

  revalidatePortfolioPaths({
    serviceSlugs: [existingService.slug, updatedService.slug],
  });
  redirect("/admin/services?status=updated");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdminForMutation();

  const id = String(formData.get("id") ?? "");
  const result = await deleteService(id);

  if (result.ok) {
    revalidatePortfolioPaths({
      serviceSlugs: [result.service.slug],
    });
    redirect("/admin/services?status=deleted");
  }

  const error = result.reason === "related-projects" ? "related-projects" : "missing";
  redirect(`/admin/services?error=${error}`);
}
