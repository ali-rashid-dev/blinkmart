import prisma from "@/lib/prisma";
import { OrderCannotCancelError, EmptyCartError } from "@/services/order.errors";
import {
  filterOrderableCartItems,
  FREE_DELIVERY_THRESHOLD,
  DEFAULT_DELIVERY_FEE,
} from "@/lib/orders/eligibility";
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
  deliveryDate: Date;
}): Promise<OrderWithItems> {
  const { userId, cart, address, deliveryDate } = params;

  // Retry the whole transaction if we hit a unique constraint collision on `code` (P2002)
  let attempts = 0;
  while (true) {
    try {
      return await prisma.$transaction(async (tx) => {
        const code = generateOrderCode();
        const txCart = await tx.cart.findUnique({
          where: { id: cart.id },
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

        const validItems = filterOrderableCartItems(txCart?.items ?? []);

        if (validItems.length === 0) {
          throw new EmptyCartError();
        }

        // Compute subtotal then round to cents before using threshold and total calculations
        const rawSubtotal = validItems.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );
        const subtotal = Math.round(rawSubtotal * 100) / 100;
        const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
        const total = Math.round((subtotal + deliveryFee) * 100) / 100;
        const itemIds = validItems.map((item) => item.id);
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

        await tx.cartItem.deleteMany({
          where: { id: { in: itemIds }, cartId: cart.id },
        });

        return order;
      });
    } catch (err: any) {
      // Detect Prisma unique constraint on code and retry a few times
      const isP2002 = err && (err.code === "P2002" || err.code === "UniqueConstraintViolation");
      const targetIncludesCode = err?.meta?.target && Array.isArray(err.meta.target) && err.meta.target.includes("code");
      attempts++;
      if (isP2002 && targetIncludesCode && attempts < 5) {
        // try again with a fresh code
        continue;
      }
      throw err;
    }
  }
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
    throw new OrderCannotCancelError(`Order cannot be cancelled in status ${existing.status}`);
  }

  // Perform conditional update so concurrent state changes cannot overwrite cancellation data
  const allowedStatuses: OrderStatus[] = ["PLACED", "CONFIRMED", "PACKED"];
  const updateResult = await prisma.order.updateMany({
    where: { id: existing.id, status: { in: allowedStatuses } },
    data: {
      status: "CANCELLED",
      cancelReason: reason,
      cancelledAt: new Date(),
    },
  });

  if (updateResult.count === 0) {
    const current = await prisma.order.findUnique({
      where: { id: existing.id },
      select: { status: true },
    });
    throw new OrderCannotCancelError(
      `Order cannot be cancelled in status ${current?.status ?? existing.status}`
    );
  }

  return prisma.order.findUnique({
    where: { id: existing.id },
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
  }) as Promise<OrderWithItems>;
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
  // Clamp pagination values to safe bounds
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit || 10)));

  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (deliveryDate) {
    // Parse YYYY-MM-DD into local calendar day boundaries to avoid UTC parsing pitfalls
    const parts = deliveryDate.split("-").map((p) => Number(p));
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const startDate = new Date(y, m - 1, d, 0, 0, 0, 0);
      const endDate = new Date(y, m - 1, d, 23, 59, 59, 999);
      where.deliveryDate = {
        gte: startDate,
        lte: endDate,
      };
    }
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
  const totalPages = Math.ceil(totalItems / safeLimit) || 1;
  const skip = (safePage - 1) * safeLimit;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: safeLimit,
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
  reinstate?: boolean;
}): Promise<OrderWithItems> {
  const { orderId, status, cancelReason, reinstate } = params;

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
    // Treat cancelReason as user-visible data; do not persist internal sentinels.
    data.cancelReason = cancelReason || "Cancelled by store administrator";
    data.cancelledAt = new Date();
  } else if (existing.status === "CANCELLED" && reinstate) {
    // Explicit reinstatement: clear cancellation metadata
    data.cancelReason = null;
    data.cancelledAt = null;
  } else {
    data.cancelReason = existing.cancelReason ?? null;
    data.cancelledAt = existing.cancelledAt ?? null;
  }

  const updateResult = await prisma.order.updateMany({
    where: { id: orderId, status: existing.status },
    data,
  });

  if (updateResult.count === 0) {
    throw new Error(`Order "${orderId}" was updated by another administrator.`);
  }

  return prisma.order.findUniqueOrThrow({
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

