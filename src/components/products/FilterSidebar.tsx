"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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

export type CategoryCountItem = {
  id: string;
  label: string;
  emoji?: string;
  count: number;
};

export function FilterSidebar({
  filters,
  onChange,
  onClear,
  showCategories = true,
  categoryCounts = [],
  brands = [],
  priceBounds = [0, 5000],
}: {
  filters: Filters;
  onChange: (updater: (f: Filters) => Filters) => void;
  onClear: () => void;
  showCategories?: boolean;
  categoryCounts?: CategoryCountItem[];
  brands?: string[];
  priceBounds?: [number, number];
}) {
  const [brandQuery, setBrandQuery] = useState("");

  const visibleBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandQuery.trim().toLowerCase()),
  );

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

      {showCategories && categoryCounts.length > 0 && (
        <Section title="Categories">
          <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {categoryCounts.map((c) => {
              const active = filters.categories.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      onChange((f) => ({ ...f, categories: toggle(f.categories, c.id) }))
                    }
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-200",
                      active
                        ? "border-primary bg-accent text-accent-foreground font-semibold"
                        : "border-transparent bg-muted/40 text-foreground hover:border-border hover:bg-muted/70",
                    )}
                  >
                    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-card text-base shadow-sm">
                      {c.emoji || "🛒"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.label}</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{c.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title="Price range">
        <Slider
          value={filters.priceRange}
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={10}
          onValueChange={(val) => {
            const v = Array.isArray(val) ? val : [val];
            onChange((f) => ({ ...f, priceRange: [v[0] ?? priceBounds[0], v[1] ?? priceBounds[1]] }));
          }}
          aria-label="Price range"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Rs {priceBounds[0]}</span>
          <span className="font-bold text-foreground">
            Rs {filters.priceRange[0]} — Rs {filters.priceRange[1]}
          </span>
          <span>Rs {priceBounds[1]}</span>
        </div>
      </Section>

      {brands.length > 0 && (
        <Section title="Brands">
          {brands.length > 4 && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
              <Search aria-hidden="true" className="size-4 text-muted-foreground shrink-0" />
              <input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Search brands..."
                aria-label="Search brands"
                className="h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
            {visibleBrands.map((b) => (
              <CheckRow
                key={b}
                label={b}
                checked={filters.brands.includes(b)}
                onCheckedChange={() => onChange((f) => ({ ...f, brands: toggle(f.brands, b) }))}
              />
            ))}
            {!visibleBrands.length && (
              <p className="px-1.5 py-2 text-xs text-muted-foreground">No brands match.</p>
            )}
          </div>
        </Section>
      )}

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
