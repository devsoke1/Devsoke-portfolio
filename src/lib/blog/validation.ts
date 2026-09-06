import { z, type ZodError } from "zod";

export const blogSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeBlogSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export const blogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long.")
    .max(200, "Title cannot exceed 200 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters long.")
    .max(200, "Slug cannot exceed 200 characters.")
    .regex(blogSlugRegex, "Slug may only contain lowercase alphanumeric characters and hyphens."),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters long.")
    .max(50, "Category cannot exceed 50 characters."),
  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters long.")
    .max(1000, "Summary cannot exceed 1000 characters."),
  content: z
    .string()
    .trim()
    .min(20, "Article content must be at least 20 characters long."),
  image: z
    .string()
    .trim()
    .min(1, "Cover image URL or asset path is required.")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
      "Image must be a valid HTTP(S) URL or local path starting with '/'"
    ),
  author: z
    .string()
    .trim()
    .min(2, "Author must be at least 2 characters long.")
    .max(100, "Author cannot exceed 100 characters."),
  readTime: z
    .string()
    .trim()
    .min(3, "Read time is required.")
    .max(50, "Read time cannot exceed 50 characters."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featuredMediaId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  publishedAt: z.string().optional().nullable(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export type FormErrors = Record<string, string[] | undefined>;

export function formatZodErrors(error: ZodError): FormErrors {
  return error.flatten().fieldErrors as Record<string, string[] | undefined>;
}

