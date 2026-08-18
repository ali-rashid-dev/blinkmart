export interface CartLine {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  maxQuantity: number;
  total: number;
  enabled: boolean;
}

export interface CartTotals {
  subtotal: number;
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
