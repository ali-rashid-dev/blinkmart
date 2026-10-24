"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import {
  createAdBanner,
  updateAdBanner,
  deleteAdBanner,
  listAdBanners,
  getAdBannerById,
  getActiveAdBanner,
  type AdBannerRecord,
} from "@/repositories/ad-banner.repository";
import { deleteUploadThingFile } from "@/lib/uploadthing-server";
import {
  createAdBannerSchema,
  updateAdBannerSchema,
  toggleAdBannerSchema,
  type CreateAdBannerInput,
} from "@/validations/ad-banner";

// ──────────────────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────────────────
export type AdBannerActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BANNER_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type AdBannerActionError = {
  code: AdBannerActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type AdBannerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AdBannerActionError };

// ──────────────────────────────────────────────────────────
//  Internal helpers
// ──────────────────────────────────────────────────────────
function buildError<T = never>(
  code: AdBannerActionErrorCode,
  message: string,
  details?: Record<string, string>
): AdBannerActionResult<T> {
  return { success: false, error: { code, message, details } };
}

const requireBannerAdmin = () =>
  requireAdmin<AdBannerActionErrorCode, AdBannerActionResult<never>>(buildError);

// ──────────────────────────────────────────────────────────
//  Reads (also callable from server components)
// ──────────────────────────────────────────────────────────

/** Lists all ad banners for the admin panel. Admin only. */
export async function adminListAdBanners(): Promise<
  AdBannerActionResult<AdBannerRecord[]>
> {
  const auth = await requireBannerAdmin();
  if ("success" in auth && !auth.success) return auth;

  try {
    const banners = await listAdBanners();
    return { success: true, data: banners };
  } catch (error) {
    console.error("[AdBanner] Failed to list banners:", error);
    return buildError("DATABASE_ERROR", "Failed to load banners.");
  }
}

/** Fetches the currently active ad banner. Safe to call from any server context. */
export async function fetchActiveAdBanner(): Promise<AdBannerRecord | null> {
  try {
    return await getActiveAdBanner();
  } catch (error) {
    console.error("[AdBanner] Failed to fetch active banner:", error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────
//  Writes
// ──────────────────────────────────────────────────────────

/** Creates a new ad banner. Admin only. */
export async function adminCreateAdBanner(
  input: CreateAdBannerInput
): Promise<AdBannerActionResult<AdBannerRecord>> {
  const auth = await requireBannerAdmin();
  if ("success" in auth && !auth.success) return auth;

  const parsed = createAdBannerSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.reduce<Record<string, string>>(
      (acc, issue) => {
        const field = issue.path[0];
        if (typeof field === "string") acc[field] = issue.message;
        return acc;
      },
      {}
    );
    return buildError("VALIDATION_ERROR", "Invalid input.", details);
  }

  try {
    const banner = await createAdBanner(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true, data: banner };
  } catch (error) {
    console.error("[AdBanner] Failed to create banner:", error);
    return buildError("DATABASE_ERROR", "Failed to create banner. Please try again.");
  }
}

/** Updates an existing ad banner. Admin only. */
export async function adminUpdateAdBanner(input: {
  id: string;
  imageUrl?: string;
  altText?: string;
  linkUrl?: string | null;
  isEnabled?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}): Promise<AdBannerActionResult<AdBannerRecord>> {
  const auth = await requireBannerAdmin();
  if ("success" in auth && !auth.success) return auth;

  const parsed = updateAdBannerSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.reduce<Record<string, string>>(
      (acc, issue) => {
        const field = issue.path[0];
        if (typeof field === "string") acc[field] = issue.message;
        return acc;
      },
      {}
    );
    return buildError("VALIDATION_ERROR", "Invalid input.", details);
  }

  try {
    const existing = await getAdBannerById(parsed.data.id);
    if (!existing) return buildError("BANNER_NOT_FOUND", "Banner not found.");

    const { id, ...rest } = parsed.data;
    const updated = await updateAdBanner(id, rest);
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[AdBanner] Failed to update banner:", error);
    return buildError("DATABASE_ERROR", "Failed to update banner. Please try again.");
  }
}

/** Toggles the enabled state of a banner. Admin only. */
export async function adminToggleAdBanner(input: {
  id: string;
  isEnabled: boolean;
}): Promise<AdBannerActionResult<AdBannerRecord>> {
  const auth = await requireBannerAdmin();
  if ("success" in auth && !auth.success) return auth;

  const parsed = toggleAdBannerSchema.safeParse(input);
  if (!parsed.success) {
    return buildError("VALIDATION_ERROR", "Invalid input.");
  }

  try {
    const existing = await getAdBannerById(parsed.data.id);
    if (!existing) return buildError("BANNER_NOT_FOUND", "Banner not found.");

    const updated = await updateAdBanner(parsed.data.id, {
      isEnabled: parsed.data.isEnabled,
    });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[AdBanner] Failed to toggle banner:", error);
    return buildError("DATABASE_ERROR", "Failed to update banner status.");
  }
}

/** Deletes an ad banner and removes its image from UploadThing. Admin only. */
export async function adminDeleteAdBanner(
  id: string
): Promise<AdBannerActionResult<{ id: string }>> {
  const auth = await requireBannerAdmin();
  if ("success" in auth && !auth.success) return auth;

  if (!id) return buildError("VALIDATION_ERROR", "Banner ID is required.");

  try {
    const existing = await getAdBannerById(id);
    if (!existing) return buildError("BANNER_NOT_FOUND", "Banner not found.");

    await deleteAdBanner(id);
    // Best-effort cleanup — don't block on failure
    await deleteUploadThingFile(existing.imageUrl);

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true, data: { id } };
  } catch (error) {
    console.error("[AdBanner] Failed to delete banner:", error);
    return buildError("DATABASE_ERROR", "Failed to delete banner. Please try again.");
  }
}
