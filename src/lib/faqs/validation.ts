import { z, type ZodError } from "zod";
import { faqPlacements } from "./types";
import type { FaqPlacementValue } from "./types";

const MAX_TEXT_LENGTH = 5000;

const trimmedText = (label: string, maxLength = MAX_TEXT_LENGTH) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} is too long.`);

const optionalServiceIdSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

export const faqInputSchema = z
  .object({
    question: trimmedText("Question", 240),
    answer: trimmedText("Answer", 2000),
    placement: z.enum(faqPlacements),
    serviceId: optionalServiceIdSchema,
    order: z.coerce.number().int().min(0).max(10000),
    isPublished: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.placement === "SERVICE_DETAIL" && !value.serviceId) {
      context.addIssue({
        code: "custom",
        path: ["serviceId"],
        message: "Choose a service for individual service page FAQs.",
      });
    }

    if (value.placement !== "SERVICE_DETAIL" && value.serviceId) {
      context.addIssue({
        code: "custom",
        path: ["serviceId"],
        message: "Service selection is only valid for individual service page FAQs.",
      });
    }
  });

export type FaqInput = z.infer<typeof faqInputSchema>;
export type FaqFormErrors = Record<string, string>;

export function isFaqPlacement(value: string): value is FaqPlacementValue {
  return faqPlacements.includes(value as FaqPlacementValue);
}

export function formatFaqZodErrors(error: ZodError): FaqFormErrors {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const entries = Object.entries(flattened)
    .map(([key, messages]) => [key, messages?.[0]])
    .filter((entry): entry is [string, string] => Boolean(entry[1]));

  return Object.fromEntries(entries);
}

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function formCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function parseFaqFormData(formData: FormData) {
  return faqInputSchema.safeParse({
    question: formString(formData, "question"),
    answer: formString(formData, "answer"),
    placement: formString(formData, "placement"),
    serviceId: formString(formData, "serviceId"),
    order: formString(formData, "order") || "0",
    isPublished: formCheckbox(formData, "isPublished"),
  });
}
