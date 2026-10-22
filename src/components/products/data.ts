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
  variantsEnabled: boolean;
  variants: CustomerProductVariant[];
};

export type CustomerProductVariant = {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  stockQuantity: number;
  imageUrl: string | null;
  isActive: boolean;
};

/** Legacy alias for ProductCard — keep components working */
export type Product = CustomerProduct;

/** Convert a DB row to a CustomerProduct DTO */
export function toCustomerProduct(p: ProductWithBrandAndCategory): CustomerProduct {
  const variants = p.variants.map((variant) => {
    const attributes = variant.attributes && typeof variant.attributes === "object" && !Array.isArray(variant.attributes)
      ? Object.fromEntries(Object.entries(variant.attributes).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
      : {};
    const price = Number(variant.price);
    const salePrice = variant.salePrice !== null ? Number(variant.salePrice) : null;
    return {
      id: variant.id,
      sku: variant.sku,
      attributes,
      price,
      salePrice,
      effectivePrice: salePrice !== null && salePrice < price ? salePrice : price,
      stockQuantity: variant.stockQuantity,
      imageUrl: variant.imageUrl,
      isActive: variant.isActive,
    };
  });
  const variantsEnabled = p.variantsEnabled;
  const parentPrice = Number(p.price);
  const parentSalePrice = p.salePrice !== null && p.salePrice !== undefined ? Number(p.salePrice) : null;
  const cheapestVariant = variantsEnabled
    ? variants.reduce<CustomerProductVariant | null>((cheapest, variant) => !cheapest || variant.effectivePrice < cheapest.effectivePrice ? variant : cheapest, null)
    : null;
  const price = cheapestVariant?.price ?? parentPrice;
  const salePrice = cheapestVariant ? cheapestVariant.salePrice : parentSalePrice;
  const effectivePrice = cheapestVariant?.effectivePrice ?? (salePrice !== null && salePrice > 0 && salePrice < price ? salePrice : price);
  const hasSale = salePrice !== null && salePrice > 0 && salePrice < price;
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
    enabled: p.enabled && (!variantsEnabled || variants.some((variant) => variant.isActive && variant.stockQuantity > 0)),
    brandId: p.brandId ?? null,
    brandName: p.brand?.name ?? null,
    categoryId: p.categoryId ?? null,
    categoryName: p.category?.name ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variantsEnabled,
    variants,
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
