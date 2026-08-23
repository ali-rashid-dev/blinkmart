import prisma from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

export interface RawReportOrder {
  id: string;
  total: number;
  createdAt: Date;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  area: string;
  city: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    product: {
      id: string;
      name: string;
      category: {
        id: string;
        name: string;
        slug: string;
      } | null;
    } | null;
  }>;
}

export interface RawCustomerOrderStat {
  userId: string;
  userName: string;
  userEmail: string;
  area: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  firstOrderDate: Date;
}

/**
 * Fetch all valid (non-cancelled) orders within a given date range.
 */
export async function getValidOrdersInRange(
  startDate: Date,
  endDate: Date
): Promise<RawReportOrder[]> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: "CANCELLED" as OrderStatus,
      },
    },
    select: {
      id: true,
      total: true,
      createdAt: true,
      userId: true,
      area: true,
      city: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          name: true,
          price: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return orders.map((o) => ({
    id: o.id,
    total: Number(o.total),
    createdAt: o.createdAt,
    userId: o.userId,
    user: o.user,
    area: o.area,
    city: o.city,
    items: o.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      product: item.product,
    })),
  }));
}

/**
 * Fetch overall customer statistics for orders placed in the date range.
 */
export async function getCustomerOrderStatsInRange(
  startDate: Date,
  endDate: Date
): Promise<RawCustomerOrderStat[]> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: "CANCELLED" as OrderStatus,
      },
    },
    select: {
      userId: true,
      total: true,
      createdAt: true,
      area: true,
      city: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const customerMap = new Map<string, RawCustomerOrderStat>();

  for (const o of orders) {
    const existing = customerMap.get(o.userId);
    const orderTotal = Number(o.total);

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += orderTotal;
      if (o.createdAt < existing.firstOrderDate) {
        existing.firstOrderDate = o.createdAt;
      }
    } else {
      customerMap.set(o.userId, {
        userId: o.userId,
        userName: o.user.name || "Customer",
        userEmail: o.user.email,
        area: o.area || o.city || "Local",
        city: o.city || "City",
        orderCount: 1,
        totalSpent: orderTotal,
        firstOrderDate: o.createdAt,
      });
    }
  }

  return Array.from(customerMap.values());
}
