import {
  createNotification,
  createNotificationsForMany,
  findNotificationsByUserId,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  findRecentOrderNotifications,
  findRecentCampaigns,
  type AdminOrderNotificationRow,
  type AdminCampaignRow,
} from "@/repositories/notification.repository";
import prisma from "@/lib/prisma";
import type { AppNotification, NotificationKind } from "@/lib/notifications/types";
import type { Order } from "@/lib/orders/types";

// ─── Status Messages Mapping ──────────────────────────────────────────────────

const STATUS_NOTIFICATION_CONFIG: Record<
  string,
  { kind: NotificationKind; title: (code: string) => string; body: (code: string) => string }
> = {
  placed: {
    kind: "placed",
    title: (code) => `Order Placed #${code}`,
    body: (code) => `We received your order #${code} and are processing it.`,
  },
  confirmed: {
    kind: "confirmed",
    title: (code) => `Order Confirmed #${code}`,
    body: (code) => `Your order #${code} has been confirmed by the store.`,
  },
  packed: {
    kind: "packed",
    title: (code) => `Order Packed #${code}`,
    body: (code) => `Your order #${code} has been picked and packed for delivery.`,
  },
  out_for_delivery: {
    kind: "out_for_delivery",
    title: (code) => `Out for Delivery #${code}`,
    body: (code) => `Your order #${code} is on its way in tonight's delivery run.`,
  },
  delivered: {
    kind: "delivered",
    title: (code) => `Order Delivered #${code}`,
    body: (code) => `Your order #${code} has been delivered successfully.`,
  },
  cancelled: {
    kind: "cancelled",
    title: (code) => `Order Cancelled #${code}`,
    body: (code) => `Your order #${code} was cancelled.`,
  },
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Triggered automatically when an order's status changes.
 */
export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  orderCode: string,
  newStatus: string
): Promise<AppNotification | null> {
  const config = STATUS_NOTIFICATION_CONFIG[newStatus.toLowerCase()];
  if (!config) return null;

  return createNotification({
    userId,
    kind: config.kind,
    title: config.title(orderCode),
    body: config.body(orderCode),
    orderId,
  });
}

/**
 * Sends a promotional campaign to the target audience.
 */
export async function sendPromotionCampaign(params: {
  headline: string;
  body: string;
  audience: "all" | "active" | "lapsed";
}): Promise<{ reach: number }> {
  let targetUserIds: string[] = [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (params.audience === "all") {
    const users = await prisma.user.findMany({ select: { id: true } });
    targetUserIds = users.map((u) => u.id);
  } else if (params.audience === "active") {
    // Users with orders in last 30 days
    const activeUsers = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    });
    targetUserIds = activeUsers.map((u) => u.userId);
  } else if (params.audience === "lapsed") {
    // Users with orders before 30 days ago AND no orders in last 30 days
    const recentUserIds = (
      await prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { userId: true },
        distinct: ["userId"],
      })
    ).map((u) => u.userId);

    const lapsedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: recentUserIds },
        orders: { some: {} },
      },
      select: { id: true },
    });
    targetUserIds = lapsedUsers.map((u) => u.id);
  }

  const reach = await createNotificationsForMany(targetUserIds, {
    kind: "promotion",
    title: params.headline,
    body: params.body,
  });

  return { reach };
}

/**
 * Gets all notifications for a specific user.
 */
export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  return findNotificationsByUserId(userId);
}

/**
 * Marks a notification as read for a user.
 */
export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  return markNotificationRead(id, userId);
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  return markAllNotificationsRead(userId);
}

/**
 * Dismisses/deletes a notification for a user.
 */
export async function dismissNotification(id: string, userId: string): Promise<boolean> {
  return deleteNotification(id, userId);
}

/**
 * Admin: Get recent order notification feed.
 */
export async function getAdminOrderNotificationsFeed(): Promise<AdminOrderNotificationRow[]> {
  return findRecentOrderNotifications();
}

/**
 * Admin: Get recent campaign history.
 */
export async function getAdminCampaignsFeed(): Promise<AdminCampaignRow[]> {
  return findRecentCampaigns();
}
