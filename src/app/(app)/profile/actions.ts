"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getProfileForUser, updateProfileForUser, type ProfileData } from "@/services/profile.service";
import { getFieldErrors, updateProfileSchema, type ProfileUpdateInput } from "@/lib/validations/profile";

export type ProfileActionErrorCode = "UNAUTHORIZED" | "VALIDATION_ERROR" | "DATABASE_ERROR" | "UNKNOWN_ERROR";

export type ProfileActionError = {
  code: ProfileActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type ProfileActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ProfileActionError };

async function getSessionUserId() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  return session?.user?.id ?? null;
}

function buildError(code: ProfileActionErrorCode, message: string, details?: Record<string, string>): ProfileActionResult<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export async function getProfile(): Promise<ProfileActionResult<ProfileData>> {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return buildError("UNAUTHORIZED", "You must be signed in to view your profile.");
    }

    const profile = await getProfileForUser(userId);

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Failed to load profile", error);

    return buildError("DATABASE_ERROR", "Unable to load your profile right now.");
  }
}

export async function updateProfile(input: ProfileUpdateInput & {
  phone?: string;
  houseNo?: string;
  street?: string;
  area?: string;
  city?: string;
  postalCode?: string;
}): Promise<ProfileActionResult<ProfileData>> {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return buildError("UNAUTHORIZED", "You must be signed in to update your profile.");
    }

    const parsed = updateProfileSchema.safeParse(input);

    if (!parsed.success) {
      const normalizedInput = {
        name: input.name,
        phone: input.phone,
        houseNo: input.houseNo,
        street: input.street,
        area: input.area,
        city: input.city,
        postalCode: input.postalCode,
      };

      return buildError("VALIDATION_ERROR", "Please correct the validation errors below.", getFieldErrors(updateProfileSchema, normalizedInput));
    }

    const profile = await updateProfileForUser(userId, parsed.data);

    revalidatePath("/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Failed to update profile", error);

    return buildError("DATABASE_ERROR", "Unable to update your profile right now.");
  }
}
