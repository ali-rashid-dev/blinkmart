import { Activity, ArrowUpRight, Boxes, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total orders", value: "1,284", change: "+12.4%", icon: ShoppingBag },
  { label: "Active customers", value: "8,420", change: "+8.1%", icon: Users },
  { label: "Catalog products", value: "3,960", change: "+4.8%", icon: Boxes },
  { label: "Conversion rate", value: "4.7%", change: "+0.9%", icon: Activity },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Overview</p>
        <h1 className="mt-2 font-display text-3xl text-foreground">Admin dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div className="font-display text-3xl text-foreground">{value}</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-1 text-xs font-semibold text-success">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl text-foreground">Operational summary</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Orders shipped today", "143 / 180 scheduled"],
              ["Active product catalog", "Products currently marked active in the catalog"],
              ["Categories live", "18 active collections"],
            ].map(([title, detail]) => (
              <div key={title} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl text-foreground">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {[
              { label: "Add a new product", href: "/admin/products/new" },
              { label: "Review monthly reports", href: "/admin/reports" },
              { label: "Manage category visibility", href: "/admin/categories" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <span>{label}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}