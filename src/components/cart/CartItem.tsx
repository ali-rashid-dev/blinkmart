"use client";

import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { cartStore, formatPrice } from "@/lib/cart/store";
import type { CartLine } from "@/lib/cart/types";
import type { PendingKind } from "@/lib/cart/store";

export function CartItem({
  line,
  pending,
}: {
  line: CartLine;
  pending?: PendingKind;
}) {
  const removing = pending === "remove";
  const updating = pending === "update";
  const itemTotal = line.price * line.quantity;

  const isImageUrl =
    line.image && (line.image.startsWith("http") || line.image.startsWith("/"));

  return (
    <li
      className={`flex gap-4 rounded-2xl border border-border bg-card p-4 transition-opacity duration-200 ${
        removing ? "opacity-60" : "opacity-100"
      }`}
    >
      <Link
        href={`/products/${line.slug}`}
        aria-label={`View ${line.name}`}
        className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent/70 text-3xl sm:size-24 sm:text-4xl"
      >
        {isImageUrl ? (
          <img
            src={line.image}
            alt={line.name}
            className="size-full object-cover"
          />
        ) : (
          <span role="img" aria-label={line.name}>
            {line.image || "🛒"}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${line.slug}`}
              className="font-display text-base leading-snug text-foreground transition-colors hover:text-primary"
            >
              {line.name}
            </Link>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{line.unit}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatPrice(line.price)}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Item total
            </span>
            <span className="font-display text-lg tabular-nums text-foreground">
              {formatPrice(itemTotal)}
            </span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <QuantitySelector
              value={line.quantity}
              onChange={(next) => void cartStore.updateQuantity(line.productId, next)}
              disabled={updating || removing}
              max={line.maxQuantity}
              label={line.name}
            />
            {updating && (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin text-muted-foreground"
              />
            )}
            <span className="sr-only" aria-live="polite">
              {updating ? `Updating quantity for ${line.name}` : ""}
            </span>
          </div>

          <button
            type="button"
            onClick={() => void cartStore.remove(line.productId)}
            disabled={removing || updating}
            aria-label={`Remove ${line.name} from cart`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
          >
            {removing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            {removing ? "Removing" : "Remove"}
          </button>
        </div>
      </div>
    </li>
  );
}
