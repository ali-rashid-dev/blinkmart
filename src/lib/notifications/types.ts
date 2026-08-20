import { formatDistanceToNow, parseISO } from "date-fns";

// ─── Domain types ────────────────────────────────────────────────────────────

export type NotificationKind =
  | "placed"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "promotion";

export type NotificationFilter = "all" | "unread" | "orders" | "promotion";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  orderId?: string | null;
  read: boolean;
  at: string; // ISO string
}

// ─── UI metadata ─────────────────────────────────────────────────────────────

export const KIND_LABEL: Record<NotificationKind, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  promotion: "Promotion",
};

export const KIND_STYLE: Record<NotificationKind, string> = {
  placed:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  packed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  out_for_delivery:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  delivered:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
  cancelled:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  promotion:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

// ─── Filter helpers ───────────────────────────────────────────────────────────

export function matchesFilter(
  notification: AppNotification,
  filter: NotificationFilter
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return !notification.read;
    case "orders":
      return notification.kind !== "promotion";
    case "promotion":
      return notification.kind === "promotion";
  }
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatRelative(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return isoString;
  }
}
