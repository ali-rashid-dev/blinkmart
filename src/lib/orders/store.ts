"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import type { Order } from "./types";
import {
  getOrdersAction,
  getOrderByIdAction,
  cancelOrderAction,
  reorderAction,
} from "@/app/(app)/orders/actions";
import { cartStore } from "@/lib/cart/store";
import { toast } from "sonner";

export interface OrdersState {
  loading: boolean;
  orders: Order[] | null;
  error: string | null;
  pendingIds: string[];
}

let currentState: OrdersState = {
  loading: false,
  orders: null,
  error: null,
  pendingIds: [],
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(updater: (prev: OrdersState) => OrdersState) {
  currentState = updater(currentState);
  emitChange();
}

let isInitialLoading = false;

export const ordersStore = {
  getSnapshot(): OrdersState {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async load(force = false) {
    if (currentState.loading && !force) return;
    if (currentState.orders !== null && !force) return;
    if (isInitialLoading && !force) return;

    isInitialLoading = true;
    updateState((prev) => ({ ...prev, loading: true, error: null }));

    const res = await getOrdersAction();
    isInitialLoading = false;

    if (res.success) {
      updateState((prev) => ({
        ...prev,
        loading: false,
        orders: res.data,
        error: null,
      }));
    } else {
      updateState((prev) => ({
        ...prev,
        loading: false,
        orders: prev.orders ?? [],
        error: res.error.message,
      }));
    }
  },

  async cancel(orderId: string, reason: string): Promise<boolean> {
    updateState((prev) => ({
      ...prev,
      pendingIds: [...prev.pendingIds, orderId],
    }));

    const res = await cancelOrderAction(orderId, reason);

    updateState((prev) => ({
      ...prev,
      pendingIds: prev.pendingIds.filter((id) => id !== orderId),
    }));

    if (res.success) {
      toast.success("Order cancelled successfully");
        updateState((prev) => ({
          ...prev,
          orders: prev.orders ? prev.orders.map((o) => (o.id === orderId ? res.data : o)) : null,
        }));
      return true;
    } else {
      toast.error("Failed to cancel order", { description: res.error.message });
      return false;
    }
  },

  async reorder(orderId: string): Promise<boolean> {
    updateState((prev) => ({
      ...prev,
      pendingIds: [...prev.pendingIds, orderId],
    }));

    const res = await reorderAction(orderId);

    updateState((prev) => ({
      ...prev,
      pendingIds: prev.pendingIds.filter((id) => id !== orderId),
    }));

    if (res.success) {
      toast.success("Items added to your cart", {
        description: `Reordered ${res.data.itemCount} items into your cart.`,
      });
      void cartStore.load(true);
      return true;
    } else {
      toast.error("Failed to reorder", { description: res.error.message });
      return false;
    }
  },
};

export function useOrdersState(): {
  orders: Order[] | null;
  loading: boolean;
  error: string | null;
  pendingIds: string[];
  retry: () => void;
} {
  const state = useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.getSnapshot,
    ordersStore.getSnapshot
  );

  return {
    orders: state.orders,
    loading: state.loading,
    error: state.error,
    pendingIds: state.pendingIds,
    retry: () => void ordersStore.load(true),
  };
}

export function useOrder(idOrCode: string): {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const state = useOrdersState();

  // If already in list store, find it
  const cachedOrder = state.orders?.find((o) => o.id === idOrCode || o.code === idOrCode) ?? null;

  const [order, setOrder] = useState<Order | null>(cachedOrder);
  const [loading, setLoading] = useState<boolean>(() => (!cachedOrder ? state.loading : false));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrder(cachedOrder);
  }, [cachedOrder]);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      if (cachedOrder) {
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      const res = await getOrderByIdAction(idOrCode);
      if (cancelled) return;
      if (res.success) {
        setOrder(res.data);
      } else {
        // Distinguish genuine load errors from not-found (return null)
        setError(res.error?.message ?? "Failed to load order");
        setOrder(null);
      }
      setLoading(false);
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [idOrCode, cachedOrder]);

  return {
    order,
    loading,
    error,
    refetch: () => {
      void ordersStore.load(true);
      // also re-fetch single order
      void getOrderByIdAction(idOrCode).then((res) => {
        if (res.success) setOrder(res.data);
      });
    },
  };
}

export function formatMoney(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
