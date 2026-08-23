import { ArrowDownRight, ArrowUpRight, Receipt, ShoppingBasket, Users, Wallet } from "lucide-react";
import type { ReportsKpisData } from "@/lib/reports/types";

const cards = [
  { key: "revenue", label: "Revenue", Icon: Wallet, tone: "text-success" },
  { key: "orders", label: "Orders", Icon: ShoppingBasket, tone: "text-primary" },
  { key: "average", label: "Avg. basket", Icon: Receipt, tone: "text-secondary" },
  { key: "customers", label: "Customers", Icon: Users, tone: "text-foreground" },
] as const;

export function ReportsKpis({ kpis }: { kpis: ReportsKpisData }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, Icon, tone }) => {
        const kpi = kpis[key];
        const up = kpi.delta >= 0;
        const Trend = up ? ArrowUpRight : ArrowDownRight;
        return (
          <div key={key} className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-xs">
            <div className="flex items-center gap-2">
              <Icon aria-hidden="true" className={`size-4 shrink-0 ${tone}`} />
              <dt className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </dt>
            </div>
            <dd className="mt-2 font-display text-2xl leading-tight tabular-nums text-foreground">
              {kpi.value}
            </dd>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums ${
                  up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}
              >
                <Trend aria-hidden="true" className="size-3" />
                {Math.abs(kpi.delta).toFixed(1)}%
              </span>
              <span className="truncate">{kpi.caption}</span>
            </p>
          </div>
        );
      })}
    </dl>
  );
}
