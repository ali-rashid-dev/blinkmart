"use client";

import { X } from "lucide-react";
import type { Chip, Filters } from "./filters";

export function ActiveFilters({
  chips,
  onChange,
  onClear,
}: {
  chips: Chip[];
  onChange: (updater: (f: Filters) => Filters) => void;
  onClear: () => void;
}) {
  if (!chips.length) return null;

  const removeChip = (chip: Chip) => {
    onChange((f) => {
      if (chip.type === "search") return { ...f, search: "" };
      if (chip.type === "categories") return { ...f, categories: f.categories.filter((c) => c !== chip.value) };
      if (chip.type === "brands") return { ...f, brands: f.brands.filter((b) => b !== chip.value) };
      if (chip.type === "inStockOnly") return { ...f, inStockOnly: false };
      return f;
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => removeChip(chip)}
          aria-label={`Remove filter ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {chip.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-primary underline-offset-4 transition-colors hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
