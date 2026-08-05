import { z } from "zod";

// ──────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const optionalImageUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .refine(
    (val) => {
      if (val === null) return true;
      try { new URL(val); return true; } catch { return false; }
    },
    { message: "Image must be a valid URL" }
  );

// ──────────────────────────────────────────────────────────
//  Create
// ──────────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  imageUrl: optionalImageUrl,
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ──────────────────────────────────────────────────────────
//  Update
// ──────────────────────────────────────────────────────────
export const updateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case")
    .max(120, "Slug must be at most 120 characters")
    .optional(),
  imageUrl: optionalImageUrl.optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ──────────────────────────────────────────────────────────
//  Admin query
// ──────────────────────────────────────────────────────────
export const categoryQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  sortBy: z.enum(["name-asc", "name-desc", "created-desc", "created-asc", "sort-order"]).optional().default("sort-order"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;

// ──────────────────────────────────────────────────────────
//  Customer query (no pagination needed — small list)
// ──────────────────────────────────────────────────────────
export const customerCategoryQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type CustomerCategoryQueryParams = z.infer<typeof customerCategoryQuerySchema>;

// ──────────────────────────────────────────────────────────
//  Field error extractor
// ──────────────────────────────────────────────────────────
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
