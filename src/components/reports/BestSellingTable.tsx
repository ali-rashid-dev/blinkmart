import type { BestSellingItem } from "@/lib/reports/types";
import { formatCurrency } from "@/lib/reports/format";

export function BestSellingTable({ items = [] }: { items?: BestSellingItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg text-foreground">Best selling</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Top products by units sold in the selected period.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center text-center py-6 border border-dashed border-border rounded-xl">
          <p className="text-sm font-medium text-muted-foreground">No best selling products recorded yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Sales will populate top items automatically.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((p, i) => (
            <li
              key={`${p.id || p.name}-${i}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:border-border"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-lg">
                <span aria-hidden="true">{p.emoji || "📦"}</span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  <span className="tabular-nums text-muted-foreground">{i + 1}. </span>
                  {p.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.category} · {p.units.toLocaleString("en-GB")} units
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(p.share, 4), 100)}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(p.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
