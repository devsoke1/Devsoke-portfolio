import { z, type ZodError } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null));

const optionalChoice = (fallback: string, max = 80) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : fallback));

const todayIsoDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

export const inquirySubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Email address is required.")
    .max(255, "Email cannot exceed 255 characters.")
    .email("Please provide a valid email address."),
  company: optionalText(150),
  service: z
    .string()
    .trim()
    .min(2, "Please select a service.")
    .max(120, "Service name is too long."),
  budget: optionalChoice("Not sure yet"),
  timeline: optionalChoice("Not sure yet"),
  preferredDate: z
    .string()
    .trim()
    .max(50, "Date string is too long.")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : "Flexible"))
    .refine((val) => val === "Flexible" || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Use a valid discussion date or leave it flexible.",
    })
    .refine((val) => val === "Flexible" || val >= todayIsoDate(), {
      message: "Preferred discussion date cannot be in the past.",
    }),
  message: z
    .string()
    .trim()
    .max(3000, "Project description cannot exceed 3,000 characters.")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  source: z.enum(["BOOKING_MODAL", "CONTACT_PAGE"]).default("BOOKING_MODAL"),
  projectContext: optionalText(200),
  entryPath: optionalText(500),
  referrer: optionalText(500),
  ctaLabel: optionalText(160),
  ctaLocation: optionalText(160),
  submissionToken: optionalText(120).refine(
    (val) => !val || /^[A-Za-z0-9_.:-]{8,120}$/.test(val),
    {
      message: "Invalid submission token.",
    }
  ),
  // Honeypot field - must be empty
  website: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 0, {
      message: "Spam detected",
    }),
  // Render timestamp for bot speed check
  _t: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (!val) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
});

export type InquirySubmissionInput = z.infer<typeof inquirySubmissionSchema>;

export const updateInquiryStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "CONTACTED", "COMPLETED", "ARCHIVED"]),
});

export const updateInquiryNotesSchema = z.object({
  notes: z.string().max(5000, "Notes cannot exceed 5,000 characters.").nullable(),
});

export type FormErrors = Record<string, string>;

export function formatZodErrors(error: ZodError): FormErrors {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const entries = Object.entries(flattened)
    .map(([key, messages]) => [key, messages?.[0]])
    .filter((entry): entry is [string, string] => Boolean(entry[1]));

  return Object.fromEntries(entries);
}
