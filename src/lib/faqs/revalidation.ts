import "server-only";

import { revalidatePath } from "next/cache";
import type { AdminFaq } from "./types";

export function revalidateFaqPaths(faq?: Pick<AdminFaq, "service" | "placement"> | null) {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/services");
  revalidatePath("/contact");
  revalidatePath("/services/[slug]", "page");

  if (faq?.placement === "SERVICE_DETAIL" && faq.service?.slug) {
    revalidatePath(`/services/${faq.service.slug}`);
  }
}
