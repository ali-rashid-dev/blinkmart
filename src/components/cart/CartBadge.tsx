"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartCount } from "@/lib/cart/store";

export function CartBadge({ className }: { className?: string }) {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className={`relative inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary ${className ?? ""}`}
    >
      <ShoppingCart className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
