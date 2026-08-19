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
  deliveryDate: z.string().min(10, "Delivery date is required"),
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

