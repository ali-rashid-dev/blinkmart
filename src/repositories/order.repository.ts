import prisma from "@/lib/prisma";
import type { Prisma, OrderStatus } from "@/generated/prisma/client";
import type { CartWithItems } from "@/repositories/cart.repository";
import type { PlaceOrderInput } from "@/validations/order";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            brand: true;
            category: true;
          };
        };
      };
    };
  };
}>;

function generateOrderCode(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${random}`;
}

export async function createOrderInDb(params: {
  userId: string;
  cart: CartWithItems;
  address: PlaceOrderInput;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryDate: Date;
}): Promise<OrderWithItems> {
  const { userId, cart, address, subtotal, deliveryFee, total, deliveryDate } = params;

  return prisma.$transaction(async (tx) => {
    // Generate unique code
    let code = generateOrderCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await tx.order.findUnique({ where: { code } });
      if (!existing) break;
      code = generateOrderCode();
      attempts++;
    }

    // Filter enabled cart items
    const validItems = cart.items.filter(
      (item) => item.product.enabled && (!item.product.brand || item.product.brand.enabled)
    );

    if (validItems.length === 0) {
      throw new Error("No available items in cart to place order.");
    }

    // Create Order
    const order = await tx.order.create({
      data: {
        code,
        userId,
        status: "PLACED",
        subtotal,
        deliveryFee,
        total,
        deliveryDate,
        deliverySlot: "7:00 PM – 10:00 PM",
        fullName: address.fullName,
        phone: address.phone,
        house: address.house,
        street: address.street,
        area: address.area,
        city: address.city,
        postal: address.postal,
        notes: address.notes ?? null,
        items: {
          create: validItems.map((item) => {
            const priceNum = Number(item.product.price);
            const categoryName = item.product.category?.name;
            const unit = categoryName ? `1 ${categoryName.toLowerCase()}` : "1 pack";
            return {
              productId: item.productId,
              name: item.product.name,
              price: priceNum,
              quantity: item.quantity,
              unit,
              imageUrl: item.product.imageUrl ?? null,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    });

    // Update product inventories
    for (const item of validItems) {
      if (item.product.inventory !== null && item.product.inventory >= item.quantity) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } },
        });
      }
    }

    // Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
}

export async function findOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function findOrderByIdOrCode(
  userId: string,
  idOrCode: string
): Promise<OrderWithItems | null> {
  return prisma.order.findFirst({
    where: {
      userId,
      OR: [{ id: idOrCode }, { code: idOrCode }],
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function cancelOrderInDb(
  userId: string,
  orderId: string,
  reason: string
): Promise<OrderWithItems> {
  const existing = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!existing) {
    throw new Error("Order not found");
  }

  if (
    existing.status === "DELIVERED" ||
    existing.status === "OUT_FOR_DELIVERY" ||
    existing.status === "CANCELLED"
  ) {
    throw new Error(`Order cannot be cancelled in status ${existing.status}`);
  }

  return prisma.order.update({
    where: { id: existing.id },
    data: {
      status: "CANCELLED",
      cancelReason: reason,
      cancelledAt: new Date(),
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

export type FindAdminOrdersParams = {
  search?: string;
  status?: OrderStatus;
  deliveryDate?: string;
  page?: number;
  limit?: number;
};

export async function findAdminOrdersInDb(params: FindAdminOrdersParams): Promise<{
  orders: OrderWithItems[];
  totalItems: number;
  totalPages: number;
}> {
  const { search, status, deliveryDate, page = 1, limit = 10 } = params;

  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (deliveryDate) {
    const startDate = new Date(deliveryDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(deliveryDate);
    endDate.setHours(23, 59, 59, 999);
    where.deliveryDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { code: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { area: { contains: term, mode: "insensitive" } },
      { items: { some: { name: { contains: term, mode: "insensitive" } } } },
    ];
  }

  const totalItems = await prisma.order.count({ where });
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const skip = (page - 1) * limit;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return { orders, totalItems, totalPages };
}

export type AdminOrderStats = {
  totalOrders: number;
  placedCount: number;
  confirmedCount: number;
  packedCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
  cancelledCount: number;
  todayOrdersCount: number;
  totalRevenue: number;
};

export async function getAdminOrderStatsInDb(): Promise<AdminOrderStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    placedCount,
    confirmedCount,
    packedCount,
    outForDeliveryCount,
    deliveredCount,
    cancelledCount,
    todayOrdersCount,
    revenueAgg,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PLACED" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "PACKED" } }),
    prisma.order.count({ where: { status: "OUT_FOR_DELIVERY" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);

  return {
    totalOrders,
    placedCount,
    confirmedCount,
    packedCount,
    outForDeliveryCount,
    deliveredCount,
    cancelledCount,
    todayOrdersCount,
    totalRevenue,
  };
}

export async function updateAdminOrderStatusInDb(params: {
  orderId: string;
  status: OrderStatus;
  cancelReason?: string;
}): Promise<OrderWithItems> {
  const { orderId, status, cancelReason } = params;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existing) {
    throw new Error(`Order "${orderId}" not found.`);
  }

  const data: Prisma.OrderUpdateInput = {
    status,
  };

  if (status === "CANCELLED") {
    data.cancelReason = cancelReason || "Cancelled by store administrator";
    data.cancelledAt = new Date();
  }

  return prisma.order.update({
    where: { id: orderId },
    data,
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function findAdminOrderByIdInDb(orderId: string): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

