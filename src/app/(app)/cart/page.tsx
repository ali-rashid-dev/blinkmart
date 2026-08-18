"use client";

import { useEffect } from "react";
import { CartHeader } from "@/components/cart/CartHeader";
import { CartItemList } from "@/components/cart/CartItemList";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { CartError, CartSkeleton } from "@/components/cart/CartStates";
import { cartStore, cartTotals, useCartState } from "@/lib/cart/store";

export default function CartPage() {
  const { status, lines, pending } = useCartState();
  const { subtotal, total, itemCount } = cartTotals(lines);

  useEffect(() => {
    void cartStore.load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <CartHeader itemCount={itemCount} />

      <div className="mt-8">
        {status === "loading" && lines.length === 0 ? (
          <CartSkeleton />
        ) : status === "error" && lines.length === 0 ? (
          <CartError onRetry={() => void cartStore.load(true)} />
        ) : lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <CartItemList lines={lines} pending={pending} />
            <CartSummary subtotal={subtotal} total={total} itemCount={itemCount} />
          </div>
        )}
      </div>
    </main>
  );
}
