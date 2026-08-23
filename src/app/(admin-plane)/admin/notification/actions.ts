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

    // Runtime validation: trim and enforce length limits
    const headline = (input.headline ?? "").trim();
    const body = (input.body ?? "").trim();
    const audience = input.audience;

    if (!headline) {
      return buildError("VALIDATION_ERROR", "Headline is required.");
    }
    if (headline.length > 48) {
      return buildError("VALIDATION_ERROR", "Headline must be 48 characters or fewer.");
    }
    if (!body) {
      return buildError("VALIDATION_ERROR", "Campaign message body is required.");
    }
    if (body.length > 140) {
      return buildError("VALIDATION_ERROR", "Campaign message body must be 140 characters or fewer.");
    }
    if (!["all", "active", "lapsed"].includes(audience)) {
      return buildError("VALIDATION_ERROR", "Invalid audience selection.");
    }

    const result = await sendPromotionCampaign({ headline, body, audience });

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
