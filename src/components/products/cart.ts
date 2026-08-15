"use client";

import { useState, useEffect } from "react";

const cartStore = new Map<string, number>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const cart = {
  add(id: string, qty: number) {
    const current = cartStore.get(id) || 0;
    cartStore.set(id, current + qty);
    notify();
  },
  set(id: string, qty: number) {
    if (qty <= 0) cartStore.delete(id);
    else cartStore.set(id, qty);
    notify();
  },
  get(id: string) {
    return cartStore.get(id) || 0;
  },
};

export function useCartQty(id: string): number {
  const [qty, setQty] = useState(() => cartStore.get(id) || 0);
  useEffect(() => {
    const update = () => setQty(cartStore.get(id) || 0);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, [id]);
  return qty;
}
