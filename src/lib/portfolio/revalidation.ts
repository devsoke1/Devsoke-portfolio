import "server-only";

import { revalidatePath } from "next/cache";

type PortfolioRevalidationInput = {
  projectSlugs?: string[];
  serviceSlugs?: string[];
};

export function revalidatePortfolioPaths(input: PortfolioRevalidationInput = {}) {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/work");
  revalidatePath("/services");

  revalidatePath("/work/[slug]", "page");
  revalidatePath("/services/[slug]", "page");

  for (const slug of input.projectSlugs ?? []) {
    revalidatePath(`/work/${slug}`);
  }

  for (const slug of input.serviceSlugs ?? []) {
    revalidatePath(`/services/${slug}`);
  }
}
