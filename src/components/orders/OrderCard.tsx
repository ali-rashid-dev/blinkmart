import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { formatMoney, ordersStore } from "@/lib/orders/store";
import {
  DELIVERY_WINDOW,
  canCancel,
  formatDateTime,
  formatDeliveryDate,
  type Order,
} from "@/lib/orders/types";

export function OrderCard({ order, busy }: { order: Order; busy: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [reordering, setReordering] = useState(false);
  const router = useRouter();

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
    <li className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base text-foreground">{order.code}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {formatDateTime(order.placedAt)} ·{" "}
            {order.status === "cancelled"
              ? "Delivery cancelled"
              : `${formatDeliveryDate(order.deliveryDate)}, ${DELIVERY_WINDOW.label}`}
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

      <div className="mt-4 flex items-center gap-2 overflow-hidden">
        {order.items.slice(0, 5).map((item, idx) => {
          const isImageUrl =
            item.image && (item.image.startsWith("http") || item.image.startsWith("/"));
          return isImageUrl ? (
            <div
              key={`${item.productId}-${idx}`}
              className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-accent/70"
            >
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <span
              key={`${item.productId}-${idx}`}
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/70 text-2xl"
            >
              {item.image || "🛒"}
            </span>
          );
        })}
        <span className="truncate text-xs text-muted-foreground">
          {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
          {order.items.map((i) => i.name).join(", ")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-border px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          View details
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>

        <button
          type="button"
          onClick={() => void handleReorder()}
          disabled={reordering}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform hover:scale-[1.02] disabled:opacity-60"
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
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
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
