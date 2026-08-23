import type { CustomerMixItem, TopCustomerItem } from "@/lib/reports/types";
import { formatCurrency } from "@/lib/reports/format";

const statusStyle: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  returning: "bg-secondary/10 text-secondary",
  vip: "bg-success/10 text-success",
};

export function CustomersPanel({
  customerMix = [],
  topCustomers = [],
}: {
  customerMix?: CustomerMixItem[];
  topCustomers?: TopCustomerItem[];
}) {
  const mixTotal = customerMix.reduce((s, m) => s + m.value, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="font-display text-lg text-foreground">Customers</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Who is shopping, and how often they come back.
      </p>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {customerMix.map((m) => {
          const widthPercent = mixTotal > 0 ? (m.value / mixTotal) * 100 : 0;
          return (
            <div
              key={m.label}
              className={`${m.tone} transition-all duration-300`}
              style={{ width: `${widthPercent}%` }}
              title={`${m.label}: ${m.value}`}
            />
          );
        })}
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {customerMix.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className={`size-2.5 shrink-0 rounded-full ${m.tone}`} aria-hidden="true" />
            <dt className="min-w-0 truncate text-xs text-muted-foreground">{m.label}</dt>
            <dd className="ml-auto text-xs font-semibold tabular-nums text-foreground">
              {m.value.toLocaleString("en-GB")}
            </dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Top customers
      </h3>
      {topCustomers.length === 0 ? (
        <div className="mt-3 py-6 text-center border border-dashed border-border rounded-xl">
          <p className="text-xs text-muted-foreground">No customer records in selected range.</p>
        </div>
      ) : (
        <ul className="mt-2.5 space-y-2">
          {topCustomers.map((c) => (
            <li
              key={c.id || c.name}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:border-border"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {c.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.area} · {c.orders} orders
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(c.spent)}
                </p>
                <span
                  className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    statusStyle[c.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
