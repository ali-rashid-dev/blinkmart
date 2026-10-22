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

function parseSalePrice(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;

  const trimmed = val.trim();
  if (trimmed === "") return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return Number.NaN;

  return Number(trimmed);
}

const productVariantSchema = z.object({
  id: z.string().min(1).optional(),
  sku: z.string().trim().min(1, "SKU is required").max(100).transform((value) => value.toUpperCase()),
  attributes: z.record(z.string().trim().min(1), z.string().trim().min(1))
    .refine(
      (attributes) => Object.keys(attributes).length > 0,
      "Add at least one variant attribute"
    )
    .superRefine((attributes, ctx) => {
      const keys = new Set<string>();
      for (const key of Object.keys(attributes)) {
        const normalized = key.trim().toLowerCase();
        if (keys.has(normalized)) {
          ctx.addIssue({ code: "custom", message: "Attribute names must be unique", path: [key] });
        }
        keys.add(normalized);
      }
    }),
  price: z.coerce.number().min(1, "Price must be at least Rs 1").max(10000000).multipleOf(0.01, "Price can have at most 2 decimal places"),
  salePrice: z.preprocess(
    (value) => value === "" || value === undefined ? null : value,
    z.union([z.coerce.number(), z.null()])
  ).default(null),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative").max(2147483647),
  imageUrl: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (variant) => variant.salePrice === null || (
    variant.salePrice >= 0 &&
    variant.salePrice <= 10000000 &&
    variant.salePrice < variant.price &&
    Math.round(variant.salePrice * 100) === variant.salePrice * 100
  ),
  { message: "Sale price must be between Rs 0 and the regular price (up to 2 decimal places)", path: ["salePrice"] }
);

const variantsSchema = z.array(productVariantSchema).max(100, "A product cannot have more than 100 variants")
  .superRefine((variants, ctx) => {
    const skus = new Set<string>();
    const combinations = new Set<string>();
    variants.forEach((variant, index) => {
      if (skus.has(variant.sku)) {
        ctx.addIssue({ code: "custom", message: "Each variant must have a unique SKU", path: [index, "sku"] });
      }
      skus.add(variant.sku);
      const key = Object.entries(variant.attributes)
        .map(([name, value]) => [name.trim().toLowerCase(), value.trim().toLowerCase()] as const)
        .sort(([a], [b]) => a.localeCompare(b));
      const combination = JSON.stringify(key);
      if (combinations.has(combination)) {
        ctx.addIssue({ code: "custom", message: "This attribute combination already exists", path: [index, "attributes"] });
      }
      combinations.add(combination);
    });
  });

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
        .min(1, "Price must be at least Rs 1")
        .max(10000000, "Price cannot exceed Rs 10,000,000")
    ),
  salePrice: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform(parseSalePrice)
    .refine(
      (val) => val === null || (typeof val === "number" && val >= 0 && val <= 10000000),
      { message: "Sale price must be between Rs 0 and Rs 10,000,000" }
    ),
  imageUrl: z.string().nullable().optional(),
  enabled: z.boolean().optional().default(true),
  variantsEnabled: z.boolean().optional().default(false),
  variants: variantsSchema.optional().default([]),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
}).refine(
  (product) => !product.variantsEnabled || (product.variants.length > 0 && product.variants.some((variant) => variant.isActive)),
  { message: "Add at least one active variant", path: ["variants"] }
);

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
        .min(1, "Price must be at least Rs 1")
        .max(10000000, "Price cannot exceed Rs 10,000,000")
    )
    .optional(),
  salePrice: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform(parseSalePrice)
    .refine(
      (val) => val === null || (typeof val === "number" && val >= 0 && val <= 10000000),
      { message: "Sale price must be between Rs 0 and Rs 10,000,000" }
    )
    .optional(),
  imageUrl: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  variantsEnabled: z.boolean().optional(),
  variants: variantsSchema.optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
}).refine(
  (product) => product.variantsEnabled !== true || Boolean(product.variants?.length && product.variants.some((variant) => variant.isActive)),
  { message: "Add at least one active variant", path: ["variants"] }
);

export const toggleProductStatusSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  enabled: z.boolean({ message: "Status boolean is required" }),
});

export const productQuerySchema = z.object({
  search: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
  brandId: z.string().optional().default(""),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
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
    const field = issue.path.join(".");
    if (field) {
      acc[field] = issue.message;
    }
    return acc;
  }, {});
}
