"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/authz";
import { formatCurrency } from "@/lib/currency";

export type AdminDashboardErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type AdminDashboardError = {
  code: AdminDashboardErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type AdminDashboardActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AdminDashboardError };

function buildError(
  code: AdminDashboardErrorCode,
  message: string,
  details?: Record<string, string>
): AdminDashboardActionResult<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}

export type DashboardRecentOrder = {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  itemsCount: number;
  createdAt: string;
};

export type DashboardSalesPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type DashboardData = {
  kpis: {
    totalRevenue: { value: string; rawValue: number; delta: number };
    totalOrders: { value: string; rawValue: number; delta: number };
    activeCustomers: { value: string; rawValue: number; delta: number };
    catalogProducts: { value: string; rawValue: number; activeCount: number };
    monthlyDeliveryFee: { value: string; rawValue: number; delta: number };
    monthlyPlatformFee: { value: string; rawValue: number; delta: number };
  };
  statusBreakdown: {
    placed: number;
    confirmed: number;
    packed: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
  };
  operational: {
    ordersTodayCount: number;
    activeProductsCount: number;
    liveCategoriesCount: number;
    activeBrandsCount: number;
  };
  recentOrders: DashboardRecentOrder[];
  salesTrend: DashboardSalesPoint[];
};

export async function getAdminDashboardAction(): Promise<
  AdminDashboardActionResult<DashboardData>
> {
  const authCheck = await requireAdmin<
    AdminDashboardErrorCode,
    AdminDashboardActionResult<never>
  >(buildError);
  if (isAuthError(authCheck)) return authCheck;

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPriorMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch parallel DB queries
    const [
      allOrders,
      priorOrders,
      ordersToday,
      totalUsers,
      priorUsers,
      totalProducts,
      activeProductsCount,
      liveCategoriesCount,
      activeBrandsCount,
      recentOrdersRaw,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startOfCurrentMonth } },
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfPriorMonth, lt: startOfCurrentMonth } },
        select: { total: true, deliveryFee: true, platformFee: true, status: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({
        where: { role: "USER", createdAt: { lt: startOfCurrentMonth } },
      }),
      prisma.product.count(),
      prisma.product.count({ where: { enabled: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { enabled: true } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
    ]);

    // Calculate revenue & delta
    const currentValidOrders = allOrders.filter((o) => o.status !== "CANCELLED");
    const currentRevenue = currentValidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const priorValidOrders = priorOrders.filter((o) => o.status !== "CANCELLED");
    const priorRevenue = priorValidOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const revenueDelta =
      priorRevenue > 0
        ? Number((((currentRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1))
        : currentRevenue > 0
        ? 100
        : 0;

    const ordersCount = allOrders.length;
    const priorOrdersCount = priorOrders.length;
    const ordersDelta =
      priorOrdersCount > 0
        ? Number((((ordersCount - priorOrdersCount) / priorOrdersCount) * 100).toFixed(1))
        : ordersCount > 0
        ? 100
        : 0;

    // Monthly Delivery Fee & Platform Fee calculations
    const currentDeliveryFee = currentValidOrders.reduce((sum, o) => sum + Number(o.deliveryFee), 0);
    const priorDeliveryFee = priorValidOrders.reduce((sum, o) => sum + Number(o.deliveryFee), 0);
    const deliveryFeeDelta =
      priorDeliveryFee > 0
        ? Number((((currentDeliveryFee - priorDeliveryFee) / priorDeliveryFee) * 100).toFixed(1))
        : currentDeliveryFee > 0
        ? 100
        : 0;

    const currentPlatformFee = currentValidOrders.reduce((sum, o) => sum + Number(o.platformFee ?? 20), 0);
    const priorPlatformFee = priorValidOrders.reduce((sum, o) => sum + Number(o.platformFee ?? 20), 0);
    const platformFeeDelta =
      priorPlatformFee > 0
        ? Number((((currentPlatformFee - priorPlatformFee) / priorPlatformFee) * 100).toFixed(1))
        : currentPlatformFee > 0
        ? 100
        : 0;

    const customersDelta =
      priorUsers > 0
        ? Number((((totalUsers - priorUsers) / priorUsers) * 100).toFixed(1))
        : totalUsers > 0
        ? 100
        : 0;

    // Status breakdown
    const statusBreakdown = {
      placed: 0,
      confirmed: 0,
      packed: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    allOrders.forEach((o) => {
      if (o.status === "PLACED") statusBreakdown.placed++;
      else if (o.status === "CONFIRMED") statusBreakdown.confirmed++;
      else if (o.status === "PACKED") statusBreakdown.packed++;
      else if (o.status === "OUT_FOR_DELIVERY") statusBreakdown.outForDelivery++;
      else if (o.status === "DELIVERED") statusBreakdown.delivered++;
      else if (o.status === "CANCELLED") statusBreakdown.cancelled++;
    });

    // 7-day Sales Trend
    const salesTrendMap = new Map<string, { revenue: number; orders: number }>();
    const last7Days: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const dateIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      salesTrendMap.set(dateIso, { revenue: 0, orders: 0 });
      last7Days.push(dateIso);
    }

    allOrders.forEach((o) => {
      if (o.status === "CANCELLED") return;
      const d = new Date(o.createdAt);
      const dateIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (salesTrendMap.has(dateIso)) {
        const cur = salesTrendMap.get(dateIso)!;
        cur.revenue += Number(o.total);
        cur.orders += 1;
      }
    });

    const salesTrend: DashboardSalesPoint[] = last7Days.map((iso) => {
      const d = new Date(iso + "T00:00:00");
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const stats = salesTrendMap.get(iso) || { revenue: 0, orders: 0 };
      return {
        label,
        revenue: Number(stats.revenue.toFixed(2)),
        orders: stats.orders,
      };
    });

    // Format recent orders
    const recentOrders: DashboardRecentOrder[] = recentOrdersRaw.map((o) => ({
      id: o.id,
      code: o.code,
      customerName: o.fullName || o.user.name || "Customer",
      customerEmail: o.user.email || "",
      status: o.status,
      total: Number(o.total),
      itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: o.createdAt.toISOString(),
    }));



    return {
      success: true,
      data: {
        kpis: {
          totalRevenue: {
            value: formatCurrency(currentRevenue),
            rawValue: currentRevenue,
            delta: revenueDelta,
          },
          totalOrders: {
            value: ordersCount.toLocaleString("en-US"),
            rawValue: ordersCount,
            delta: ordersDelta,
          },
          activeCustomers: {
            value: totalUsers.toLocaleString("en-US"),
            rawValue: totalUsers,
            delta: customersDelta,
          },
          catalogProducts: {
            value: totalProducts.toLocaleString("en-US"),
            rawValue: totalProducts,
            activeCount: activeProductsCount,
          },
          monthlyDeliveryFee: {
            value: formatCurrency(currentDeliveryFee),
            rawValue: currentDeliveryFee,
            delta: deliveryFeeDelta,
          },
          monthlyPlatformFee: {
            value: formatCurrency(currentPlatformFee),
            rawValue: currentPlatformFee,
            delta: platformFeeDelta,
          },
        },
        statusBreakdown,
        operational: {
          ordersTodayCount: ordersToday,
          activeProductsCount,
          liveCategoriesCount,
          activeBrandsCount,
        },
        recentOrders,
        salesTrend,
      },
    };
  } catch (error) {
    console.error("Failed to load admin dashboard data:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve live dashboard metrics.");
  }
}
