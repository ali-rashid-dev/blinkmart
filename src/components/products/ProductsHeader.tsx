"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ProductsHeader({ total }: { total: number }) {
  return (
    <header className="animate-rise">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="font-semibold text-foreground">
            Products
          </li>
        </ol>
      </nav>

      <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_auto] items-end gap-4 lg:grid">
  <div className="min-w-0">
    <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
      The market shelf
    </h1>

    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
      Handpicked produce, pantry staples and small-batch finds — refreshed every morning.
    </p>
  </div>

  <div className="flex shrink-0 items-center gap-3">
    <p className="rounded-2xl border border-border bg-card px-3 py-2 text-center">
      <span className="block font-display text-xl text-foreground">
        {total}
      </span>

      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        products
      </span>
    </p>
  </div>
</div>
    </header>
  );
}
