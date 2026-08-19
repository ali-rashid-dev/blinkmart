"use client";

import { useEffect } from "react";
import { OrderCard } from "@/components/orders/OrderCard";
import { ordersStore, useOrdersState } from "@/lib/orders/store";

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-muted/60" />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { orders, loading, error, pendingIds, retry } = useOrdersState();

  useEffect(() => {
    void ordersStore.load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl text-foreground">Your orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every delivery arrives in the fixed 7:00 PM – 10:00 PM evening window.
      </p>

      <div className="mt-6">
        {loading || orders === null ? (
          <TableSkeleton rows={3} />
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center text-sm text-muted-foreground">
            You haven&apos;t placed an order yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} busy={pendingIds.includes(order.id)} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
