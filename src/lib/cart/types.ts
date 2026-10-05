export interface CartLine {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  effectivePrice?: number;
  discountPercent?: number;
  originalTotal?: number;
  quantity: number;
  unit: string;
  image: string;
  maxQuantity: number;
  total: number;
  enabled: boolean;
}

export interface CartTotals {
  subtotal: number;
  originalSubtotal: number;
  discountAmount: number;
  discountPercent: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface CartState {
  status: "idle" | "loading" | "success" | "error";
  lines: CartLine[];
  totals: CartTotals;
  pending: Record<string, "update" | "remove">;
  errorMessage?: string;
}
