"use client";

import { useState } from "react";
import { Search, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toggle, type Filters } from "./filters";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-4 first:border-0 first:pt-0">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function CheckRow({
  checked,
  onCheckedChange,
  label,
  meta,
}: {
  checked: boolean;
  onCheckedChange: () => void;
  label: string;
  meta?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-accent/60">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{label}</span>
      {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
    </label>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onClear,
  showCategories = true,
}: {
  filters: Filters;
  onChange: (updater: (f: Filters) => Filters) => void;
  onClear: () => void;
  showCategories?: boolean;
}) {
  const [brandQuery, setBrandQuery] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-foreground">Refine</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-bold uppercase tracking-[0.1em] text-primary underline-offset-4 hover:underline"
        >
          Reset
        </button>
      </div>

      <Section title="Price range">
        <Slider
          value={filters.priceRange}
          min={0}
          max={50000}
          step={500}
          onValueChange={(val) => {
            const v = Array.isArray(val) ? val : [val];
            onChange((f) => ({ ...f, priceRange: [v[0] ?? 0, v[1] ?? 50000] }));
          }}
          aria-label="Price range"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Min Rs 0</span>
          <span className="font-bold text-foreground">
            Rs {filters.priceRange[0]} — Rs {filters.priceRange[1]}
          </span>
          <span>Max Rs 50,000</span>
        </div>
      </Section>

      <Section title="Availability">
        <CheckRow
          label="In Stock Only"
          checked={filters.inStockOnly}
          onCheckedChange={() => onChange((f) => ({ ...f, inStockOnly: !f.inStockOnly }))}
        />
      </Section>
    </div>
  );
}
