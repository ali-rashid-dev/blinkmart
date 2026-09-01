"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { ordersStore, useOrdersState } from "@/lib/orders/store";
import { LIFECYCLE, STATUS_LABEL, STATUS_HINT, type OrderStatus } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

const STATUS_ICONS: Record<OrderStatus, typeof PackageCheck> = {
  placed: ShoppingBag,
  confirmed: CheckCircle2,
  packed: PackageCheck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  cancelled: ShoppingBag,
};

export function ActiveOrderTracker() {
  const { orders, loading } = useOrdersState();

  useEffect(() => {
    void ordersStore.load();
  }, []);

  if (loading || !orders) return null;

  const activeOrder = orders.find(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );

  if (!activeOrder) return null;

  const currentIdx = LIFECYCLE.indexOf(activeOrder.status);
  const Icon = STATUS_ICONS[activeOrder.status] || ShoppingBag;

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground">
                Order {activeOrder.code}
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                {STATUS_LABEL[activeOrder.status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {STATUS_HINT[activeOrder.status]}
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Details
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-muted -z-0" />
          <div
            className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
            style={{
              width: `${Math.max(0, (currentIdx / (LIFECYCLE.length - 1)) * 100)}%`,
            }}
          />

          {LIFECYCLE.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={step} className="flex flex-col items-center gap-1 z-10 bg-card px-1">
                <div
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                      : isDone
                      ? "bg-primary/90 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {idx + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium hidden sm:block",
                    isCurrent ? "text-primary font-bold" : isDone ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {STATUS_LABEL[step]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5 text-primary" />
            Scheduled Window: <strong className="text-foreground font-semibold">{activeOrder.deliverySlot || "7:00 PM – 10:00 PM"}</strong>
          </span>
          <span>
            {activeOrder.items.length} {activeOrder.items.length === 1 ? "item" : "items"} • Rs {Math.round(activeOrder.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
