"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { QuantitySelector } from "./QuantitySelector";
import { cartStore, useCartState } from "@/lib/cart/store";
import type { CustomerProduct } from "./data";
import { getSupportedImageSrc } from "@/lib/image";

export function ProductCard({
  product,
  view = "grid",
}: {
  product: CustomerProduct;
  view?: "grid" | "compact";
}) {
  const { lines } = useCartState();
  const cartLine = lines.find((l) => l.productId === product.id);
  const qty = cartLine ? cartLine.quantity : 0;
  const soldOut = !product.enabled;
  const compact = view === "compact";
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const imageSrc = getSupportedImageSrc(product.imageUrl);

  return (
    <article
      className={cn(
        "group animate-rise flex h-full overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] focus-within:-translate-y-0.5",
        compact ? "items-center gap-3 p-3" : "flex-col",
      )}
    >
      {/* ── Image/thumbnail area ────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        className={cn(
          "relative block shrink-0 overflow-hidden bg-accent/60 grid place-items-center",
          compact ? "size-24 rounded-2xl" : "aspect-square w-full",
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--color-card),transparent_70%)]"
        />

        {imageSrc && failedImageSrc !== imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={cn(
              "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105",
              soldOut && "opacity-45 saturate-0",
            )}
            onError={() => setFailedImageSrc(imageSrc)}
          />
        ) : (
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center text-muted-foreground/40 transition-transform duration-500 ease-out group-hover:scale-105",
              soldOut && "opacity-45 saturate-0",
            )}
          >
            <ImageIcon className={compact ? "h-8 w-8" : "h-14 w-14"} />
          </div>
        )}

        {soldOut && !compact && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-background">
            Unavailable
          </span>
        )}
      </Link>

      {/* ── Text + actions ──────────────────────────────── */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5",
          compact ? "" : "p-3.5",
        )}
      >
        {/* Brand · Category */}
        {(product.brandName || product.categoryName) && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {[product.brandName, product.categoryName].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Product name */}
        <Link href={`/products/${product.slug}`} className="min-w-0">
          <h3 className="line-clamp-2 font-display text-[15px] leading-snug text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-lg text-foreground">
            Rs {Math.round(product.price)}
          </span>
        </div>

        {/* Availability badge */}
        {soldOut ? (
          <span className="text-[11px] font-semibold text-destructive">Unavailable</span>
        ) : (
          <span className="text-[11px] font-semibold text-success">Available</span>
        )}

        {/* Cart actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          {qty > 0 && !soldOut ? (
            <QuantitySelector
              value={qty}
              onChange={(n) => void cartStore.updateQuantity(product.id, n)}
              max={99}
              label={product.name}
            />
          ) : (
            <AddToCartButton
              productId={product.id}
              label={product.name}
              disabled={soldOut}
              {...(compact ? { compact: true } : {})}
            />
          )}
        </div>
      </div>
    </article>
  );
}
