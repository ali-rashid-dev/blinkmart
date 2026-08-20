import { format, parseISO, isBefore, addDays } from "date-fns";

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
  out_for_delivery: "Your basket is on its way in tonight's 7:00 PM – 10:00 PM delivery run.",
  delivered: "Delivered safely to your address during the evening window.",
  cancelled: "Order was cancelled.",
};

export const DELIVERY_WINDOW = {
  start: "19:00",
  end: "22:00",
  label: "7:00 PM – 10:00 PM",
  cutoffHour: 17, // 5:00 PM
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
  name: string;
  price: number;
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
  deliveryFee: number;
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

export interface DeliveryDateOption {
  dateIso: string;
  label: string; // e.g. "Today, Aug 19" or "Tomorrow, Aug 20"
  isDefault: boolean;
}

/**
 * Returns available delivery dates for the fixed 7:00 PM – 10:00 PM window.
 * Cutoff is 5:00 PM (17:00).
 * If now < 5:00 PM, today is available and default.
 * If now >= 5:00 PM, today is past cutoff, so tomorrow is the earliest date available.
 */
export function getAvailableDeliveryDates(now: Date = new Date()): DeliveryDateOption[] {
  // Build an exact cutoff at cutoffHour:00:00.000 in local time
  const cutoff = new Date(now);
  cutoff.setHours(DELIVERY_WINDOW.cutoffHour, 0, 0, 0);
  const pastCutoff = !isBefore(now, cutoff);

  const options: DeliveryDateOption[] = [];

  if (!pastCutoff) {
    options.push({
      dateIso: format(now, "yyyy-MM-dd"),
      label: `Today, ${format(now, "MMM d")}`,
      isDefault: true,
    });
    const tomorrow = addDays(now, 1);
    options.push({
      dateIso: format(tomorrow, "yyyy-MM-dd"),
      label: `Tomorrow, ${format(tomorrow, "MMM d")}`,
      isDefault: false,
    });
  } else {
    const tomorrow = addDays(now, 1);
    options.push({
      dateIso: format(tomorrow, "yyyy-MM-dd"),
      label: `Tomorrow, ${format(tomorrow, "MMM d")}`,
      isDefault: true,
    });
    const dayAfter = addDays(now, 2);
    options.push({
      dateIso: format(dayAfter, "yyyy-MM-dd"),
      label: format(dayAfter, "EEEE, MMM d"),
      isDefault: false,
    });
  }

  return options;
}
