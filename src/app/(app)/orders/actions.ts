"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getUserOrders,
  getUserOrderDetail,
  cancelUserOrder,
  reorderUserOrder,
  OrderNotFoundError,
  OrderCannotCancelError,
} from "@/services/order.service";
import { cancelOrderSchema } from "@/validations/order";
import type { Order } from "@/lib/orders/types";

export type OrderActionErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CANNOT_CANCEL"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type OrderActionError = {
  code: OrderActionErrorCode;
  message: string;
};

export type OrderActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: OrderActionError };

function buildError(code: OrderActionErrorCode, message: string): OrderActionResult<never> {
  return {
    success: false,
    error: { code, message },
  };
}

async function getAuthUserId(): Promise<string | null> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  return session?.user?.id ?? null;
}

export async function getOrdersAction(): Promise<OrderActionResult<Order[]>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in to view your orders.");
    }

    const orders = await getUserOrders(userId);
    return { success: true, data: orders };
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return buildError("DATABASE_ERROR", "Unable to retrieve orders at this time.");
  }
}

export async function getOrderByIdAction(idOrCode: string): Promise<OrderActionResult<Order>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in to view order details.");
    }

    const order = await getUserOrderDetail(userId, idOrCode);
    if (!order) {
      return buildError("NOT_FOUND", `Order "${idOrCode}" not found.`);
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
    return buildError("DATABASE_ERROR", "Unable to load order details.");
  }
}

export async function cancelOrderAction(
  orderId: string,
  reason: string
): Promise<OrderActionResult<Order>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in to cancel your order.");
    }

    const parsed = cancelOrderSchema.safeParse({ orderId, reason });
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Please select a valid cancellation reason.");
    }

    const updatedOrder = await cancelUserOrder(userId, parsed.data);
    return { success: true, data: updatedOrder };
  } catch (error) {
    if (error instanceof OrderCannotCancelError) {
      return buildError("CANNOT_CANCEL", error.message);
    }
    if (error instanceof OrderNotFoundError) {
      return buildError("NOT_FOUND", error.message);
    }
    console.error("Failed to cancel order:", error);
    return buildError("DATABASE_ERROR", "Unable to cancel order at this time.");
  }
}

export async function reorderAction(
  orderId: string
): Promise<OrderActionResult<{ itemCount: number }>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in to reorder items.");
    }

    const res = await reorderUserOrder(userId, orderId);
    return { success: true, data: res };
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return buildError("NOT_FOUND", error.message);
    }
    console.error("Failed to reorder items:", error);
    return buildError("DATABASE_ERROR", "Unable to add items from this order to your cart.");
  }
}
