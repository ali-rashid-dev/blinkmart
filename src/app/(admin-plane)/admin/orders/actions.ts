"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, isAuthError } from "@/lib/authz";
import { z } from "zod";
import {
  getAdminOrders,
  getAdminOrderStats,
  updateAdminOrderStatus,
  getAdminOrderDetail,
} from "@/services/order.service";
import { updateOrderStatusSchema } from "@/validations/order";
import { OrderNotFoundError } from "@/services/order.service";
import type { Order } from "@/lib/orders/types";
import type { AdminOrderStats } from "@/repositories/order.repository";

export type AdminOrderActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type AdminOrderActionError = {
  code: AdminOrderActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type AdminOrderActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AdminOrderActionError };

function buildError(
  code: AdminOrderActionErrorCode,
  message: string,
  details?: Record<string, string>
): AdminOrderActionResult<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}

export async function getAdminOrdersAction(params: {
  search?: string;
  status?: string;
  deliveryDate?: string;
  page?: number;
  limit?: number;
}): Promise<AdminOrderActionResult<{ items: Order[]; totalItems: number; totalPages: number }>> {
  const authCheck = await requireAdmin<AdminOrderActionErrorCode, AdminOrderActionResult<never>>(buildError);
  if (isAuthError(authCheck)) return authCheck;

  // Validate client-supplied params. Coerce string numbers when possible.
  const getAdminOrdersSchema = z.object({
    search: z.string().min(1).max(200).optional(),
    status: z
      .string()
      .transform((s) => s?.toUpperCase())
      .optional()
      .refine(
        (v) => v == null || v === "ALL" || ["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(v),
        { message: "Invalid status value" }
      ),
    deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid deliveryDate format").optional(),
    page: z.preprocess((val) => {
      if (typeof val === "string") return parseInt(val, 10);
      return val;
    }, z.number().int().min(1).max(1000).optional()),
    limit: z.preprocess((val) => {
      if (typeof val === "string") return parseInt(val, 10);
      return val;
    }, z.number().int().min(1).max(100).optional()),
  });

  const parsed = getAdminOrdersSchema.safeParse(params);
  if (!parsed.success) {
    return buildError(
      "VALIDATION_ERROR",
      "Invalid filters provided for orders.",
      parsed.error.flatten().fieldErrors as unknown as Record<string, string>
    );
  }

  try {
    const result = await getAdminOrders(parsed.data as any);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve orders.");
  }
}

export async function getAdminOrderStatsAction(): Promise<AdminOrderActionResult<AdminOrderStats>> {
  const authCheck = await requireAdmin<AdminOrderActionErrorCode, AdminOrderActionResult<never>>(buildError);
  if (isAuthError(authCheck)) return authCheck;

  try {
    const stats = await getAdminOrderStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Failed to fetch admin order stats:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve order statistics.");
  }
}

export async function updateAdminOrderStatusAction(params: {
  orderId: string;
  status: "PLACED" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  cancelReason?: string | null;
}): Promise<AdminOrderActionResult<Order>> {
  const authCheck = await requireAdmin<AdminOrderActionErrorCode, AdminOrderActionResult<never>>(buildError);
  if (isAuthError(authCheck)) return authCheck;

  const parsed = updateOrderStatusSchema.safeParse(params);
  if (!parsed.success) {
    return buildError(
      "VALIDATION_ERROR",
      "Invalid order status update fields.",
      parsed.error.flatten().fieldErrors as unknown as Record<string, string>
    );
  }

  try {
    const updatedOrder = await updateAdminOrderStatus(parsed.data);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${updatedOrder.code}`);
    revalidatePath("/orders");
    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Failed to update order status:", error);
    // Map known service errors to action error codes
    if (error instanceof OrderNotFoundError) {
      return buildError("NOT_FOUND", "Order not found.");
    }

    // No specific illegal-transition error type is exported by the service; skip mapping.

    // For unknown failures, return a fixed safe message to avoid leaking internals.
    return buildError("DATABASE_ERROR", "Failed to update order status.");
  }
}

export async function getAdminOrderDetailAction(orderId: string): Promise<AdminOrderActionResult<Order>> {
  const authCheck = await requireAdmin<AdminOrderActionErrorCode, AdminOrderActionResult<never>>(buildError);
  if (isAuthError(authCheck)) return authCheck;

  try {
    const order = await getAdminOrderDetail(orderId);
    if (!order) {
      return buildError("NOT_FOUND", `Order "${orderId}" not found.`);
    }
    return { success: true, data: order };
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve order details.");
  }
}
