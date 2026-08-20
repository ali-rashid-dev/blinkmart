"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
} from "@/services/notification.service";
import type { AppNotification } from "@/lib/notifications/types";

export type NotificationActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

function buildError(code: string, message: string): NotificationActionResult<never> {
  return { success: false, error: { code, message } };
}

async function getAuthUserId(): Promise<string | null> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  return session?.user?.id ?? null;
}

export async function getNotificationsAction(): Promise<NotificationActionResult<AppNotification[]>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in to view notifications.");
    }

    const notifications = await getUserNotifications(userId);
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return buildError("DATABASE_ERROR", "Unable to retrieve notifications.");
  }
}

export async function markReadAction(id: string): Promise<NotificationActionResult<boolean>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in.");
    }

    const success = await markNotificationAsRead(id, userId);
    return { success: true, data: success };
  } catch (error) {
    console.error("Failed to mark notification read:", error);
    return buildError("DATABASE_ERROR", "Unable to mark notification as read.");
  }
}

export async function markAllReadAction(): Promise<NotificationActionResult<void>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in.");
    }

    await markAllNotificationsAsRead(userId);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to mark all notifications read:", error);
    return buildError("DATABASE_ERROR", "Unable to mark notifications as read.");
  }
}

export async function dismissNotificationAction(id: string): Promise<NotificationActionResult<boolean>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return buildError("UNAUTHORIZED", "Please sign in.");
    }

    const success = await dismissNotification(id, userId);
    return { success: true, data: success };
  } catch (error) {
    console.error("Failed to dismiss notification:", error);
    return buildError("DATABASE_ERROR", "Unable to dismiss notification.");
  }
}
