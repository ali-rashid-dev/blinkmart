"use client";

import { useState, useEffect, useSyncExternalStore, useRef } from "react";
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
  byId: Record<string, Order>;
  error: string | null;
  pendingIds: string[];
}

let currentState: OrdersState = {
  loading: false,
  orders: null,
  byId: {},
  error: null,
  pendingIds: [],
};

const listeners = new Set<() => void>();

function getOrderRevision(order: Order): number {
  const timestamps = [new Date(order.placedAt).getTime(), ...order.timeline.map((entry) => new Date(entry.at).getTime())];

  if (order.cancelledAt) {
    timestamps.push(new Date(order.cancelledAt).getTime());
  }

  return timestamps.reduce((latest, timestamp) => Math.max(latest, timestamp), 0);
}

function shouldAcceptOrderUpdate(existing: Order | null, incoming: Order): boolean {
  if (!existing) return true;
  return getOrderRevision(incoming) >= getOrderRevision(existing);
}

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
      updateState((prev) => {
        const nextById: Record<string, Order> = {};
        const nextOrders: Order[] = [];

        for (const incoming of res.data) {
          const existingOrder =
            prev.byId[incoming.id] ??
            prev.byId[incoming.code] ??
            prev.orders?.find((existing) => existing.id === incoming.id || existing.code === incoming.code) ??
            null;

          if (!shouldAcceptOrderUpdate(existingOrder, incoming)) {
            continue;
          }

          nextById[incoming.id] = incoming;
          nextById[incoming.code] = incoming;
          nextOrders.push(incoming);
        }

        return {
          ...prev,
          loading: false,
          orders: nextOrders,
          byId: nextById,
          error: null,
        };
      });
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

    try {
      const res = await cancelOrderAction(orderId, reason);

      if (res.success) {
        toast.success("Order cancelled successfully");
        updateState((prev) => {
          const nextById = { ...prev.byId, [res.data.id]: res.data, [res.data.code]: res.data };

          return {
            ...prev,
            orders: prev.orders ? prev.orders.map((o) => (o.id === orderId ? res.data : o)) : prev.orders,
            byId: nextById,
          };
        });
        return true;
      } else {
        toast.error("Failed to cancel order", { description: res.error.message });
        return false;
      }
    } catch (err) {
      toast.error("Failed to cancel order");
      return false;
    } finally {
      updateState((prev) => ({
        ...prev,
        pendingIds: prev.pendingIds.filter((id) => id !== orderId),
      }));
    }
  },

  async reorder(orderId: string): Promise<boolean> {
    updateState((prev) => ({
      ...prev,
      pendingIds: [...prev.pendingIds, orderId],
    }));

    try {
      const res = await reorderAction(orderId);

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
    } catch (err) {
      toast.error("Failed to reorder");
      return false;
    } finally {
      updateState((prev) => ({
        ...prev,
        pendingIds: prev.pendingIds.filter((id) => id !== orderId),
      }));
    }
  },
};

export function useOrdersState(): {
  orders: Order[] | null;
  byId: Record<string, Order>;
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
    byId: state.byId,
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

  // If already in list or per-id store, find it
  const cachedOrder = state.byId[idOrCode] ?? state.orders?.find((o) => o.id === idOrCode || o.code === idOrCode) ?? null;

  const [order, setOrder] = useState<Order | null>(cachedOrder);
  const [loading, setLoading] = useState<boolean>(() => (!cachedOrder ? state.loading : false));
  const [error, setError] = useState<string | null>(null);
  const detailRequestIdRef = useRef(0);

  useEffect(() => {
    setOrder(cachedOrder);
  }, [cachedOrder]);

  useEffect(() => {
    const currentRequestId = ++detailRequestIdRef.current;
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
      if (cancelled || currentRequestId !== detailRequestIdRef.current) return;
      if (res.success) {
        const nextOrder = res.data;
        const currentOrder = cachedOrder ?? state.byId[nextOrder.id] ?? state.orders?.find((existing) => existing.id === nextOrder.id || existing.code === nextOrder.code) ?? null;

        if (!shouldAcceptOrderUpdate(currentOrder, nextOrder)) {
          setLoading(false);
          return;
        }

        updateState((prev) => {
          const existingOrder = prev.byId[nextOrder.id] ?? prev.byId[nextOrder.code] ?? prev.orders?.find((existing) => existing.id === nextOrder.id || existing.code === nextOrder.code) ?? null;
          if (!shouldAcceptOrderUpdate(existingOrder, nextOrder)) {
            return prev;
          }

          const nextById = { ...prev.byId, [nextOrder.id]: nextOrder, [nextOrder.code]: nextOrder };
          const nextOrders = prev.orders
            ? prev.orders.map((existing) =>
                existing.id === nextOrder.id || existing.code === nextOrder.code ? nextOrder : existing
              )
            : prev.orders;

          return {
            ...prev,
            byId: nextById,
            orders: nextOrders,
          };
        });
        setOrder(nextOrder);
      } else {
        // Distinguish genuine load errors from not-found (return null)
        setError(res.error?.message ?? "Failed to load order");
        setOrder(null);
      }
      setLoading(false);
    }

    void fetch();
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
      const currentRequestId = ++detailRequestIdRef.current;
      setLoading(true);
      setError(null);

      void getOrderByIdAction(idOrCode)
        .then((res) => {
          if (currentRequestId !== detailRequestIdRef.current) return;
          if (res.success) {
            const nextOrder = res.data;
            const currentOrder = cachedOrder ?? state.byId[nextOrder.id] ?? state.orders?.find((existing) => existing.id === nextOrder.id || existing.code === nextOrder.code) ?? null;

            if (!shouldAcceptOrderUpdate(currentOrder, nextOrder)) {
              setLoading(false);
              return;
            }

            updateState((prev) => {
              const existingOrder = prev.byId[nextOrder.id] ?? prev.byId[nextOrder.code] ?? prev.orders?.find((existing) => existing.id === nextOrder.id || existing.code === nextOrder.code) ?? null;
              if (!shouldAcceptOrderUpdate(existingOrder, nextOrder)) {
                return prev;
              }

              const nextById = { ...prev.byId, [nextOrder.id]: nextOrder, [nextOrder.code]: nextOrder };
              const nextOrders = prev.orders
                ? prev.orders.map((existing) =>
                    existing.id === nextOrder.id || existing.code === nextOrder.code ? nextOrder : existing
                  )
                : prev.orders;

              return {
                ...prev,
                byId: nextById,
                orders: nextOrders,
              };
            });
            setOrder(nextOrder);
            setError(null);
          } else {
            setError(res.error?.message ?? "Failed to load order");
            setOrder(null);
          }
          setLoading(false);
        })
        .catch(() => {
          if (currentRequestId !== detailRequestIdRef.current) return;
          setError("Failed to load order");
          setOrder(null);
          setLoading(false);
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
