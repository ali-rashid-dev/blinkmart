import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, RotateCcw, ShoppingBag } from "lucide-react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { formatMoney, ordersStore } from "@/lib/orders/store";
import {
  DELIVERY_TIMEFRAME,
  canCancel,
  formatDateTime,
  formatDeliveryDeadline,
  formatDeliveryDate,
  type Order,
} from "@/lib/orders/types";

export function OrderCard({ order, busy }: { order: Order; busy: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [reordering, setReordering] = useState(false);
  const router = useRouter();
  const deliveredAt = order.timeline.find((event) => event.status === "delivered")?.at;
  const deliverySummary = order.status === "cancelled"
    ? "Delivery cancelled"
    : order.status === "delivered" && deliveredAt
      ? `Delivered ${formatDateTime(deliveredAt)}`
      : order.deliverySlot === DELIVERY_TIMEFRAME.label
        ? `Due by ${formatDeliveryDeadline(order.deliveryDate)}`
        : `${formatDeliveryDate(order.deliveryDate)}, ${order.deliverySlot}`;

  const handleReorder = async () => {
    setReordering(true);
    try {
      const success = await ordersStore.reorder(order.id);
      if (success) {
        router.push("/cart");
      }
    } finally {
      setReordering(false);
    }
  };

  return (
    <li className="rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg text-foreground">{order.code}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {formatDateTime(order.placedAt)}
          </p>
          <p className="mt-1 text-xs font-medium text-foreground">
            {deliverySummary}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Total
          </span>
          <span className="font-display text-lg tabular-nums text-foreground">
            {formatMoney(order.total)}
          </span>
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-lg bg-background p-3">
        <div className="flex shrink-0 items-center -space-x-2">
          {order.items.slice(0, 4).map((item, idx) => {
            const isImageUrl =
              item.image && (item.image.startsWith("http") || item.image.startsWith("/"));
            return isImageUrl ? (
              <div
                key={`${item.productId}-${idx}`}
                className="relative size-10 overflow-hidden rounded-lg border-2 border-card bg-accent/70"
              >
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            ) : (
              <span
                key={`${item.productId}-${idx}`}
                className="grid size-10 place-items-center rounded-lg border-2 border-card bg-accent text-primary"
              >
                <ShoppingBag aria-hidden="true" className="size-4" />
              </span>
            );
          })}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {order.items.map((item) => item.name).join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View details
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>

        <button
          type="button"
          onClick={() => void handleReorder()}
          disabled={reordering}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-button transition-colors duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reordering ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <RotateCcw aria-hidden="true" className="size-4" />
          )}
          Reorder
        </button>

        {canCancel(order) && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={busy}
            className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            Cancel order
          </button>
        )}
      </div>

      <CancelOrderDialog
        open={confirming}
        onOpenChange={setConfirming}
        orderCode={order.code}
        busy={busy}
        onConfirm={(reason) => {
          setConfirming(false);
          void ordersStore.cancel(order.id, reason);
        }}
      />
    </li>
  );
}
