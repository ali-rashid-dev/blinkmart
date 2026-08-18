"use client";

import { cartStore, useCartState } from "@/lib/cart/store";

export const cart = {
  add(id: string, qty = 1) {
    void cartStore.add(id, qty);
  },
  set(id: string, qty: number) {
    void cartStore.updateQuantity(id, qty);
  },
  get(id: string) {
    const state = cartStore.getSnapshot();
    const line = state.lines.find((l) => l.productId === id);
    return line ? line.quantity : 0;
  },
};

export function useCartQty(id: string): number {
  const state = useCartState();
  const line = state.lines.find((l) => l.productId === id);
  return line ? line.quantity : 0;
}
