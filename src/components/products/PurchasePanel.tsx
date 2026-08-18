"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { cartStore, useCartState } from "@/lib/cart/store";
import type { CustomerProduct } from "@/components/products/data";

export function PurchasePanel({ product }: { product: CustomerProduct }) {
  const { lines } = useCartState();
  const cartLine = lines.find((l) => l.productId === product.id);
  const inCart = cartLine ? cartLine.quantity : 0;
  const [qty, setQty] = useState(1);
  const soldOut = !product.enabled;

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-4">
      {inCart > 0 && !soldOut ? (
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={inCart}
            onChange={(n) => void cartStore.updateQuantity(product.id, n)}
            max={99}
            label={product.name}
          />
          <p className="text-sm font-semibold text-success">In your basket</p>
          <Link
            href="/cart"
            className="ml-auto text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View cart
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={qty}
            onChange={setQty}
            disabled={soldOut}
            max={99}
            label={product.name}
          />
          <div className="flex min-w-[12rem] flex-1">
            <AddToCartButton
              label={product.name}
              disabled={soldOut}
              size="lg"
              productId={product.id}
              quantity={qty}
            />
          </div>
        </div>
      )}
    </div>
  );
}
