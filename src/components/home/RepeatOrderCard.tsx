"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Calendar, Check, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import { ordersStore, useOrdersState } from "@/lib/orders/store";
import { formatDeliveryDate } from "@/lib/orders/types";

export function RepeatOrderCard() {
  const { orders, loading } = useOrdersState();
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    void ordersStore.load();
  }, []);

  if (loading || !orders) return null;

  // Find latest past order
  const pastOrder = orders.find((o) => o.status !== "cancelled");
  if (!pastOrder || pastOrder.items.length === 0) return null;

  const handleReorder = async () => {
    setReordering(true);
    try {
      await ordersStore.reorder(pastOrder.id);
    } finally {
      setReordering(false);
    }
  };

  const previewItems = pastOrder.items.slice(0, 4);
  const remainingCount = pastOrder.items.length - previewItems.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-card via-card to-primary/5 p-4 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Sparkles className="size-3" /> Weekly &amp; Monthly Staples
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" /> Last ordered {formatDeliveryDate(pastOrder.deliveryDate)}
            </span>
          </div>

          <h3 className="font-display text-base font-bold text-foreground">
            Repeat Your Basket ({pastOrder.items.length} items)
          </h3>
          <p className="text-xs text-muted-foreground">
            Quickly re-stock your recurring groceries with 1 tap.
          </p>

          {/* Item Thumbs */}
          <div className="flex items-center gap-1.5 pt-1">
            {previewItems.map((item, idx) => (
              <div
                key={idx}
                className="relative size-8 rounded-lg bg-accent/60 overflow-hidden border border-border/60 shrink-0"
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <ShoppingBag className="size-4 text-muted-foreground m-2" />
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-[10px] font-bold text-muted-foreground shrink-0 border border-border/60">
                +{remainingCount}
              </span>
            )}
          </div>
        </div>

        {/* Right Side CTA */}
        <button
          type="button"
          onClick={() => void handleReorder()}
          disabled={reordering}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-button transition-transform active:scale-95 disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className={`size-3.5 ${reordering ? "animate-spin" : ""}`} />
          {reordering ? "Restocking Cart..." : `Reorder ${pastOrder.items.length} Items`}
        </button>
      </div>
    </div>
  );
}
