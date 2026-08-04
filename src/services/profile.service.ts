import { getUserWithProfile, ensureProfileForUser, updateUserProfile } from "@/repositories/profile.repository";
import { updateProfileSchema, type ProfileUpdateInput } from "@/lib/validations/profile";

export type ProfileData = {
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  phone: string | null;
  houseNo: string | null;
  street: string | null;
  area: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberSince: Date;
};

export async function getProfileForUser(userId: string): Promise<ProfileData> {
  const user = await getUserWithProfile(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const profile = user.profile ?? (await ensureProfileForUser(userId));

  return {
    name: user.name,
    email: user.email,
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
  const parsedInput = updateProfileSchema.parse(input);

  const result = await updateUserProfile(userId, {
    name: parsedInput.name,
    phone: parsedInput.phone,
    houseNo: parsedInput.houseNo,
    street: parsedInput.street,
    area: parsedInput.area,
    city: parsedInput.city,
    postalCode: parsedInput.postalCode,
  });

  return {
    name: result.user.name,
    email: result.user.email,
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
