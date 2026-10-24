"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { QuantitySelector } from "./QuantitySelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cartStore, useCartState } from "@/lib/cart/store";
import type { CustomerProduct } from "./data";
import { getSupportedImageSrc } from "@/lib/image";
import { formatCurrency } from "@/lib/currency";

export function ProductCard({
  product,
  view = "grid",
}: {
  product: CustomerProduct;
  view?: "grid" | "compact";
}) {
  const { lines } = useCartState();
  const cartLine = lines.find((l) => l.productId === product.id && !l.variantId);
  const qty = cartLine ? cartLine.quantity : 0;
  const availableVariantCount = product.variantsEnabled
    ? product.variants.filter((variant) => variant.isActive && variant.stockQuantity > 0).length
    : 0;
  const soldOut = !product.enabled || (product.variantsEnabled && availableVariantCount === 0);
  const compact = view === "compact";
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const imageSrc = getSupportedImageSrc(product.imageUrl);

  return (
    <article
      className={cn(
        "group animate-rise flex h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] focus-within:-translate-y-0.5",
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

        {product.discountPercent > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground shadow-xs">
            −{product.discountPercent}%
          </span>
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
          {product.variantsEnabled && <span className="text-[10px] font-semibold uppercase text-muted-foreground">From</span>}
          <span className="font-display text-lg text-foreground">
            {formatCurrency(product.effectivePrice)}
          </span>
          {product.effectivePrice < product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="text-[11px] font-bold text-destructive">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Availability badge */}
        {soldOut ? (
          <span className="text-[11px] font-semibold text-destructive">Unavailable</span>
        ) : (
          <span className="text-[11px] font-semibold text-success-text">Available</span>
        )}
        {product.variantsEnabled && product.variants.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {availableVariantCount} options available
          </span>
        )}

        {/* Cart actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          {product.variantsEnabled ? (
            <Dialog>
              <DialogTrigger
                aria-label={`Choose options for ${product.name}`}
                className="inline-flex size-10 flex-none items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 sm:h-9 sm:flex-1 sm:px-3"
              >
                <ListPlus className="size-4 sm:hidden" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Choose options</span>
              </DialogTrigger>
              <DialogContent className="max-h-[85dvh] overflow-y-auto max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:gap-4 max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:px-4 max-sm:pb-[calc(env(safe-area-inset-bottom)+1rem)] max-sm:pt-6">
                <DialogHeader>
                  <DialogTitle>Choose {product.name}</DialogTitle>
                  <DialogDescription>
                    Select an option to add it directly to your cart.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  {product.variants
                    .filter((variant) => variant.isActive)
                    .map((variant) => {
                      const variantLabel = Object.entries(variant.attributes)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" · ") || variant.sku;
                      const unavailable = variant.stockQuantity < 1;

                      return (
                        <div
                          key={variant.id}
                          className="flex min-h-20 items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 sm:gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug text-foreground">{variantLabel}</p>
                            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                              {unavailable ? "Out of stock" : `${variant.stockQuantity} available`}
                            </p>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="font-semibold text-foreground">
                                {formatCurrency(variant.effectivePrice)}
                              </span>
                              {variant.effectivePrice < variant.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(variant.price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <AddToCartButton
                            className="size-11 flex-none sm:h-10 sm:flex-1"
                            productId={product.id}
                            variantId={variant.id}
                            label={`${product.name} (${variantLabel})`}
                            disabled={unavailable}
                            responsive
                          />
                        </div>
                      );
                    })}
                </div>
              </DialogContent>
            </Dialog>
          ) : qty > 0 && !soldOut ? (
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
