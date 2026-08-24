"use client";

import { useSyncExternalStore } from "react";
import type { CartLine, CartState, CartTotals } from "./types";
import {
  getCartAction,
  addToCartAction,
  updateCartQuantityAction,
  removeFromCartAction,
  clearCartAction,
} from "@/app/(app)/cart/actions";

export type PendingKind = "update" | "remove";

const initialState: CartState = {
  status: "idle",
  lines: [],
  totals: {
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  },
  pending: {},
};

let currentState: CartState = initialState;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(updater: (prev: CartState) => CartState) {
  currentState = updater(currentState);
  emitChange();
}

let isInitialLoading = false;

export const cartStore = {
  getSnapshot(): CartState {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async load(force = false) {
    if (currentState.status === "loading" && !force) return;
    if (currentState.status === "success" && !force) return;
    if (isInitialLoading && !force) return;

    isInitialLoading = true;
    updateState((prev) => ({ ...prev, status: "loading", errorMessage: undefined }));

    const res = await getCartAction();
    isInitialLoading = false;

    if (res.success) {
      updateState(() => ({
        status: "success",
        lines: res.data.lines,
        totals: res.data.totals,
        pending: {},
      }));
    } else {
      updateState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: res.error.message,
      }));
    }
  },

  async add(productId: string, quantity = 1) {
    // Optimistic item count update if item exists
    updateState((prev) => {
      const existing = prev.lines.find((l) => l.productId === productId);
      if (existing) {
        return {
          ...prev,
          pending: { ...prev.pending, [productId]: "update" },
        };
      }
      return { ...prev };
    });

    const res = await addToCartAction({ productId, quantity });

    if (res.success) {
      updateState(() => ({
        status: "success",
        lines: res.data.lines,
        totals: res.data.totals,
        pending: {},
      }));
    } else {
      updateState((prev) => {
        const nextPending = { ...prev.pending };
        delete nextPending[productId];
        return { ...prev, pending: nextPending, errorMessage: res.error.message };
      });
      throw new Error(res.error.message);
    }
  },

  async updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.remove(productId);
    }

    updateState((prev) => ({
      ...prev,
      pending: { ...prev.pending, [productId]: "update" },
    }));

    const res = await updateCartQuantityAction({ productId, quantity });

    if (res.success) {
      updateState(() => ({
        status: "success",
        lines: res.data.lines,
        totals: res.data.totals,
        pending: {},
      }));
    } else {
      updateState((prev) => {
        const nextPending = { ...prev.pending };
        delete nextPending[productId];
        return { ...prev, pending: nextPending, errorMessage: res.error.message };
      });
    }
  },

  async remove(productId: string) {
    updateState((prev) => ({
      ...prev,
      pending: { ...prev.pending, [productId]: "remove" },
    }));

    const res = await removeFromCartAction(productId);

    if (res.success) {
      updateState(() => ({
        status: "success",
        lines: res.data.lines,
        totals: res.data.totals,
        pending: {},
      }));
    } else {
      updateState((prev) => {
        const nextPending = { ...prev.pending };
        delete nextPending[productId];
        return { ...prev, pending: nextPending, errorMessage: res.error.message };
      });
    }
  },

  async clear() {
    updateState((prev) => ({ ...prev, status: "loading" }));
    const res = await clearCartAction();

    if (res.success) {
      updateState(() => ({
        status: "success",
        lines: res.data.lines,
        totals: res.data.totals,
        pending: {},
      }));
    } else {
      updateState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: res.error.message,
      }));
    }
  },
};

export function useCartState(): CartState {
  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getSnapshot
  );
}

export function useCartCount(): number {
  const state = useCartState();
  return state.totals.itemCount;
}

export function cartTotals(lines: CartLine[]): CartTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (const line of lines) {
    if (line.enabled) {
      subtotal += line.price * line.quantity;
      itemCount += line.quantity;
    }
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const tax = 0;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { subtotal, tax, total, itemCount };
}

import { formatCurrency } from "@/lib/currency";

export function formatPrice(amount: number): string {
  return formatCurrency(amount);
}
