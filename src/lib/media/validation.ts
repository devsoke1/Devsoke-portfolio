import { z } from "zod";

export const updateMediaAltSchema = z.object({
  alt: z
    .string()
    .max(300, "Alt text must not exceed 300 characters.")
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
});

export type UpdateMediaAltValues = z.infer<typeof updateMediaAltSchema>;

