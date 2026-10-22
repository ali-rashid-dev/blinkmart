"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, PackageSearch, RefreshCw, ShoppingBag } from "lucide-react";
import { OrderCard } from "@/components/orders/OrderCard";
import { ordersStore, useOrdersState } from "@/lib/orders/store";

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul aria-label="Loading your orders" aria-busy="true" className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="h-36 w-full animate-pulse rounded-xl border border-border bg-card p-5"
        >
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="mt-4 h-3 w-56 rounded bg-muted/80" />
          <div className="mt-6 h-10 w-full rounded-lg bg-muted/60" />
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  const { orders, loading, error, pendingIds, retry } = useOrdersState();

  useEffect(() => {
    void ordersStore.load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Order history
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">Your orders</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Review order status, delivery details, and past purchases. New orders are due within
              24 hours; older orders may have a scheduled delivery slot.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-button transition-colors duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ShoppingBag aria-hidden="true" className="size-4" />
            Shop groceries
          </Link>
        </div>
      </header>

      <section aria-label="Order list" className="mt-6">
        {loading || orders === null ? (
          <TableSkeleton rows={3} />
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-soft sm:p-8"
          >
            <AlertCircle aria-hidden="true" className="mx-auto size-8 text-destructive" />
            <p className="mt-3 font-semibold text-foreground">We couldn&apos;t load your orders</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center shadow-soft sm:py-16">
            <span className="mx-auto grid size-14 place-items-center rounded-xl bg-accent text-primary">
              <PackageSearch aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-4 font-display text-2xl text-foreground">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your orders will appear here after checkout. Start with your weekly or monthly grocery essentials.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Browse products
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        ) : (
          <ul aria-label="Your orders" className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} busy={pendingIds.includes(order.id)} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
