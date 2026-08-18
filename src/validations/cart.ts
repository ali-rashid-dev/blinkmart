import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Maximum quantity per item is 99")
    .default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartQuantitySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative")
    .max(99, "Maximum quantity per item is 99"),
});

export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;

export const removeFromCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

export function getCartFieldErrors(
  schema: z.ZodSchema,
  data: unknown
): Record<string, string> {
  const result = schema.safeParse(data);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
