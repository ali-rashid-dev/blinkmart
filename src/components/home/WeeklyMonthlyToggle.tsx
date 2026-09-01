"use client";

import { Calendar, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type GroceryShoppingMode = "weekly" | "monthly";

interface WeeklyMonthlyToggleProps {
  mode: GroceryShoppingMode;
  onChange: (mode: GroceryShoppingMode) => void;
  className?: string;
}

export function WeeklyMonthlyToggle({
  mode,
  onChange,
  className,
}: WeeklyMonthlyToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl bg-muted/80 p-1.5 border border-border/70 shadow-xs",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("weekly")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
          mode === "weekly"
            ? "bg-card text-foreground shadow-soft ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Calendar className="size-3.5 text-primary" />
        Weekly Fresh Staples
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary hidden sm:inline">
          5–7 Day Box
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
          mode === "monthly"
            ? "bg-card text-foreground shadow-soft ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Package className="size-3.5 text-secondary" />
        Monthly Super Stock-Up
        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-bold text-secondary hidden sm:inline">
          Bulk Packs
        </span>
      </button>
    </div>
  );
}
