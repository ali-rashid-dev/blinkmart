import type { RangeKey, ReportsData, SalesPoint, BestSellingItem, CustomerMixItem, TopCustomerItem } from "@/lib/reports/types";
import { getValidOrdersInRange, getCustomerOrderStatsInRange, type RawReportOrder } from "@/repositories/reports.repository";
import { getCategoryEmoji, formatCurrency, calculateDelta, getInitials } from "@/lib/reports/format";

export { getCategoryEmoji, formatCurrency, formatCompact, calculateDelta, getInitials } from "@/lib/reports/format";

export function getDateRanges(range: RangeKey, referenceDate = new Date()) {
  const now = new Date(referenceDate);
  let currentStart: Date;
  let priorStart: Date;
  let priorEnd: Date;

  if (range === "7d") {
    currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    priorStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    priorEnd = new Date(currentStart.getTime() - 1);
  } else if (range === "30d") {
    currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    priorStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    priorEnd = new Date(currentStart.getTime() - 1);
  } else {
    // 12m
    currentStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    priorStart = new Date(now.getFullYear() - 2, now.getMonth(), 1);
    priorEnd = new Date(currentStart.getTime() - 1);
  }

  return {
    currentStart,
    currentEnd: now,
    priorStart,
    priorEnd,
  };
}

export async function getReportsData(range: RangeKey, referenceDate = new Date()): Promise<ReportsData> {
  const { currentStart, currentEnd, priorStart, priorEnd } = getDateRanges(range, referenceDate);

  const [currentOrders, priorOrders] = await Promise.all([
    getValidOrdersInRange(currentStart, currentEnd),
    getValidOrdersInRange(priorStart, priorEnd),
  ]);

  // KPIs
  const currentRevenue = currentOrders.reduce((s, o) => s + o.total, 0);
  const priorRevenue = priorOrders.reduce((s, o) => s + o.total, 0);

  const currentOrderCount = currentOrders.length;
  const priorOrderCount = priorOrders.length;

  const currentAvgBasket = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const priorAvgBasket = priorOrderCount > 0 ? priorRevenue / priorOrderCount : 0;

  const currentCustomersCount = new Set(currentOrders.map((o) => o.userId)).size;
  const priorCustomersCount = new Set(priorOrders.map((o) => o.userId)).size;

  const caption = `vs prior ${range}`;

  const kpis: ReportsData["kpis"] = {
    revenue: {
      value: formatCurrency(currentRevenue),
      rawValue: currentRevenue,
      delta: calculateDelta(currentRevenue, priorRevenue),
      caption,
    },
    orders: {
      value: currentOrderCount.toLocaleString("en-US"),
      rawValue: currentOrderCount,
      delta: calculateDelta(currentOrderCount, priorOrderCount),
      caption,
    },
    average: {
      value: formatCurrency(currentAvgBasket),
      rawValue: currentAvgBasket,
      delta: calculateDelta(currentAvgBasket, priorAvgBasket),
      caption,
    },
    customers: {
      value: currentCustomersCount.toLocaleString("en-US"),
      rawValue: currentCustomersCount,
      delta: calculateDelta(currentCustomersCount, priorCustomersCount),
      caption,
    },
  };

  // Points (Current Range Series)
  const points = buildSeriesForRange(currentOrders, range, referenceDate);

  // Monthly series (Always 12m)
  const twelveMonthsStart = new Date(referenceDate.getFullYear() - 1, referenceDate.getMonth(), 1);
  const monthlyOrders = range === "12m" ? currentOrders : await getValidOrdersInRange(twelveMonthsStart, referenceDate);
  const monthlySeries = buildMonthlySeries(monthlyOrders, referenceDate);

  // Best Selling Products
  const bestSelling = buildBestSellingItems(currentOrders);

  // Customer Breakdown & Top Customers
  const customerOrderStats = await getCustomerOrderStatsInRange(currentStart, currentEnd);
  const { customerMix, topCustomers } = buildCustomerInsights(customerOrderStats);

  return {
    range,
    kpis,
    points,
    monthlySeries,
    bestSelling,
    customerMix,
    topCustomers,
  };
}

