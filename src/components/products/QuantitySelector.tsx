import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantitySelector({
  value,
  onChange,
  disabled,
  max = 99,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  max?: number;
  label: string;
}) {
  const btn =
    "grid size-7 place-items-center rounded-lg text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border bg-card p-1",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        className={btn}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        aria-label={`Decrease quantity of ${label}`}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        aria-live="polite"
        className="min-w-6 text-center text-sm font-bold tabular-nums text-foreground"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
