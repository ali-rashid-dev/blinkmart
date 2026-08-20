import { z } from "zod";

export function isRealCalendarDate(value: string): boolean {
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
}

const trimmedString = (max: number, requiredMessage: string, tooLongMessage: string) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(1, requiredMessage).max(max, tooLongMessage)
  );

export const placeOrderSchema = z.object({
  fullName: trimmedString(100, "Full name is required", "Full name is too long"),
  phone: trimmedString(20, "Phone number is required", "Phone number is too long"),
  house: trimmedString(
    100,
    "House / Apartment / Building number is required",
    "House number is too long"
  ),
  street: trimmedString(100, "Street name is required", "Street name is too long"),
  area: trimmedString(100, "Area / Sector / Neighborhood is required", "Area is too long"),
  city: trimmedString(100, "City is required", "City is too long"),
  postal: trimmedString(20, "Postal code is required", "Postal code is too long"),
  notes: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable()
  ),
  deliveryDate: z
    .preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Delivery date must be in YYYY-MM-DD format")
        .refine((value) => isRealCalendarDate(value), "Delivery date must be a real calendar date")
    ),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(1, "Cancellation reason is required").max(300, "Reason is too long"),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const updateOrderStatusSchema = z
  .object({
    orderId: z.string().min(1, "Order ID is required"),
    status: z.enum(["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
    cancelReason: z.string().max(300, "Reason is too long").optional().nullable(),
    currentStatus: z
      .enum(["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"])
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.currentStatus) return;

    const currentIndex = ["placed", "confirmed", "packed", "out_for_delivery", "delivered"].indexOf(
      value.currentStatus
    );
    const requestedIndex = ["placed", "confirmed", "packed", "out_for_delivery", "delivered"].indexOf(
      value.status.toLowerCase().replace(/_/g, "_")
    );

    if (value.status === "CANCELLED") return;

    if (currentIndex === -1 || requestedIndex === -1 || requestedIndex < currentIndex) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Status ${value.status} is not allowed from ${value.currentStatus}.`,
      });
    }
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
        .refine((value) => isRealCalendarDate(value), "Invalid deliveryDate value")
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


