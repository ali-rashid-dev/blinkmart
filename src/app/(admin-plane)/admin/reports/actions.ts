"use server";

import { requireAdmin, isAuthError } from "@/lib/authz";
import { getReportsSchema } from "@/validations/reports";
import { getReportsData } from "@/services/reports.service";
import type { RangeKey, ReportsData } from "@/lib/reports/types";

export type AdminReportsActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type AdminReportsActionError = {
  code: AdminReportsActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type AdminReportsActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AdminReportsActionError };

function buildError(
  code: AdminReportsActionErrorCode,
  message: string,
  details?: Record<string, string>
): AdminReportsActionResult<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}

export async function getAdminReportsAction(
  rangeInput: RangeKey = "7d"
): Promise<AdminReportsActionResult<ReportsData>> {
  const authCheck = await requireAdmin<AdminReportsActionErrorCode, AdminReportsActionResult<never>>(buildError);
  if (isAuthError(authCheck)) return authCheck;

  const parsed = getReportsSchema.safeParse({ range: rangeInput });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const normalizedDetails = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.join("; ") ?? "Invalid range"])
    );

    return buildError("VALIDATION_ERROR", "Invalid report range requested.", normalizedDetails);
  }

  try {
    const reports = await getReportsData(parsed.data.range);
    return { success: true, data: reports };
  } catch (error) {
    console.error("Failed to fetch admin reports:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve reporting analytics.");
  }
}