export function buildSeriesForRange(orders: RawReportOrder[], range: RangeKey, refDate = new Date()): SalesPoint[] {
  if (range === "12m") {
    return buildMonthlySeries(orders, refDate);
  }

  const daysCount = range === "7d" ? 7 : 30;
  const points: SalesPoint[] = [];
  const ordersByDate = new Map<string, { revenue: number; count: number }>();

  for (const o of orders) {
    const d = new Date(o.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const cur = ordersByDate.get(dateKey) || { revenue: 0, count: 0 };
    ordersByDate.set(dateKey, {
      revenue: cur.revenue + o.total,
      count: cur.count + 1,
    });
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const endTs = refDate.getTime();
  const startTs = endTs - (daysCount - 1) * msPerDay;

  for (let i = 0; i < daysCount; i++) {
    const targetDate = new Date(startTs + i * msPerDay);
    const year = targetDate.getFullYear();
    const monthStr = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(targetDate.getDate()).padStart(2, "0");
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    const label =
      range === "7d"
        ? targetDate.toLocaleDateString("en-US", { weekday: "short" })
        : targetDate.toLocaleDateString("en-US", { day: "numeric", month: "short" });

    const data = ordersByDate.get(dateKey) || { revenue: 0, count: 0 };

    points.push({
      label,
      value: Number(data.revenue.toFixed(2)),
      orders: data.count,
      dateIso: dateKey,
    });
  }

  return points;
}

export function buildMonthlySeries(orders: RawReportOrder[], refDate = new Date()): SalesPoint[] {
  const points: SalesPoint[] = [];
  const ordersByMonth = new Map<string, { revenue: number; count: number }>();

  for (const o of orders) {
    const d = new Date(o.createdAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = ordersByMonth.get(monthKey) || { revenue: 0, count: 0 };
    ordersByMonth.set(monthKey, {
      revenue: cur.revenue + o.total,
      count: cur.count + 1,
    });
  }

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-indexed

  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(currentYear, currentMonth - i, 1);
    const y = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, "0");
    const monthKey = `${y}-${mStr}`;

    const label = targetDate.toLocaleDateString("en-US", { month: "short" });
    const data = ordersByMonth.get(monthKey) || { revenue: 0, count: 0 };

    points.push({
      label,
      value: Number(data.revenue.toFixed(2)),
      orders: data.count,
      dateIso: monthKey,
    });
  }

  return points;
}

export function buildBestSellingItems(orders: RawReportOrder[]): BestSellingItem[] {
  const productAgg = new Map<
    string,
    {
      id: string;
      name: string;
      category: string;
      emoji: string;
      units: number;
      revenue: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const pid = item.productId || item.name;
      const catName = item.product?.category?.name || "General Grocery";
      const catSlug = item.product?.category?.slug;
      const emoji = getCategoryEmoji(catName, catSlug);
      const itemRev = item.price * item.quantity;

      const existing = productAgg.get(pid);
      if (existing) {
        existing.units += item.quantity;
        existing.revenue += itemRev;
      } else {
        productAgg.set(pid, {
          id: pid,
          name: item.name,
          category: catName.replace(/^[\p{Extended_Pictographic}\s]+/u, "").trim(),
          emoji,
          units: item.quantity,
          revenue: itemRev,
        });
      }
    }
  }

  const sorted = Array.from(productAgg.values()).sort((a, b) => b.units - a.units);
  const top10 = sorted.slice(0, 10);
  const totalTopUnits = top10.reduce((s, p) => s + p.units, 0);

  return top10.map((p) => ({
    ...p,
    revenue: Number(p.revenue.toFixed(2)),
    share: totalTopUnits > 0 ? Number(((p.units / totalTopUnits) * 100).toFixed(1)) : 0,
  }));
}

export function buildCustomerInsights(stats: Array<{
  userId: string;
  userName: string;
  userEmail: string;
  area: string;
  city: string;
  orderCount: number;
  totalSpent: number;
}>): {
  customerMix: CustomerMixItem[];
  topCustomers: TopCustomerItem[];
} {
  let newCount = 0;
  let returningCount = 0;
  let vipCount = 0;

  for (const c of stats) {
    if (c.orderCount >= 5 || c.totalSpent >= 500) {
      vipCount++;
    } else if (c.orderCount > 1) {
      returningCount++;
    } else {
      newCount++;
    }
  }

  const customerMix: CustomerMixItem[] = [
    { label: "New customers", value: newCount, tone: "bg-primary" },
    { label: "Returning", value: returningCount, tone: "bg-secondary" },
    { label: "VIP", value: vipCount, tone: "bg-success" },
  ];

  const sortedBySpend = [...stats].sort((a, b) => b.totalSpent - a.totalSpent);
  const top5 = sortedBySpend.slice(0, 5);

  const topCustomers: TopCustomerItem[] = top5.map((c) => {
    let status: "new" | "returning" | "vip" = "new";
    if (c.orderCount >= 5 || c.totalSpent >= 500) {
      status = "vip";
    } else if (c.orderCount > 1) {
      status = "returning";
    }

    return {
      id: c.userId,
      name: c.userName,
      initials: getInitials(c.userName),
      area: `${c.area}, ${c.city}`.replace(/^,\s*|,\s*$/g, ""),
      orders: c.orderCount,
      spent: Number(c.totalSpent.toFixed(2)),
      status,
    };
  });

  return {
    customerMix,
    topCustomers,
  };
}
