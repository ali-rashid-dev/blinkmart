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
import { updateOrderStatusSchema, getAdminOrdersSchema } from "@/validations/order";
import {
  OrderNotFoundError,
  EmptyCartError,
  InvalidDeliveryDateError,
} from "@/services/order.service";
import { OrderCannotCancelError, InsufficientInventoryError } from "@/services/order.errors";
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

  const parsed = getAdminOrdersSchema.safeParse(params);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const normalizedDetails = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.join("; ") ?? "Invalid value"])
    );

    return buildError("VALIDATION_ERROR", "Invalid filters provided for orders.", normalizedDetails);
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
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const normalizedDetails = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.join("; ") ?? "Invalid value"])
    );

    return buildError("VALIDATION_ERROR", "Invalid order status update fields.", normalizedDetails);
  }

  try {
    const updatedOrder = await updateAdminOrderStatus(parsed.data);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${updatedOrder.code}`);
    revalidatePath("/orders");
    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Failed to update order status:", error);

    if (error instanceof OrderNotFoundError) {
      return buildError("NOT_FOUND", "Order not found.");
    }
    if (error instanceof OrderCannotCancelError) {
      return buildError("VALIDATION_ERROR", error.message);
    }
    if (error instanceof InsufficientInventoryError) {
      return buildError("VALIDATION_ERROR", error.message);
    }
    if (error instanceof InvalidDeliveryDateError) {
      return buildError("VALIDATION_ERROR", error.message);
    }
    if (error instanceof EmptyCartError) {
      return buildError("VALIDATION_ERROR", error.message);
    }

    return buildError("UNKNOWN_ERROR", "An unexpected error occurred while updating order status.");
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
