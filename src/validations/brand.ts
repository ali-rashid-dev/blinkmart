import { z } from "zod";

const optionalOrigin = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .refine(
    (val) => {
      if (val === null) return true;
      return val.length <= 100;
    },
    { message: "Origin must be at most 100 characters" }
  );

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be at most 100 characters"),
  origin: optionalOrigin,
  enabled: z.boolean().optional().default(true),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = z.object({
  id: z.string().min(1, "Brand ID is required"),
  name: z
    .string()
    .trim()
    .min(1, "Brand name cannot be empty")
    .max(100, "Brand name must be at most 100 characters")
    .optional(),
  origin: optionalOrigin.optional(),
  enabled: z.boolean().optional(),
});

export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export const toggleBrandStatusSchema = z.object({
  id: z.string().min(1, "Brand ID is required"),
  enabled: z.boolean({ message: "Enabled status is required" }),
});

export type ToggleBrandStatusInput = z.infer<typeof toggleBrandStatusSchema>;

export const brandQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "enabled", "disabled"]).optional().default("all"),
  sortBy: z.enum(["name-asc", "name-desc", "created-desc", "created-asc"]).optional().default("created-desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
});

export type BrandQueryParams = z.infer<typeof brandQuerySchema>;

export const customerBrandQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type CustomerBrandQueryParams = z.infer<typeof customerBrandQuerySchema>;

export function getFieldErrors<TSchema extends z.ZodTypeAny>(schema: TSchema, values: unknown) {
  const result = schema.safeParse(values);

  if (result.success) {
    return {} as Record<string, string>;
  }

  return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
    const field = issue.path[0];

    if (typeof field === "string") {
      acc[field] = issue.message;
    }

    return acc;
  }, {});
}
