export const FREE_DELIVERY_THRESHOLD = 30;
export const DEFAULT_DELIVERY_FEE = 2.99;

export function filterOrderableCartItems<T extends { product: { enabled: boolean; brand?: { enabled?: boolean } | null } }>(items: T[]): T[] {
  return items.filter((item) => item.product.enabled && (!item.product.brand || item.product.brand.enabled));
}
