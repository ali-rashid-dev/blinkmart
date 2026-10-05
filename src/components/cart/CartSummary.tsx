"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/cart/store";
import { authClient } from "@/lib/auth-client";
import { useLoginDialog } from "@/components/auth/LoginDialogContext";

import { calculateDeliveryFee, calculatePlatformFee, getNextDeliveryTier } from "@/lib/orders/eligibility";

export function CartSummary({
  subtotal,
  originalSubtotal,
  discountAmount: propDiscountAmount,
  discountPercent: propDiscountPercent,
  deliveryFee: propDeliveryFee,
  platformFee: propPlatformFee,
  total: propTotal,
  itemCount,
}: {
  subtotal: number;
  originalSubtotal?: number;
  discountAmount?: number;
  discountPercent?: number;
  deliveryFee?: number;
  platformFee?: number;
  total?: number;
  itemCount: number;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { openDialog } = useLoginDialog();

  const origSubtotal = originalSubtotal ?? subtotal;
  const discountAmount = propDiscountAmount ?? (origSubtotal > subtotal ? Math.round((origSubtotal - subtotal) * 100) / 100 : 0);
  const discountPercent = propDiscountPercent ?? (origSubtotal > 0 && discountAmount > 0 ? Math.round((discountAmount / origSubtotal) * 100) : 0);

  const deliveryFee = propDeliveryFee ?? calculateDeliveryFee(subtotal);
  const platformFee = propPlatformFee ?? calculatePlatformFee(subtotal);
  const total = propTotal ?? Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;
  const tierInfo = getNextDeliveryTier(subtotal);

  const handleCheckout = () => {
    if (!session?.user) {
      // User is not logged in — open the login dialog instead of navigating
      openDialog("/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <section
      aria-labelledby="order-summary-heading"
      className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6"
    >
      <h2
        id="order-summary-heading"
        className="font-display text-lg text-foreground flex items-center justify-between"
      >
        <span>Order Summary</span>
        {discountPercent > 0 && (
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
            SAVE {discountPercent}%
          </span>
        )}
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        {discountAmount > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Original Price (MRP)</dt>
            <dd className="font-semibold tabular-nums text-muted-foreground line-through">
              {formatPrice(origSubtotal)}
            </dd>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex items-baseline justify-between gap-3 text-destructive font-medium">
            <dt className="flex items-center gap-1.5">
              <span>Discount Savings</span>
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                {discountPercent}% OFF
              </span>
            </dt>
            <dd className="font-semibold tabular-nums">
              − {formatPrice(discountAmount)}
            </dd>
          </div>
        )}

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

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Delivery Fee</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {deliveryFee === 0 ? (
              <span className="font-bold text-success">FREE</span>
            ) : (
              formatPrice(deliveryFee)
            )}
          </dd>
        </div>

        {subtotal > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Platform Fee</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatPrice(platformFee)}
            </dd>
          </div>
        )}

        {tierInfo && (
          <p className="rounded-lg bg-accent/60 p-2 text-xs text-muted-foreground">
            {tierInfo.isFree ? (
              <span className="font-medium text-success">🎉 You qualify for FREE evening delivery!</span>
            ) : (
              <>
                Add <span className="font-semibold text-foreground">{formatPrice(tierInfo.amountNeeded)}</span> more for {tierInfo.nextFee === 0 ? "FREE" : formatPrice(tierInfo.nextFee)} delivery!
              </>
            )}
          </p>
        )}

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
        <button
          id="proceed-to-checkout-btn"
          type="button"
          onClick={handleCheckout}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform hover:scale-[1.01]"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          Proceed to Checkout
        </button>

        <a
          href="/products"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Continue Shopping
        </a>
      </div>
    </section>
  );
}
