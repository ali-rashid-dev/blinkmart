import prisma from "@/lib/prisma";

export type ProfileRecord = {
  id: string;
  userId: string;
  phone: string | null;
  houseNo: string | null;
  street: string | null;
  area: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getUserWithProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
}

function isUniqueConstraintError(error: unknown) {
  return (
    Boolean(error) &&
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function ensureProfileForUser(userId: string): Promise<ProfileRecord> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        return tx.userProfile.upsert({
          where: { userId },
          create: { userId },
          update: { updatedAt: new Date() },
        });
      });
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Unable to ensure profile exists after retries");
}

export async function updateUserProfile(userId: string, data: {
  name: string;
  phone?: string | null;
  houseNo?: string | null;
  street?: string | null;
  area?: string | null;
  city?: string | null;
  postalCode?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
    });

    const updatedProfile = await tx.userProfile.update({
      where: { id: profile.id },
      data: {
        phone: data.phone ?? null,
        houseNo: data.houseNo ?? null,
        street: data.street ?? null,
        area: data.area ?? null,
        city: data.city ?? null,
        postalCode: data.postalCode ?? null,
      },
    });

    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  });
}
