"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar, type CategoryCountItem } from "./FilterSidebar";
import type { Filters } from "./filters";

export function MobileFilterDrawer({
  open,
  onOpenChange,
  filters,
  onChange,
  onClear,
  resultCount,
  categoryCounts = [],
  brands = [],
  priceBounds = [0, 5000],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onChange: (updater: (f: Filters) => Filters) => void;
  onClear: () => void;
  resultCount: number;
  categoryCounts?: CategoryCountItem[];
  brands?: string[];
  priceBounds?: [number, number];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-background p-5">
        <SheetHeader className="p-0">
          <SheetTitle className="font-display text-xl">Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4 pb-24">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            categoryCounts={categoryCounts}
            brands={brands}
            priceBounds={priceBounds}
            showCategories={true}
          />
        </div>
        <div className="sticky bottom-0 -mx-5 border-t border-border bg-card px-5 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)]"
          >
            Show {resultCount} products
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
