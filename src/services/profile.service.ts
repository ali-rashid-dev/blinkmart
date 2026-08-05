import { getUserWithProfile, ensureProfileForUser, updateUserProfile } from "@/repositories/profile.repository";
import {
  updateProfileSchema,
  profileDataSchema,
  type ProfileData,
  type ProfileUpdateInput,
} from "@/validations/profile";

export { profileDataSchema, type ProfileData };

export async function getProfileForUser(userId: string): Promise<ProfileData> {
  const user = await getUserWithProfile(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const profile = user.profile ?? (await ensureProfileForUser(userId));

  return {
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    role: user.role,
    phone: profile.phone ?? null,
    houseNo: profile.houseNo ?? null,
    street: profile.street ?? null,
    area: profile.area ?? null,
    city: profile.city ?? null,
    postalCode: profile.postalCode ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    memberSince: user.createdAt,
  };
}

export async function updateProfileForUser(userId: string, input: ProfileUpdateInput): Promise<ProfileData> {
  // Input is validated by the caller (actions) — avoid throwing raw ZodError here.
  const result = await updateUserProfile(userId, {
    name: input.name,
    phone: input.phone,
    houseNo: input.houseNo,
    street: input.street,
    area: input.area,
    city: input.city,
    postalCode: input.postalCode,
  });

  return {
    name: result.user.name,
    email: result.user.email,
    emailVerified: result.user.emailVerified,
    image: result.user.image ?? null,
    role: result.user.role,
    phone: result.profile.phone ?? null,
    houseNo: result.profile.houseNo ?? null,
    street: result.profile.street ?? null,
    area: result.profile.area ?? null,
    city: result.profile.city ?? null,
    postalCode: result.profile.postalCode ?? null,
    createdAt: result.profile.createdAt,
    updatedAt: result.profile.updatedAt,
    memberSince: result.user.createdAt,
  };
}
