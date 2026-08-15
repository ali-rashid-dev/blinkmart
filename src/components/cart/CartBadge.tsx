"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function CartBadge() {
  return (
    <Link
      href="/cart"
      className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="h-5 w-5" />
    </Link>
  );
}
