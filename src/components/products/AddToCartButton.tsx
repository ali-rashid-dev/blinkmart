"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  label,
  disabled,
  compact,
  size = "md",
  onAdd,
}: {
  label: string;
  disabled?: boolean;
  compact?: boolean;
  size?: "md" | "lg";
  onAdd?: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const click = () => {
    if (disabled || state !== "idle") return;
    setState("loading");
    timers.current.push(
      setTimeout(() => {
        setState("done");
        onAdd?.();
      }, 600),
      setTimeout(() => setState("idle"), 1600),
    );
  };


  return (
    <button
      type="button"
      onClick={click}
      disabled={disabled}
      aria-label={disabled ? `${label} is unavailable` : `Add ${label} to cart`}
      className={cn(
        "group/atc relative inline-flex h-10 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        compact ? "h-9" : size === "lg" ? "h-12 text-base" : "h-10",
        state === "done" && "bg-success shadow-none",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-primary-foreground/20 transition-transform duration-500 group-hover/atc:translate-x-0"
      />
      {state === "loading" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : state === "done" ? (
        <Check className="size-4 animate-rise" />
      ) : (
        <ShoppingBasket className="size-4" />
      )}
      <span className="relative">
        {state === "done" ? "Added" : disabled ? "Unavailable" : "Add to Cart"}
      </span>
    </button>
  );
}
