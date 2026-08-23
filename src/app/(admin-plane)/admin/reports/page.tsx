"use client";

import { useEffect, useState, useTransition } from "react";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BestSellingTable } from "@/components/reports/BestSellingTable";
import { CustomersPanel } from "@/components/reports/CustomersPanel";
import { ReportsKpis } from "@/components/reports/ReportsKpis";
import { SalesChart } from "@/components/reports/SalesChart";
import { getAdminReportsAction } from "./actions";
import type { RangeKey, ReportsData } from "@/lib/reports/types";

const ranges: RangeKey[] = ["7d", "30d", "12m"];
const rangeLabel: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12m": "Last 12 months",
};

export default function AdminReportsPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchReports = (r: RangeKey) => {
    setError(null);
    startTransition(async () => {
      const res = await getAdminReportsAction(r);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error.message || "Failed to load reports");
      }
    });
  };

  useEffect(() => {
    fetchReports(range);
  }, [range]);

  const escapeCsvText = (value: string | null | undefined) => {
    const safe = String(value ?? "")
      .replace(/\r/g, " ")
      .replace(/\t/g, " ")
      .replace(/^\s*([=+\-@])/g, "'$1")
      .replace(/"/g, '""');

    return `"${safe}"`;
  };

  const handleExportCSV = () => {
    if (!data) return;

    const csvLines: string[] = [];

    // Header & KPIs section
    csvLines.push(`Blinkmart Admin Sales & Analytics Report (${rangeLabel[data.range]})`);
    csvLines.push(`Generated At,${new Date().toLocaleString()}`);
    csvLines.push("");
    csvLines.push("KPI Overview");
    csvLines.push("Metric,Value,Delta %,Period");
    csvLines.push(`Revenue,"${data.kpis.revenue.value}",${data.kpis.revenue.delta}%,${data.kpis.revenue.caption}`);
    csvLines.push(`Orders,"${data.kpis.orders.value}",${data.kpis.orders.delta}%,${data.kpis.orders.caption}`);
    csvLines.push(`Average Basket,"${data.kpis.average.value}",${data.kpis.average.delta}%,${data.kpis.average.caption}`);
    csvLines.push(`Customers,"${data.kpis.customers.value}",${data.kpis.customers.delta}%,${data.kpis.customers.caption}`);
    csvLines.push("");

    // Sales Performance
    csvLines.push("Sales Performance");
    csvLines.push("Period Label,Revenue ($),Order Count,Date/Month ISO");
    data.points.forEach((p) => {
      csvLines.push(`"${p.label}",${p.value},${p.orders},"${p.dateIso}"`);
    });
    csvLines.push("");

    // Best Selling Products
    csvLines.push("Best Selling Products");
    csvLines.push("Product Name,Category,Units Sold,Revenue ($),Share %");
    data.bestSelling.forEach((item) => {
      csvLines.push(`${escapeCsvText(item.name)},${escapeCsvText(item.category)},${item.units},${item.revenue},${item.share}%`);
    });
    csvLines.push("");

    // Top Customers
    csvLines.push("Top Customers");
    csvLines.push("Customer Name,Location,Total Orders,Total Spent ($),Tier Status");
    data.topCustomers.forEach((c) => {
      csvLines.push(`${escapeCsvText(c.name)},${escapeCsvText(c.area)},${c.orders},${c.spent},${c.status}`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvLines.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `blinkmart-sales-report-${data.range}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sales, revenue and customer performance across delivery runs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports(range)}
            disabled={isPending}
            className="gap-2"
          >
            <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            disabled={!data || isPending}
            className="shrink-0 gap-2"
          >
            <Download aria-hidden="true" className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Reporting period"
        className="mt-6 inline-flex rounded-full border border-border bg-card p-1"
      >
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={range === r}
            onClick={() => setRange(r)}
            disabled={isPending}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              range === r
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {rangeLabel[r]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchReports(range)} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {isPending && !data && (
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-border/50 bg-card/50 p-4" />
            ))}
          </div>
          <div className="h-72 rounded-2xl border border-border/50 bg-card/50" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-80 rounded-2xl border border-border/50 bg-card/50" />
            <div className="h-80 rounded-2xl border border-border/50 bg-card/50" />
          </div>
        </div>
      )}

      {data && (
        <div className={`mt-6 space-y-4 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
          <ReportsKpis kpis={data.kpis} />

          <SalesChart
            title={range === "12m" ? "Monthly sales" : "Daily sales"}
            subtitle={`Revenue per ${range === "12m" ? "month" : "day"} · ${rangeLabel[range]}`}
            points={data.points}
          />

          {range !== "12m" && (
            <SalesChart
              title="Monthly sales"
              subtitle="Revenue per month · last 12 months"
              points={data.monthlySeries}
            />
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <BestSellingTable items={data.bestSelling} />
            <CustomersPanel customerMix={data.customerMix} topCustomers={data.topCustomers} />
          </div>
        </div>
      )}
    </main>
  );
}
