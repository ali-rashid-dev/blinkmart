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
  /** Numeric price — converted from Prisma Decimal */
  price: number;
  /** Single image URL stored in the DB */
  imageUrl: string | null;
  /** true = Active / visible, false = disabled / hidden */
  enabled: boolean;
  /** Brand name (resolved from relation) */
  brandName: string | null;
  /** Category name (resolved from relation) */
  categoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Legacy alias for ProductCard — keep components working */
export type Product = CustomerProduct;

/** Convert a DB row to a CustomerProduct DTO */
export function toCustomerProduct(p: ProductWithBrandAndCategory): CustomerProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? null,
    price: Number(p.price),
    imageUrl: p.imageUrl ?? null,
    enabled: p.enabled,
    brandName: p.brand?.name ?? null,
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
