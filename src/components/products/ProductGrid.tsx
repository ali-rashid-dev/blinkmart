"use client";

import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { Product } from "./data";

export function ProductGrid({
  products,
  view,
}: {
  products: Product[];
  view: "grid" | "compact";
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        view === "grid"
          ? "grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          : "grid-cols-1 xl:grid-cols-2",
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} view={view} />
      ))}
    </div>
  );
}
