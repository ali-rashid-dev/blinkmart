"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DeliveryWindowCard } from "@/components/orders/DeliveryWindowCard";
import { OrderItemsList, OrderTotals } from "@/components/orders/OrderItemsList";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ordersStore, useOrder } from "@/lib/orders/store";
import { formatDateTime } from "@/lib/orders/types";

function DetailSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-4 w-32 animate-pulse rounded-xl bg-muted/40" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { order, loading, error, refetch } = useOrder(slug);

  useEffect(() => {
    void ordersStore.load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back to orders
      </Link>

      {loading && !order ? (
        <DetailSkeleton />
      ) : error && !order ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : !order ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">We couldn&apos;t find that order.</p>
          <Link
            href="/orders"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            View all orders
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-foreground">{order.code}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTime(order.placedAt)}
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg text-foreground">Items</h2>
                <div className="mt-3">
                  <OrderItemsList items={order.items} />
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <OrderTotals
                    subtotal={order.subtotal}
                    deliveryFee={order.deliveryFee}
                    total={order.total}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg text-foreground">Progress</h2>
                <div className="mt-4">
                  <OrderTimeline order={order} />
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <DeliveryWindowCard deliveryDate={order.deliveryDate} />
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg text-foreground">Delivery address</h2>
                <address className="mt-2 space-y-0.5 text-sm not-italic text-muted-foreground">
                  <p className="font-semibold text-foreground">{order.address.fullName}</p>
                  <p>{order.address.phone}</p>
                  <p>
                    {order.address.house}, {order.address.street}
                  </p>
                  <p>
                    {order.address.area}, {order.address.city} {order.address.postal}
                  </p>
                  {order.address.notes && <p className="mt-2 text-xs">Note: {order.address.notes}</p>}
                </address>
              </section>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
