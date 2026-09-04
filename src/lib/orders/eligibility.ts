export const FREE_DELIVERY_THRESHOLD = 3000;
export const DEFAULT_DELIVERY_FEE = 100;
export const PLATFORM_FEE = 20;

export function calculateDeliveryFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= 3000) return 0;
  if (subtotal >= 2000) return 40;
  if (subtotal >= 1000) return 70;
  return 100;
}

export function calculatePlatformFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return PLATFORM_FEE;
}

export function calculateOrderTotals(subtotal: number) {
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const deliveryFee = calculateDeliveryFee(roundedSubtotal);
  const platformFee = calculatePlatformFee(roundedSubtotal);
  const total = Math.round((roundedSubtotal + deliveryFee + platformFee) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    deliveryFee,
    platformFee,
    total,
  };
}

export function getNextDeliveryTier(subtotal: number): {
  nextThreshold: number;
  amountNeeded: number;
  isFree: boolean;
  nextFee: number;
} | null {
  if (subtotal <= 0) {
    return null;
  }
  if (subtotal >= 3000) {
    return { nextThreshold: 3000, amountNeeded: 0, isFree: true, nextFee: 0 };
  }
  if (subtotal >= 2000) {
    const amountNeeded = Math.round((3000 - subtotal) * 100) / 100;
    return { nextThreshold: 3000, amountNeeded, isFree: true, nextFee: 0 };
  }
  if (subtotal >= 1000) {
    const amountNeeded = Math.round((2000 - subtotal) * 100) / 100;
    return { nextThreshold: 2000, amountNeeded, isFree: false, nextFee: 40 };
  }
  const amountNeeded = Math.round((1000 - subtotal) * 100) / 100;
  return { nextThreshold: 1000, amountNeeded, isFree: false, nextFee: 70 };
}

export function filterOrderableCartItems<T extends { product: { enabled: boolean; brand?: { enabled?: boolean } | null } }>(items: T[]): T[] {
  return items.filter((item) => item.product.enabled && (!item.product.brand || item.product.brand.enabled));
}

