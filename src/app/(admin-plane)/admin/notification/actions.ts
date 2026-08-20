"use server";

import { requireAdmin, type AuthActionResult } from "@/lib/authz";
import {
  sendPromotionCampaign,
  getAdminOrderNotificationsFeed,
  getAdminCampaignsFeed,
} from "@/services/notification.service";
import type { AdminOrderNotificationRow, AdminCampaignRow } from "@/repositories/notification.repository";

export type AdminNotificationActionError = {
  code: string;
  message: string;
};

export type AdminNotificationResult<T> =
  | { success: true; data: T }
  | { success: false; error: AdminNotificationActionError };

function buildError(code: string, message: string): AdminNotificationResult<never> {
  return { success: false, error: { code, message } };
}

export async function sendPromotionAction(input: {
  headline: string;
  body: string;
  audience: "all" | "active" | "lapsed";
}): Promise<AdminNotificationResult<{ reach: number }>> {
  try {
    const authCheck = await requireAdmin(buildError);
    if (!("userId" in authCheck)) return authCheck;

    if (!input.headline || !input.headline.trim()) {
      return buildError("VALIDATION_ERROR", "Headline is required.");
    }
    if (!input.body || !input.body.trim()) {
      return buildError("VALIDATION_ERROR", "Campaign message body is required.");
    }

    const result = await sendPromotionCampaign({
      headline: input.headline.trim(),
      body: input.body.trim(),
      audience: input.audience,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send promotion campaign:", error);
    return buildError("DATABASE_ERROR", "Failed to dispatch campaign notifications.");
  }
}

export async function getAdminOrderFeedAction(): Promise<
  AdminNotificationResult<AdminOrderNotificationRow[]>
> {
  try {
    const authCheck = await requireAdmin(buildError);
    if (!("userId" in authCheck)) return authCheck;

    const feed = await getAdminOrderNotificationsFeed();
    return { success: true, data: feed };
  } catch (error) {
    console.error("Failed to fetch admin order notification feed:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve order notifications.");
  }
}

export async function getAdminCampaignsAction(): Promise<
  AdminNotificationResult<AdminCampaignRow[]>
> {
  try {
    const authCheck = await requireAdmin(buildError);
    if (!("userId" in authCheck)) return authCheck;

    const campaigns = await getAdminCampaignsFeed();
    return { success: true, data: campaigns };
  } catch (error) {
    console.error("Failed to fetch admin campaigns:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve campaign history.");
  }
}
