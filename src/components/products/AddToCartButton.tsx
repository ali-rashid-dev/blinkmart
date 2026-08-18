"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cartStore } from "@/lib/cart/store";

export function AddToCartButton({
  label,
  disabled,
  compact,
  size = "md",
  productId,
  quantity = 1,
  onAdd,
}: {
  label: string;
  disabled?: boolean;
  compact?: boolean;
  size?: "md" | "lg";
  productId?: string;
  quantity?: number;
  onAdd?: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const click = async () => {
    if (disabled || state !== "idle" || !productId) return;
    setState("loading");
    try {
      await cartStore.add(productId, quantity);
      setState("done");
      toast.success(`${label} added to cart`, {
        description: `Qty: ${quantity}`,
        duration: 2000,
      });
      onAdd?.();
      timers.current.push(setTimeout(() => setState("idle"), 1600));
    } catch (err) {
      setState("error");
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      toast.error("Could not add item", { description: msg });
      timers.current.push(setTimeout(() => setState("idle"), 2000));
    }
  };

  return (
    <button
      type="button"
      onClick={() => void click()}
      disabled={disabled || state === "loading"}
      aria-label={disabled ? `${label} is unavailable` : `Add ${label} to cart`}
      className={cn(
        "group/atc relative inline-flex h-10 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        compact ? "h-9" : size === "lg" ? "h-12 text-base" : "h-10",
        state === "done" && "bg-success shadow-none",
        state === "error" && "bg-destructive shadow-none",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-primary-foreground/20 transition-transform duration-500 group-hover/atc:translate-x-0"
      />
      {state === "loading" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : state === "done" ? (
        <Check className="size-4 animate-bounce" />
      ) : (
        <ShoppingBasket className="size-4" />
      )}
      <span className="relative">
        {state === "loading"
          ? "Adding…"
          : state === "done"
          ? "Added!"
          : state === "error"
          ? "Try again"
          : disabled
          ? "Unavailable"
          : "Add to Cart"}
      </span>
    </button>
  );
}
