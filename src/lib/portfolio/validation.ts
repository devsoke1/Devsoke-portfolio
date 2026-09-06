import { z, type ZodError } from "zod";
import {
  serviceHomeIconNames,
  serviceIconNames,
  serviceVisualVariants,
} from "@/lib/portfolio/types";
import { isValidSlug, normalizeSlug } from "./slug";

const MAX_TEXT_LENGTH = 5000;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isUrlOrRootRelativePath(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value.length > 1;
  }

  return isHttpUrl(value);
}

const trimmedText = (label: string, maxLength = MAX_TEXT_LENGTH) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} is too long.`);

const optionalTrimmedText = (label: string, maxLength = MAX_TEXT_LENGTH) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} is too long.`);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(120, "Slug is too long.")
  .transform((value) => normalizeSlug(value))
  .refine((value) => value.length > 0 && isValidSlug(value), {
    message: "Slug must contain lowercase letters, numbers, and hyphens only.",
  });

const imagePathSchema = z
  .string()
  .trim()
  .min(1, "Image URL or path is required.")
  .max(500, "Image URL or path is too long.")
  .refine(isUrlOrRootRelativePath, {
    message: "Image must be an http(s) URL or a root-relative path.",
  });

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(500, "URL is too long.")
  .transform((value) => (value.length > 0 ? value : undefined))
  .refine((value) => value === undefined || isHttpUrl(value), {
    message: "URL must start with http:// or https://.",
  });

const stringListSchema = (label: string, min = 1) =>
  z
    .array(trimmedText(label, 240))
    .min(min, `Add at least ${min} ${label.toLowerCase()}.`)
    .max(40, `Too many ${label.toLowerCase()} entries.`);

export const serviceProcessListSchema = z
  .array(
    z.object({
      title: trimmedText("Process step title", 120),
      description: trimmedText("Process step description", 600),
    }),
  )
  .min(1, "Add at least one process step.")
  .max(12, "Too many process steps.");

export const serviceFaqListSchema = z
  .array(
    z.object({
      question: trimmedText("FAQ question", 180),
      answer: trimmedText("FAQ answer", 800),
    }),
  )
  .min(1, "Add at least one FAQ item.")
  .max(12, "Too many FAQ items.");

export const projectInputSchema = z.object({
  title: trimmedText("Title", 160),
  slug: slugSchema,
  category: trimmedText("Category", 80),
  tag: trimmedText("Tag", 120),
  desc: trimmedText("Short description", 700),
  longDesc: trimmedText("Long description", 1800),
  challenge: trimmedText("Challenge", 1400),
  solution: trimmedText("Solution", 1400),
  image: imagePathSchema,
  featuredMediaId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  tech: stringListSchema("Technology", 0),
  client: trimmedText("Client", 160),
  timeline: optionalTrimmedText("Timeline", 120),
  demoUrl: optionalHttpUrlSchema,
  order: z.coerce.number().int().min(0).max(10000),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  serviceIds: z.array(z.string().trim().min(1)).max(20),
});

export const serviceInputSchema = z.object({
  title: trimmedText("Title", 160),
  homeTitle: trimmedText("Home title", 120),
  slug: slugSchema,
  bookingService: trimmedText("Booking service", 160),
  tagline: trimmedText("Tagline", 180),
  shortDescription: trimmedText("Short description", 700),
  description: trimmedText("Description", 1600),
  overviewHeading: trimmedText("Overview heading", 180),
  overview: stringListSchema("Overview paragraph"),
  capabilities: stringListSchema("Capability"),
  technologies: stringListSchema("Technology"),
  process: serviceProcessListSchema,
  faq: serviceFaqListSchema,
  icon: z.enum(serviceIconNames),
  homeIcon: z.enum(serviceHomeIconNames),
  visualVariant: z.enum(serviceVisualVariants),
  homeGridClass: z.enum(["md:col-span-1", "md:col-span-2"]),
  order: z.coerce.number().int().min(0).max(10000),
  isPublished: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;

export type FormErrors = Record<string, string>;

export function formatZodErrors(error: ZodError): FormErrors {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const entries = Object.entries(flattened)
    .map(([key, messages]) => [key, messages?.[0]])
    .filter((entry): entry is [string, string] => Boolean(entry[1]));

  return Object.fromEntries(entries);
}

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function formStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function formPairs(formData: FormData, titleKey: string, descriptionKey: string) {
  const titles = formData.getAll(titleKey).map((value) => String(value).trim());
  const descriptions = formData.getAll(descriptionKey).map((value) => String(value).trim());
  const max = Math.max(titles.length, descriptions.length);

  return Array.from({ length: max }, (_, index) => ({
    title: titles[index] ?? "",
    description: descriptions[index] ?? "",
  })).filter((item) => item.title.length > 0 || item.description.length > 0);
}

function formFaqPairs(formData: FormData) {
  const questions = formData.getAll("faqQuestion").map((value) => String(value).trim());
  const answers = formData.getAll("faqAnswer").map((value) => String(value).trim());
  const max = Math.max(questions.length, answers.length);

  return Array.from({ length: max }, (_, index) => ({
    question: questions[index] ?? "",
    answer: answers[index] ?? "",
  })).filter((item) => item.question.length > 0 || item.answer.length > 0);
}

function formCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function parseProjectFormData(formData: FormData) {
  return projectInputSchema.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug"),
    category: formString(formData, "category"),
    tag: formString(formData, "tag"),
    desc: formString(formData, "desc"),
    longDesc: formString(formData, "longDesc"),
    challenge: formString(formData, "challenge"),
    solution: formString(formData, "solution"),
    image: formString(formData, "image"),
    featuredMediaId: formString(formData, "featuredMediaId") || null,
    tech: formStringList(formData, "tech"),
    client: formString(formData, "client"),
    timeline: formString(formData, "timeline"),
    demoUrl: formString(formData, "demoUrl"),
    order: formString(formData, "order") || "0",
    isFeatured: formCheckbox(formData, "isFeatured"),
    isPublished: formCheckbox(formData, "isPublished"),
    serviceIds: formStringList(formData, "serviceIds"),
  });
}

export function parseServiceFormData(formData: FormData) {
  return serviceInputSchema.safeParse({
    title: formString(formData, "title"),
    homeTitle: formString(formData, "homeTitle"),
    slug: formString(formData, "slug"),
    bookingService: formString(formData, "bookingService"),
    tagline: formString(formData, "tagline"),
    shortDescription: formString(formData, "shortDescription"),
    description: formString(formData, "description"),
    overviewHeading: formString(formData, "overviewHeading"),
    overview: formStringList(formData, "overview"),
    capabilities: formStringList(formData, "capabilities"),
    technologies: formStringList(formData, "technologies"),
    process: formPairs(formData, "processTitle", "processDescription"),
    faq: formFaqPairs(formData),
    icon: formString(formData, "icon"),
    homeIcon: formString(formData, "homeIcon"),
    visualVariant: formString(formData, "visualVariant"),
    homeGridClass: formString(formData, "homeGridClass"),
    order: formString(formData, "order") || "0",
    isPublished: formCheckbox(formData, "isPublished"),
  });
}
