import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/cart/store";

export function CartSummary({
  subtotal,
  total,
  itemCount,
}: {
  subtotal: number;
  total: number;
  itemCount: number;
}) {
  return (
    <section
      aria-labelledby="order-summary-heading"
      className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6"
    >
      <h2
        id="order-summary-heading"
        className="font-display text-lg text-foreground"
      >
        Order Summary
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">
            Subtotal
            <span className="ml-1 text-xs">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-display text-xl tabular-nums text-foreground">
              {formatPrice(total)}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          href="/checkout"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform hover:scale-[1.01]"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          Proceed to Checkout
        </Link>

        <Link
          href="/products"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
