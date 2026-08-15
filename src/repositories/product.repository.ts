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
  enabled?: boolean;
  take?: number;
  skip?: number;
}): Promise<ProductWithBrandAndCategory[]> {
  const searchValue = params?.search?.trim();
  const searchPredicate: Prisma.ProductWhereInput = searchValue
    ? {
        OR: [
          { name: { contains: searchValue, mode: "insensitive" } },
          { description: { contains: searchValue, mode: "insensitive" } },
          { slug: { contains: searchValue, mode: "insensitive" } },
          { brand: { name: { contains: searchValue, mode: "insensitive" } } },
        ],
      }
    : {};

  const where: Prisma.ProductWhereInput = {
    AND: [
      ...(params?.categoryId ? [{ categoryId: params.categoryId }] : []),
      ...(params?.brandId ? [{ brandId: params.brandId }] : []),
      ...(params?.enabled !== undefined ? [{ enabled: params.enabled }] : []),
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

export async function countAdminProducts(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  enabled?: boolean;
}): Promise<number> {
  const searchValue = params?.search?.trim();
  const searchPredicate: Prisma.ProductWhereInput = searchValue
    ? {
        OR: [
          { name: { contains: searchValue, mode: "insensitive" } },
          { description: { contains: searchValue, mode: "insensitive" } },
          { slug: { contains: searchValue, mode: "insensitive" } },
          { brand: { name: { contains: searchValue, mode: "insensitive" } } },
        ],
      }
    : {};

  const where: Prisma.ProductWhereInput = {
    AND: [
      ...(params?.categoryId ? [{ categoryId: params.categoryId }] : []),
      ...(params?.brandId ? [{ brandId: params.brandId }] : []),
      ...(params?.enabled !== undefined ? [{ enabled: params.enabled }] : []),
      ...(searchValue ? [searchPredicate] : []),
    ],
  };

  return prisma.product.count({ where });
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

export async function checkDuplicateProductSlug(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.product.findFirst({
    where: {
      slug: { equals: slug, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

// ──────────────────────────────────────────────────────────
//  Product Mutations
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

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number | Prisma.Decimal;
    imageUrl?: string | null;
    enabled?: boolean;
    brandId?: string | null;
    categoryId?: string | null;
  }
): Promise<ProductWithBrandAndCategory> {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.brandId !== undefined && { brandId: data.brandId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
    include: {
      brand: true,
      category: true,
    },
  });
}

export async function deleteProduct(id: string): Promise<ProductWithBrandAndCategory> {
  return prisma.product.delete({
    where: { id },
    include: {
      brand: true,
      category: true,
    },
  });
}

export async function toggleProductStatus(
  id: string,
  enabled: boolean
): Promise<ProductWithBrandAndCategory> {
  return prisma.product.update({
    where: { id },
    data: { enabled },
    include: {
      brand: true,
      category: true,
    },
  });
}

export async function getAdminProductStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  const [total, active, inactive] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { enabled: true } }),
    prisma.product.count({ where: { enabled: false } }),
  ]);

  return { total, active, inactive };
}

