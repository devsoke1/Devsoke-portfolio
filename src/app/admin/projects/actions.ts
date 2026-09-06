"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdminForMutation } from "@/lib/auth/session";
import {
  RelatedServiceSelectionError,
  createProject,
  deleteProject,
  getAdminProjectById,
  updateProject,
} from "@/lib/projects/repository";
import type { FormErrors } from "@/lib/portfolio/validation";
import {
  formatZodErrors,
  parseProjectFormData,
} from "@/lib/portfolio/validation";
import { revalidatePortfolioPaths } from "@/lib/portfolio/revalidation";

export type ProjectFormState = {
  message: string;
  errors: FormErrors;
};


function getProjectMutationState(error: unknown): ProjectFormState {
  if (error instanceof RelatedServiceSelectionError) {
    return {
      message: error.message,
      errors: { serviceIds: error.message },
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        message: "A project with this slug already exists.",
        errors: { slug: "A project with this slug already exists." },
      };
    }

    if (error.code === "P2025") {
      return {
        message: "Project was not found.",
        errors: {},
      };
    }
  }

  console.error("Project mutation failed.");
  return {
    message: "Unable to save the project. Please review the form and try again.",
    errors: {},
  };
}

export async function createProjectAction(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdminForMutation();

  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      message: "Fix the highlighted project fields.",
      errors: formatZodErrors(parsed.error),
    };
  }

  let createdProject: Awaited<ReturnType<typeof createProject>>;

  try {
    createdProject = await createProject(parsed.data);
  } catch (error) {
    return getProjectMutationState(error);
  }

  revalidatePortfolioPaths({
    projectSlugs: [createdProject.slug],
    serviceSlugs: createdProject.serviceSlugs,
  });
  redirect("/admin/projects?status=created");
}

export async function updateProjectAction(
  id: string,
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdminForMutation();

  const existingProject = await getAdminProjectById(id);

  if (!existingProject) {
    return {
      message: "Project was not found.",
      errors: {},
    };
  }

  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      message: "Fix the highlighted project fields.",
      errors: formatZodErrors(parsed.error),
    };
  }

  let updatedProject: Awaited<ReturnType<typeof updateProject>>;

  try {
    updatedProject = await updateProject(id, parsed.data);
  } catch (error) {
    return getProjectMutationState(error);
  }

  revalidatePortfolioPaths({
    projectSlugs: [existingProject.slug, updatedProject.slug],
    serviceSlugs: [
      ...existingProject.serviceSlugs,
      ...updatedProject.serviceSlugs,
    ],
  });
  redirect("/admin/projects?status=updated");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdminForMutation();

  const id = String(formData.get("id") ?? "");
  const result = await deleteProject(id);

  if (result.ok) {
    revalidatePortfolioPaths({
      projectSlugs: [result.project.slug],
    });
    redirect("/admin/projects?status=deleted");
  }

  redirect("/admin/projects?error=missing");
}
