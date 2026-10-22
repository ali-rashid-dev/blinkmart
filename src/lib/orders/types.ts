import { format, parseISO } from "date-fns";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const LIFECYCLE: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_HINT: Record<OrderStatus, string> = {
  placed: "We received your order and are processing it.",
  confirmed: "Store confirmed your order and items are being assigned.",
  packed: "Items have been picked and carefully packed for delivery.",
  out_for_delivery: "Your basket is on its way to your address.",
  delivered: "Your order has been delivered safely to your address.",
  cancelled: "Order was cancelled.",
};

export const DELIVERY_TIMEFRAME = {
  hours: 24,
  label: "Within 24 hours",
};

export interface OrderAddress {
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  postal: string;
  notes?: string | null;
}

export interface OrderItem {
  productId: string;
  variantId?: string | null;
  sku?: string | null;
  variantAttributes?: Record<string, string>;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  placedAt: string;
  deliveryDate: string;
  deliverySlot: string;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  subtotal: number;
  originalSubtotal?: number;
  discountAmount?: number;
  discountPercent?: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  address: OrderAddress;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
}

export function canCancel(order: Order): boolean {
  if (order.status === "cancelled" || order.status === "delivered" || order.status === "out_for_delivery") {
    return false;
  }
  return true;
}

export function formatDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch {
    return isoString;
  }
}

export function formatDeliveryDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "EEEE, MMM d");
  } catch {
    return dateString;
  }
}

export function getDeliveryDeadline(now: Date = new Date()): Date {
  return new Date(now.getTime() + DELIVERY_TIMEFRAME.hours * 60 * 60 * 1000);
}

export function formatDeliveryDeadline(isoString: string): string {
  try {
    return format(parseISO(isoString), "MMM d, yyyy 'by' h:mm a");
  } catch {
    return isoString;
  }
}
