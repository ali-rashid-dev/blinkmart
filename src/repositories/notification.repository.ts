import { prisma } from "@/lib/prisma";
import type { NotificationKind as PrismaNotificationKind } from "@/generated/prisma/enums";
import type { AppNotification, NotificationKind } from "@/lib/notifications/types";

// ─── Type mapping ─────────────────────────────────────────────────────────────

const DB_KIND_TO_DOMAIN: Record<PrismaNotificationKind, NotificationKind> = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  PROMOTION: "promotion",
};

const DOMAIN_KIND_TO_DB: Record<NotificationKind, PrismaNotificationKind> = {
  placed: "PLACED",
  confirmed: "CONFIRMED",
  packed: "PACKED",
  out_for_delivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  promotion: "PROMOTION",
};

function mapToAppNotification(row: {
  id: string;
  kind: PrismaNotificationKind;
  title: string;
  body: string;
  orderId: string | null;
  read: boolean;
  createdAt: Date;
}): AppNotification {
  return {
    id: row.id,
    kind: DB_KIND_TO_DOMAIN[row.kind],
    title: row.title,
    body: row.body,
    orderId: row.orderId ?? null,
    read: row.read,
    at: row.createdAt.toISOString(),
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findNotificationsByUserId(
  userId: string
): Promise<AppNotification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      orderId: true,
      read: true,
      createdAt: true,
    },
  });
  return rows.map(mapToAppNotification);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createNotification(params: {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  orderId?: string | null;
}): Promise<AppNotification> {
  const row = await prisma.notification.create({
    data: {
      userId: params.userId,
      kind: DOMAIN_KIND_TO_DB[params.kind],
      title: params.title,
      body: params.body,
      orderId: params.orderId ?? null,
    },
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      orderId: true,
      read: true,
      createdAt: true,
    },
  });
  return mapToAppNotification(row);
}

export async function createNotificationsForMany(
  userIds: string[],
  params: {
    kind: NotificationKind;
    title: string;
    body: string;
  }
): Promise<number> {
  if (userIds.length === 0) return 0;

  const result = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      kind: DOMAIN_KIND_TO_DB[params.kind],
      title: params.title,
      body: params.body,
    })),
  });

  return result.count;
}

// ─── Mark read ────────────────────────────────────────────────────────────────

export async function markNotificationRead(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

// ─── Dismiss ──────────────────────────────────────────────────────────────────

export async function deleteNotification(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.notification.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}

// ─── Admin: recent order-event feed ──────────────────────────────────────────

export interface AdminOrderNotificationRow {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  orderId: string | null;
  createdAt: Date;
  userName: string;
}

export async function findRecentOrderNotifications(
  limit = 20
): Promise<AdminOrderNotificationRow[]> {
  const rows = await prisma.notification.findMany({
    where: {
      kind: { not: "PROMOTION" },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      orderId: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    kind: DB_KIND_TO_DOMAIN[row.kind],
    title: row.title,
    body: row.body,
    orderId: row.orderId ?? null,
    createdAt: row.createdAt,
    userName: row.user.name,
  }));
}

// ─── Admin: recent promotion campaigns ───────────────────────────────────────

export interface AdminCampaignRow {
  title: string;
  body: string;
  sentAt: Date;
  reach: number;
}

export async function findRecentCampaigns(limit = 5): Promise<AdminCampaignRow[]> {
  // Aggregate promotion notifications by title+body in the database
  const groups = await prisma.notification.groupBy({
    by: ["title", "body"],
    where: { kind: "PROMOTION" },
    _count: { _all: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: limit,
  });

  return groups.map((g) => ({
    title: g.title,
    body: g.body,
    sentAt: g._max.createdAt!,
    reach: g._count._all,
  }));
}
