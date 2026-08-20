import { z } from "zod";

export const placeOrderSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(20, "Phone number is too long"),
  house: z
    .string()
    .min(1, "House / Apartment / Building number is required")
    .max(100, "House number is too long"),
  street: z
    .string()
    .min(1, "Street name is required")
    .max(100, "Street name is too long"),
  area: z
    .string()
    .min(1, "Area / Sector / Neighborhood is required")
    .max(100, "Area is too long"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City is too long"),
  postal: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code is too long"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Delivery date must be in YYYY-MM-DD format"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(1, "Cancellation reason is required").max(300, "Reason is too long"),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  cancelReason: z.string().max(300, "Reason is too long").optional().nullable(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const getAdminOrdersSchema = z.object({
  search: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().trim().min(1).max(200).optional()
    ),
  status: z
    .preprocess(
      (val) => {
        if (val == null) return undefined;
        if (typeof val === "string") {
          const trimmed = val.trim().toUpperCase();
          if (trimmed === "" || trimmed === "ALL") return undefined;
          return trimmed;
        }
        return val;
      },
      z
        .enum(["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"])
        .optional()
    ),
  deliveryDate: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid deliveryDate format")
        .refine((value) => {
          const [year, month, day] = value.split("-").map(Number);
          if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
            return false;
          }

          const date = new Date(Date.UTC(year, month - 1, day));
          return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
          );
        }, "Invalid deliveryDate value")
        .optional()
    ),
  page: z.preprocess((val) => {
    if (val == null || val === "") return undefined;
    if (typeof val === "string") {
      if (!/^\d+$/.test(val.trim())) return Number.NaN;
      return Number(val);
    }
    return val;
  }, z.number().int().min(1).max(1000).optional()),
  limit: z.preprocess((val) => {
    if (val == null || val === "") return undefined;
    if (typeof val === "string") {
      if (!/^\d+$/.test(val.trim())) return Number.NaN;
      return Number(val);
    }
    return val;
  }, z.number().int().min(1).max(100).optional()),
});

export type GetAdminOrdersInput = z.infer<typeof getAdminOrdersSchema>;


