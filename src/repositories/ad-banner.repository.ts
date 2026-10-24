import prisma from "@/lib/prisma";

// ──────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────
export type AdBannerRecord = {
  id: string;
  imageUrl: string;
  altText: string;
  linkUrl: string | null;
  isEnabled: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

// ──────────────────────────────────────────────────────────
//  Reads
// ──────────────────────────────────────────────────────────

/** Returns the first banner that is enabled and currently within its schedule. */
export async function getActiveAdBanner(): Promise<AdBannerRecord | null> {
  const now = new Date();
  return prisma.adBanner.findFirst({
    where: {
      isEnabled: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Returns all banners (for admin listing). */
export async function listAdBanners(): Promise<AdBannerRecord[]> {
  return prisma.adBanner.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/** Returns a single banner by ID. */
export async function getAdBannerById(
  id: string
): Promise<AdBannerRecord | null> {
  return prisma.adBanner.findUnique({ where: { id } });
}

// ──────────────────────────────────────────────────────────
//  Writes
// ──────────────────────────────────────────────────────────
export async function createAdBanner(data: {
  imageUrl: string;
  altText?: string;
  linkUrl?: string | null;
  isEnabled?: boolean;
  startDate: Date;
  endDate: Date;
}): Promise<AdBannerRecord> {
  return prisma.adBanner.create({
    data: {
      imageUrl: data.imageUrl,
      altText: data.altText ?? "Advertisement",
      linkUrl: data.linkUrl ?? null,
      isEnabled: data.isEnabled ?? false,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
}

export async function updateAdBanner(
  id: string,
  data: Partial<{
    imageUrl: string;
    altText: string;
    linkUrl: string | null;
    isEnabled: boolean;
    startDate: Date;
    endDate: Date;
  }>
): Promise<AdBannerRecord> {
  return prisma.adBanner.update({ where: { id }, data });
}

export async function deleteAdBanner(id: string): Promise<AdBannerRecord> {
  return prisma.adBanner.delete({ where: { id } });
}
