import type { SalesPoint } from "@/lib/reports/types";
import { formatCompact, formatCurrency } from "@/lib/reports/format";

export function SalesChart({
  title,
  subtitle,
  points,
}: {
  title: string;
  subtitle: string;
  points: SalesPoint[];
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const total = points.reduce((s, p) => s + p.value, 0);
  const dense = points.length > 14;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg text-foreground">{title}</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block font-display text-xl leading-tight tabular-nums text-foreground">
            {formatCurrency(total)}
          </span>
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            total
          </span>
        </p>
      </header>

      <div className="mt-5 flex h-52 items-end gap-1.5 sm:gap-2" role="img" aria-label={`${title} bar chart`}>
        {points.map((p, idx) => {
          const heightPercent = p.value > 0 ? Math.max((p.value / max) * 100, 6) : 4;
          return (
            <div key={`${p.label}-${p.dateIso || idx}`} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
              <span
                className={`mb-1.5 hidden text-center text-[10px] font-semibold tabular-nums text-muted-foreground group-hover:text-foreground ${
                  dense ? "" : "sm:block"
                }`}
              >
                {formatCompact(p.value)}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all duration-200 ${
                  p.value > 0 ? "bg-primary/30 group-hover:bg-primary" : "bg-muted/40 group-hover:bg-muted"
                }`}
                style={{ height: `${heightPercent}%` }}
                title={`${p.label}: ${formatCurrency(p.value)} · ${p.orders} orders`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {points.map((p, i) => (
          <span
            key={`${p.label}-${p.dateIso || i}`}
            className="min-w-0 flex-1 truncate text-center text-[10px] tabular-nums text-muted-foreground"
          >
            {dense && i % 3 !== 0 ? "" : p.label}
          </span>
        ))}
      </div>
    </section>
  );
}
