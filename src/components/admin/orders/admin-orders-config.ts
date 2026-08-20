import type { ElementType } from "react";
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import type { OrderStatus } from "@/lib/orders/types";

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: ElementType;
  }
> = {
  placed: {
    label: "Placed",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
    icon: CheckCircle2,
  },
  packed: {
    label: "Packed",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    icon: PackageCheck,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    icon: XCircle,
  },
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "packed",
  packed: "out_for_delivery",
  out_for_delivery: "delivered",
};

export const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  placed: "Confirm Order",
  confirmed: "Mark Packed",
  packed: "Dispatch Order",
  out_for_delivery: "Mark Delivered",
};

export const DB_STATUS_MAP: Record<
  OrderStatus,
  "PLACED" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
> = {
  placed: "PLACED",
  confirmed: "CONFIRMED",
  packed: "PACKED",
  out_for_delivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

export function sanitizeOrderUpdateError(error?: { message?: string; code?: string }): string {
  const allowedCodes = new Set(["NOT_FOUND", "VALIDATION_ERROR", "UNKNOWN_ERROR"]);
  const allowedMessages = [
    "Order not found.",
    "Order cannot be cancelled in status ",
    "Invalid delivery date",
    "Invalid order status update fields.",
    "An unexpected error occurred while updating order status.",
    "Failed to update order status.",
  ];

  const message = typeof error?.message === "string" ? error.message.trim() : "";
  const code = typeof error?.code === "string" ? error.code : "";

  if (code && allowedCodes.has(code)) {
    return message || "Failed to update order status.";
  }

  if (message && allowedMessages.some((allowed) => message === allowed || message.startsWith(allowed))) {
    return message;
  }

  return "Failed to update order status.";
}
