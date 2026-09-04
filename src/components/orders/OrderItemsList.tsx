import Image from "next/image";
import { formatMoney } from "@/lib/orders/store";
import type { OrderItem } from "@/lib/orders/types";

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul aria-label="Order items" className="divide-y divide-border">
      {items.map((item, index) => {
        const isImageUrl =
          item.image && (item.image.startsWith("http") || item.image.startsWith("/"));
        return (
          <li key={`${item.productId}-${index}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {isImageUrl ? (
              <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-accent/70">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            ) : (
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/70 text-2xl"
              >
                {item.image || "🛒"}
              </span>
            )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.unit} · {formatMoney(item.price)} × {item.quantity}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
            {formatMoney(item.price * item.quantity)}
          </p>
        </li>
      );
      })}
    </ul>
  );
}

export function OrderTotals({
  subtotal,
  deliveryFee,
  platformFee,
  total,
}: {
  subtotal: number;
  deliveryFee: number;
  platformFee?: number;
  total: number;
}) {
  const pFee = platformFee ?? (subtotal > 0 ? 20 : 0);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex items-baseline justify-between gap-3">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-semibold tabular-nums text-foreground">{formatMoney(subtotal)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <dt className="text-muted-foreground">Delivery fee</dt>
        <dd className="font-semibold tabular-nums text-foreground">
          {deliveryFee === 0 ? <span className="font-bold text-success">FREE</span> : formatMoney(deliveryFee)}
        </dd>
      </div>
      {pFee > 0 && (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Platform fee</dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatMoney(pFee)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
        <dt className="font-semibold text-foreground">Total</dt>
        <dd className="font-display text-xl tabular-nums text-foreground">{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}
