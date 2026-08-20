"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  placeOrder,
  EmptyCartError,
  InvalidDeliveryDateError,
  InsufficientInventoryError,
} from "@/services/order.service";
import { placeOrderSchema, type PlaceOrderInput } from "@/validations/order";
import type { Order } from "@/lib/orders/types";

export type OrderActionErrorCode =
  | "UNAUTHORIZED"
  | "EMPTY_CART"
  | "INVALID_DELIVERY_DATE"
  | "INSUFFICIENT_INVENTORY"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type OrderActionError = {
  code: OrderActionErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type OrderActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: OrderActionError };

function buildError(
  code: OrderActionErrorCode,
  message: string,
  fieldErrors?: Record<string, string>
): OrderActionResult<never> {
  return {
    success: false,
    error: {
      code,
      message,
      fieldErrors,
    },
  };
}

export async function placeOrderAction(
  input: PlaceOrderInput
): Promise<OrderActionResult<Order>> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user?.id) {
      return buildError("UNAUTHORIZED", "Please sign in to place an order.");
    }

    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      return buildError("VALIDATION_ERROR", "Please fill in all required fields correctly.", fieldErrors);
    }

    const order = await placeOrder(session.user.id, parsed.data);
    return { success: true, data: order };
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return buildError("EMPTY_CART", error.message);
    }
    if (error instanceof InvalidDeliveryDateError) {
      return buildError("INVALID_DELIVERY_DATE", error.message);
    }
    if (error instanceof InsufficientInventoryError) {
      return buildError("INSUFFICIENT_INVENTORY", error.message);
    }
    console.error("Failed to place order:", error);
    return buildError("DATABASE_ERROR", "Something went wrong while placing your order. Please try again.");
  }
}
