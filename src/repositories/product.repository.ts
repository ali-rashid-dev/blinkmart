import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ProductWithBrandAndCategory = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    variants: true;
  };
}>;

const productRelations = {
  brand: true,
  category: true,
  variants: { orderBy: { createdAt: "asc" as const } },
};

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
    include: { ...productRelations, variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
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
    include: { ...productRelations, variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
  });
}

export async function findCustomerProductBySlug(slug: string): Promise<ProductWithBrandAndCategory | null> {
  return prisma.product.findFirst({
    where: {
      slug: { equals: slug, mode: "insensitive" },
      ...customerProductVisibilityWhere,
    },
    include: { ...productRelations, variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
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
    include: productRelations,
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
    include: productRelations,
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
  salePrice?: number | Prisma.Decimal | null;
  imageUrl?: string | null;
  enabled?: boolean;
  variantsEnabled?: boolean;
  brandId?: string | null;
  categoryId?: string | null;
  variants?: Array<{
    sku: string;
    attributes: Record<string, string>;
    price: number;
    salePrice?: number | null;
    stockQuantity: number;
    imageUrl?: string | null;
    isActive: boolean;
  }>;
}): Promise<ProductWithBrandAndCategory> {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      price: data.price,
      salePrice: data.salePrice ?? null,
      imageUrl: data.imageUrl ?? null,
      enabled: data.enabled ?? true,
      variantsEnabled: data.variantsEnabled ?? false,
      brandId: data.brandId ?? null,
      categoryId: data.categoryId ?? null,
      variants: {
        create: (data.variants ?? []).map((variant) => ({
          ...variant,
          attributesKey: getVariantAttributesKey(variant.attributes),
        })),
      },
    },
    include: productRelations,
  });
}

export function getVariantAttributesKey(attributes: Record<string, string>): string {
  return JSON.stringify(
    Object.entries(attributes)
      .map(([key, value]) => [key.trim().toLowerCase(), value.trim().toLowerCase()] as const)
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number | Prisma.Decimal;
    salePrice?: number | Prisma.Decimal | null;
    imageUrl?: string | null;
    enabled?: boolean;
    variantsEnabled?: boolean;
    brandId?: string | null;
    categoryId?: string | null;
    variants?: Array<{
      id?: string;
      sku: string;
      attributes: Record<string, string>;
      price: number;
      salePrice?: number | null;
      stockQuantity: number;
      imageUrl?: string | null;
      isActive: boolean;
    }>;
  }
): Promise<ProductWithBrandAndCategory> {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.variantsEnabled !== undefined && { variantsEnabled: data.variantsEnabled }),
        ...(data.brandId !== undefined && { brandId: data.brandId }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
    });
    if (data.variants !== undefined) {
      const retainedIds = data.variants.flatMap((variant) => variant.id ? [variant.id] : []);
      await tx.productVariant.deleteMany({
        where: { productId: id, ...(retainedIds.length ? { id: { notIn: retainedIds } } : {}) },
      });
      for (const variantId of retainedIds) {
        const temporaryValue = `__editing_${variantId}_${Date.now()}`;
        const updated = await tx.productVariant.updateMany({
          where: { id: variantId, productId: id },
          data: { sku: temporaryValue, attributesKey: temporaryValue },
        });
        if (updated.count !== 1) {
          throw new Error("A variant being edited does not belong to this product.");
        }
      }
      for (const variant of data.variants) {
        const variantData = {
          sku: variant.sku,
          attributes: variant.attributes,
          attributesKey: getVariantAttributesKey(variant.attributes),
          price: variant.price,
          salePrice: variant.salePrice ?? null,
          stockQuantity: variant.stockQuantity,
          imageUrl: variant.imageUrl ?? null,
          isActive: variant.isActive,
        };
        if (variant.id) {
          await tx.productVariant.updateMany({
            where: { id: variant.id, productId: id },
            data: variantData,
          });
        } else {
          await tx.productVariant.create({ data: { ...variantData, productId: id } });
        }
      }
    }
    return tx.product.findUniqueOrThrow({ where: { id }, include: productRelations });
  });
}

export async function deleteProduct(id: string): Promise<ProductWithBrandAndCategory> {
  return prisma.product.delete({
    where: { id },
    include: productRelations,
  });
}

export async function toggleProductStatus(
  id: string,
  enabled: boolean
): Promise<ProductWithBrandAndCategory> {
  return prisma.product.update({
    where: { id },
    data: { enabled },
    include: productRelations,
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
