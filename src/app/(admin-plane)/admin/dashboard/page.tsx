"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  ShoppingBag,
  Users,
  Store,
  Tag,
  RefreshCw,
  Eye,
  TrendingUp,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getAdminDashboardAction,
  type DashboardData,
} from "./actions";

const STATUS_BADGE_STYLE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PLACED: { label: "Placed", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "secondary" },
  PACKED: { label: "Packed", variant: "secondary" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

import { formatCurrency } from "@/lib/currency";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchDashboardData = () => {
    setError(null);
    startTransition(async () => {
      const res = await getAdminDashboardAction();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error.message || "Failed to load dashboard metrics");
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Store Performance & Real-time Metrics
          </p>
          <h1 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isPending}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link
            href="/admin/products"
            className={cn(buttonVariants({ size: "sm" }), "gap-2 rounded-xl")}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="font-display text-2xl font-bold text-foreground">
              {data ? data.kpis.totalRevenue.value : "—"}
            </div>
            {data && (
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  data.kpis.totalRevenue.delta >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {data.kpis.totalRevenue.delta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {data.kpis.totalRevenue.delta >= 0 ? `+${data.kpis.totalRevenue.delta}%` : `${data.kpis.totalRevenue.delta}%`}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Valid non-cancelled orders</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="font-display text-2xl font-bold text-foreground">
              {data ? data.kpis.totalOrders.value : "—"}
            </div>
            {data && (
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  data.kpis.totalOrders.delta >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {data.kpis.totalOrders.delta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {data.kpis.totalOrders.delta >= 0 ? `+${data.kpis.totalOrders.delta}%` : `${data.kpis.totalOrders.delta}%`}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Placed & fulfilled orders</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Customers</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="font-display text-2xl font-bold text-foreground">
              {data ? data.kpis.activeCustomers.value : "—"}
            </div>
            {data && (
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  data.kpis.activeCustomers.delta >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {data.kpis.activeCustomers.delta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {data.kpis.activeCustomers.delta >= 0 ? `+${data.kpis.activeCustomers.delta}%` : `${data.kpis.activeCustomers.delta}%`}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Registered customer accounts</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Catalog Products</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="font-display text-2xl font-bold text-foreground">
              {data ? data.kpis.catalogProducts.value : "—"}
            </div>
            {data && (
              <span className="text-xs font-medium text-muted-foreground">
                {data.kpis.catalogProducts.activeCount} Enabled
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Active & managed SKUs</p>
        </div>
      </div>

      {/* Visual Revenue Trend Chart & Operational Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend Visual Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-foreground">7-Day Revenue Trend</h2>
              <p className="text-xs text-muted-foreground">Daily sales performance overview</p>
            </div>
            <Link
              href="/admin/revenue"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs")}
            >
              Detailed Revenue
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data && data.salesTrend.length > 0 ? (
            <div className="mt-6">
              {/* Mini Visual Bar Graph */}
              <div className="grid h-44 grid-cols-7 items-end gap-2 pt-4">
                {data.salesTrend.map((pt, idx) => {
                  const maxRev = Math.max(...data.salesTrend.map((s) => s.revenue), 10);
                  const heightPercent = Math.max(12, Math.round((pt.revenue / maxRev) * 100));
                  return (
                    <div key={idx} className="group relative flex flex-col items-center gap-2 h-full justify-end">
                      <div className="pointer-events-none absolute -top-8 z-10 hidden rounded-md bg-foreground px-2 py-1 text-[10px] text-background shadow group-hover:block whitespace-nowrap">
                        {pt.label}: {formatCurrency(pt.revenue)} ({pt.orders} orders)
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-lg bg-primary/80 transition-all duration-300 group-hover:bg-primary"
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">{pt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex h-44 items-center justify-center rounded-xl bg-muted/20 text-xs text-muted-foreground">
              {isPending ? "Loading sales chart..." : "No recent order sales data found."}
            </div>
          )}
        </div>

        {/* Operational Indicators */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground">Operational Status</h2>
            <p className="text-xs text-muted-foreground">Live platform operational totals</p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Orders Today</p>
                    <p className="text-xs text-muted-foreground">Received in last 24h</p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  {data ? data.operational.ordersTodayCount : "0"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Products</p>
                    <p className="text-xs text-muted-foreground">Live on storefront</p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  {data ? data.operational.activeProductsCount : "0"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Live Categories</p>
                    <p className="text-xs text-muted-foreground">Active store collections</p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  {data ? data.operational.liveCategoriesCount : "0"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Brands</p>
                    <p className="text-xs text-muted-foreground">Partner brand count</p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  {data ? data.operational.activeBrandsCount : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown & Quick Actions Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Status Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Order Status Pipeline</h2>
            <Link
              href="/admin/orders"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs")}
            >
              Manage Orders
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="text-xs font-medium text-muted-foreground">Placed</span>
              <div className="mt-1 font-display text-xl font-bold text-foreground">
                {data ? data.statusBreakdown.placed : 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="text-xs font-medium text-muted-foreground">Confirmed</span>
              <div className="mt-1 font-display text-xl font-bold text-foreground">
                {data ? data.statusBreakdown.confirmed : 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="text-xs font-medium text-muted-foreground">Packed</span>
              <div className="mt-1 font-display text-xl font-bold text-foreground">
                {data ? data.statusBreakdown.packed : 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="text-xs font-medium text-muted-foreground">Out for Delivery</span>
              <div className="mt-1 font-display text-xl font-bold text-foreground">
                {data ? data.statusBreakdown.outForDelivery : 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="text-xs font-medium text-muted-foreground">Delivered</span>
              <div className="mt-1 font-display text-xl font-bold text-emerald-600">
                {data ? data.statusBreakdown.delivered : 0}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="text-xs font-medium text-muted-foreground">Cancelled</span>
              <div className="mt-1 font-display text-xl font-bold text-rose-600">
                {data ? data.statusBreakdown.cancelled : 0}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl text-foreground">Quick Management Actions</h2>
          <div className="mt-4 space-y-2">
            {[
              { label: "Manage Products Catalog", href: "/admin/products" },
              { label: "View Revenue & Sales Analytics", href: "/admin/revenue" },
              { label: "Review All Orders", href: "/admin/orders" },
              { label: "Manage Customer Accounts", href: "/admin/customers" },
              { label: "Manage Partner Brands", href: "/admin/brands" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <span>{label}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground">Recent Customer Orders</h2>
            <p className="text-xs text-muted-foreground">Latest transactions across the platform</p>
          </div>
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 text-xs")}
          >
            View All Orders
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 pt-2 font-medium">Order Code</th>
                <th className="pb-3 pt-2 font-medium">Customer</th>
                <th className="pb-3 pt-2 font-medium">Items</th>
                <th className="pb-3 pt-2 font-medium">Total</th>
                <th className="pb-3 pt-2 font-medium">Status</th>
                <th className="pb-3 pt-2 font-medium">Date</th>
                <th className="pb-3 pt-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => {
                  const style = STATUS_BADGE_STYLE[order.status] || {
                    label: order.status,
                    variant: "outline",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="py-3 font-medium text-foreground">{order.code}</td>
                      <td className="py-3">
                        <div className="font-medium text-foreground">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                      </td>
                      <td className="py-3 text-muted-foreground">{order.itemsCount} items</td>
                      <td className="py-3 font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3">
                        <Badge variant={style.variant}>{style.label}</Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View order</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    {isPending ? "Loading recent orders..." : "No recent orders found in system."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}