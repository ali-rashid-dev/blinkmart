import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ProductWithBrandAndCategory = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
  };
}>;

// ──────────────────────────────────────────────────────────
//  Customer Queries — MUST respect Brand enabled status
// ──────────────────────────────────────────────────────────

/**
 * Filter condition for customer-facing product queries.
 * Only returns active products whose associated brand (if any) is enabled.
 */
export const customerProductVisibilityWhere: Prisma.ProductWhereInput = {
  enabled: true,
  OR: [
    { brandId: null },
    { brand: { enabled: true } },
  ],
};

export async function listCustomerProducts(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  take?: number;
  skip?: number;
}): Promise<ProductWithBrandAndCategory[]> {
  const searchValue = params?.search?.trim();
  const searchPredicate: Prisma.ProductWhereInput = searchValue
    ? {
        OR: [
          { name: { contains: searchValue, mode: "insensitive" as const } },
          { description: { contains: searchValue, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where: Prisma.ProductWhereInput = {
    AND: [
      customerProductVisibilityWhere,
      ...(params?.categoryId ? [{ categoryId: params.categoryId }] : []),
      ...(params?.brandId ? [{ brandId: params.brandId }] : []),
      ...(searchValue ? [searchPredicate] : []),
    ],
  };

  return prisma.product.findMany({
    where,
    include: {
      brand: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
    ...(params?.take ? { take: params.take } : {}),
    ...(params?.skip ? { skip: params.skip } : {}),
  });
}

export async function findCustomerProductById(id: string): Promise<ProductWithBrandAndCategory | null> {
  return prisma.product.findFirst({
    where: {
      id,
      ...customerProductVisibilityWhere,
    },
    include: {
      brand: true,
      category: true,
    },
  });
}

export async function findCustomerProductBySlug(slug: string): Promise<ProductWithBrandAndCategory | null> {
  return prisma.product.findFirst({
    where: {
      slug: { equals: slug, mode: "insensitive" },
      ...customerProductVisibilityWhere,
    },
    include: {
      brand: true,
      category: true,
    },
  });
}

export async function countCustomerProducts(params?: { categoryId?: string; brandId?: string }): Promise<number> {
  return prisma.product.count({
    where: {
      ...customerProductVisibilityWhere,
      ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params?.brandId ? { brandId: params.brandId } : {}),
    },
  });
}

// ──────────────────────────────────────────────────────────
//  Admin Queries — Returns all products (including disabled brands)
// ──────────────────────────────────────────────────────────
export async function listAdminProducts(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  take?: number;
  skip?: number;
}): Promise<ProductWithBrandAndCategory[]> {
  const where: Prisma.ProductWhereInput = {
    ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params?.brandId ? { brandId: params.brandId } : {}),
    ...(params?.search
      ? {
          OR: [
            { name: { contains: params.search.trim(), mode: "insensitive" } },
            { description: { contains: params.search.trim(), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return prisma.product.findMany({
    where,
    include: {
      brand: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
    ...(params?.take ? { take: params.take } : {}),
    ...(params?.skip ? { skip: params.skip } : {}),
  });
}

export async function findAdminProductById(id: string): Promise<ProductWithBrandAndCategory | null> {
  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
    },
  });
}

// ──────────────────────────────────────────────────────────
//  Product Mutations (for completeness and testing)
// ──────────────────────────────────────────────────────────
export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string | null;
  price: number | Prisma.Decimal;
  imageUrl?: string | null;
  enabled?: boolean;
  brandId?: string | null;
  categoryId?: string | null;
}): Promise<ProductWithBrandAndCategory> {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      price: data.price,
      imageUrl: data.imageUrl ?? null,
      enabled: data.enabled ?? true,
      brandId: data.brandId ?? null,
      categoryId: data.categoryId ?? null,
    },
    include: {
      brand: true,
      category: true,
    },
  });
}
