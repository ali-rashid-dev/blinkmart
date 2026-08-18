import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="animate-rise mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <div className="grid size-24 place-items-center rounded-full bg-accent text-accent-foreground">
        <ShoppingCart className="size-10" aria-hidden="true" />
      </div>
      <h2 className="mt-6 font-display text-2xl text-foreground">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Looks like you haven't added anything to your cart yet.
      </p>
      <Link
        href="/products"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform hover:scale-[1.02]"
      >
        Start Shopping
      </Link>
    </div>
  );
}
