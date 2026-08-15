import { z } from "zod";

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

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? slugify(val) : undefined)),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable()
    .optional(),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .pipe(
      z
        .number()
        .positive("Price must be greater than 0")
        .max(100000, "Price is too high")
    ),
  imageUrl: z.string().nullable().optional(),
  enabled: z.boolean().optional().default(true),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});

export const updateProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z
    .string()
    .trim()
    .min(1, "Product name cannot be empty")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? slugify(val) : undefined)),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable()
    .optional(),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .pipe(
      z
        .number()
        .positive("Price must be greater than 0")
        .max(100000, "Price is too high")
    )
    .optional(),
  imageUrl: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});

export const toggleProductStatusSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  enabled: z.boolean({ message: "Status boolean is required" }),
});

export const productQuerySchema = z.object({
  search: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
  brandId: z.string().optional().default(""),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  stock: z.enum(["all", "in-stock", "out-of-stock"]).optional().default("all"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ToggleProductStatusInput = z.infer<typeof toggleProductStatusSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;

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
