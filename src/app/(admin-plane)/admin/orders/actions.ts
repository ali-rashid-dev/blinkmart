"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, isAuthError } from "@/lib/authz";
import {
  getAdminOrders,
  getAdminOrderStats,
  updateAdminOrderStatus,
  getAdminOrderDetail,
} from "@/services/order.service";
import { updateOrderStatusSchema } from "@/validations/order";
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

  try {
    const result = await getAdminOrders(params);
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
    return buildError("DATABASE_ERROR", (error as Error).message || "Failed to update order status.");
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
