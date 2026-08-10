import prisma from "@/lib/prisma";
import type { BrandQueryParams, CustomerBrandQueryParams } from "@/validations/brand";

// ──────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────
export type BrandRecord = {
  id: string;
  name: string;
  origin: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    products: number;
  };
};

export type CustomerBrandRecord = {
  id: string;
  name: string;
  origin: string | null;
  _count?: {
    products: number;
  };
};

// ──────────────────────────────────────────────────────────
//  Writes
// ──────────────────────────────────────────────────────────
export async function createBrand(data: {
  name: string;
  origin?: string | null;
  enabled?: boolean;
}): Promise<BrandRecord> {
  return prisma.brand.create({
    data: {
      name: data.name,
      origin: data.origin ?? null,
      enabled: data.enabled ?? true,
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function updateBrand(
  id: string,
  data: {
    name?: string;
    origin?: string | null;
    enabled?: boolean;
  }
): Promise<BrandRecord> {
  return prisma.brand.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.origin !== undefined && { origin: data.origin }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function deleteBrand(id: string): Promise<BrandRecord> {
  return prisma.brand.delete({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function toggleBrandStatus(
  id: string,
  enabled: boolean
): Promise<BrandRecord> {
  return prisma.brand.update({
    where: { id },
    data: { enabled },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

// ──────────────────────────────────────────────────────────
//  Reads
// ──────────────────────────────────────────────────────────
export async function findBrandById(id: string): Promise<BrandRecord | null> {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function findBrandByName(name: string): Promise<BrandRecord | null> {
  return prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function checkDuplicateBrandName(name: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.brand.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function countProductsByBrand(brandId: string): Promise<number> {
  return prisma.product.count({
    where: { brandId },
  });
}

// ──────────────────────────────────────────────────────────
//  Admin listing (Returns enabled and disabled brands)
// ──────────────────────────────────────────────────────────
export async function listBrands(params: BrandQueryParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const skip = (page - 1) * limit;

  const statusWhere =
    params.status === "enabled"
      ? { enabled: true }
      : params.status === "disabled"
      ? { enabled: false }
      : {};

  const searchWhere =
    params.search && params.search.trim() !== ""
      ? {
          OR: [
            { name: { contains: params.search.trim(), mode: "insensitive" as const } },
            { origin: { contains: params.search.trim(), mode: "insensitive" as const } },
          ],
        }
      : {};

  const whereClause = { ...statusWhere, ...searchWhere };

  type OrderBy = { name?: "asc" | "desc"; createdAt?: "asc" | "desc" };
  const orderByMap: Record<string, OrderBy> = {
    "name-asc": { name: "asc" },
    "name-desc": { name: "desc" },
    "created-desc": { createdAt: "desc" },
    "created-asc": { createdAt: "asc" },
  };
  const orderBy = orderByMap[params.sortBy ?? "created-desc"] ?? { createdAt: "desc" };

  const [items, totalItems] = await Promise.all([
    prisma.brand.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.brand.count({ where: whereClause }),
  ]);

  return { items, totalItems };
}

// ──────────────────────────────────────────────────────────
//  Customer listing (enabled only)
// ──────────────────────────────────────────────────────────
export async function listCustomerBrands(
  params?: CustomerBrandQueryParams
): Promise<CustomerBrandRecord[]> {
  const searchWhere =
    params?.search && params.search.trim() !== ""
      ? { name: { contains: params.search.trim(), mode: "insensitive" as const } }
      : {};

  return prisma.brand.findMany({
    where: { enabled: true, ...searchWhere },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      origin: true,
      _count: {
        select: { products: true },
      },
    },
  });
}
