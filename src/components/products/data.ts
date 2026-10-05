import type { ProductWithBrandAndCategory } from "@/repositories/product.repository";

/**
 * CustomerProduct is the shape passed to customer-facing UI components.
 * Derived from the real Prisma Product model — no invented fields.
 */
export type CustomerProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Numeric price (regular MRP) — converted from Prisma Decimal */
  price: number;
  /** Numeric sale price (discounted price) if active */
  salePrice: number | null;
  /** Active effective price to charge (salePrice if < price, else price) */
  effectivePrice: number;
  /** Calculated discount percentage (e.g. 20 for 20%) */
  discountPercent: number;
  /** Single image URL stored in the DB */
  imageUrl: string | null;
  /** true = Active / visible, false = disabled / hidden */
  enabled: boolean;
  /** Brand ID */
  brandId?: string | null;
  /** Brand name (resolved from relation) */
  brandName: string | null;
  /** Category ID */
  categoryId?: string | null;
  /** Category name (resolved from relation) */
  categoryName: string | null;
  /** Optional expiry timestamp for deal presentation. */
  dealExpiresAt?: Date | string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Legacy alias for ProductCard — keep components working */
export type Product = CustomerProduct;

/** Convert a DB row to a CustomerProduct DTO */
export function toCustomerProduct(p: ProductWithBrandAndCategory): CustomerProduct {
  const price = Number(p.price);
  const salePrice = p.salePrice !== null && p.salePrice !== undefined ? Number(p.salePrice) : null;
  const hasSale = salePrice !== null && salePrice > 0 && salePrice < price;
  const effectivePrice = hasSale ? salePrice : price;
  const discountPercent = hasSale ? Math.round(((price - salePrice) / price) * 100) : 0;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? null,
    price,
    salePrice,
    effectivePrice,
    discountPercent,
    imageUrl: p.imageUrl ?? null,
    enabled: p.enabled,
    brandId: p.brandId ?? null,
    brandName: p.brand?.name ?? null,
    categoryId: p.categoryId ?? null,
    categoryName: p.category?.name ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** Placeholder — populated dynamically from the DB */
export const categories: { id: string; label: string }[] = [];

/** Placeholder array — components fetch real data server-side */
export const products: CustomerProduct[] = [];

export function getProductBySlug(slug: string): CustomerProduct | undefined {
  return undefined;
}

export function getRelatedProducts(
  _product: CustomerProduct,
  _limit: number
): CustomerProduct[] {
  return [];
}
