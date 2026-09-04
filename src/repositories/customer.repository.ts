import prisma from "@/lib/prisma";
import type { CustomerQueryParams, UpdateCustomerInput } from "@/validations/customer";

export type CustomerProfile = {
  id: string;
  userId: string;
  phone: string | null;
  houseNo: string | null;
  street: string | null;
  area: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "USER" | "ADMIN";
  banned: boolean;
  banReason: string | null;
  bannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile: CustomerProfile | null;
  ordersCount: number;
  totalSpent: number;
};

export type CustomerOrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
};

export type CustomerOrder = {
  id: string;
  code: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  createdAt: Date;
  items: CustomerOrderItem[];
};

export type CustomerDetails = CustomerRecord & {
  recentOrders: CustomerOrder[];
};

export type PaginatedCustomers = {
  items: CustomerRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CustomerStats = {
  totalCustomers: number;
  activeCustomers: number;
  bannedCustomers: number;
  newCustomers30Days: number;
};

export async function getCustomersRepository(
  params: CustomerQueryParams
): Promise<PaginatedCustomers> {
  const { search, role, status, sortBy, sortOrder, page, limit } = params;

  // Build prisma filter clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { profile: { phone: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (role && role !== "ALL") {
    where.role = role;
  }

  if (status && status !== "ALL") {
    if (status === "ACTIVE") {
      where.banned = false;
    } else if (status === "BANNED") {
      where.banned = true;
    }
  }

  // Count total matching records
  const total = await prisma.user.count({ where });

  // Determine query strategy based on sort field
  if (sortBy === "totalSpent" || sortBy === "ordersCount") {
    // Fetch all matching users for in-memory sorting
    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        orders: {
          select: {
            total: true,
            status: true,
          },
        },
      },
    });

    const mapped = users.map((user) => {
      const ordersCount = user.orders.length;
      const totalSpent = user.orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + Number(o.total), 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        banned: Boolean(user.banned),
        banReason: user.banReason ?? null,
        bannedAt: user.bannedAt ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
        ordersCount,
        totalSpent,
      };
    });

    mapped.sort((a, b) => {
      const valA = sortBy === "totalSpent" ? a.totalSpent : a.ordersCount;
      const valB = sortBy === "totalSpent" ? b.totalSpent : b.ordersCount;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    const skip = (page - 1) * limit;
    const paginatedItems = mapped.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } else {
    // Direct database pagination and sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        profile: true,
        orders: {
          select: {
            total: true,
            status: true,
          },
        },
      },
    });

    const items: CustomerRecord[] = users.map((user) => {
      const ordersCount = user.orders.length;
      const totalSpent = user.orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + Number(o.total), 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        banned: Boolean(user.banned),
        banReason: user.banReason ?? null,
        bannedAt: user.bannedAt ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
        ordersCount,
        totalSpent,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}

export async function getCustomerByIdRepository(id: string): Promise<CustomerDetails | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      orders: {
        take: 15,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const ordersCount = await prisma.order.count({ where: { userId: id } });
  const orderAggregate = await prisma.order.aggregate({
    where: { userId: id, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });
  const totalSpent = Number(orderAggregate._sum.total ?? 0);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role,
    banned: Boolean(user.banned),
    banReason: user.banReason ?? null,
    bannedAt: user.bannedAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile,
    ordersCount,
    totalSpent,
    recentOrders: user.orders.map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      total: Number(o.total),
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      platformFee: Number(o.platformFee ?? 20),
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        unit: i.unit,
        imageUrl: i.imageUrl,
      })),
    })),
  };
}

export async function updateCustomerRepository(input: UpdateCustomerInput) {
  const { id, name, email, role, phone, houseNo, street, area, city, postalCode } = input;

  return prisma.$transaction(async (tx) => {
    // 1. Check email uniqueness if email changed
    const existing = await tx.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // 2. Update user (handle unique constraint race via Prisma P2002)
    let updatedUser;
    try {
      updatedUser = await tx.user.update({
        where: { id },
        data: {
          name,
          email,
          role,
        },
      });
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "code" in err && (err as any).code === "P2002") {
        // If the unique constraint violation targets the email field, normalize to the existing signal
        const meta = (err as any).meta;
        const target = meta?.target;
        if (Array.isArray(target) ? target.includes("email") : String(target).includes("email")) {
          throw new Error("EMAIL_ALREADY_EXISTS");
        }
      }
      throw err;
    }

    // 3. Upsert profile
    const profile = await tx.userProfile.upsert({
      where: { userId: id },
      create: {
        userId: id,
        phone: phone ?? null,
        houseNo: houseNo ?? null,
        street: street ?? null,
        area: area ?? null,
        city: city ?? null,
        postalCode: postalCode ?? null,
      },
      update: {
        phone: phone ?? null,
        houseNo: houseNo ?? null,
        street: street ?? null,
        area: area ?? null,
        city: city ?? null,
        postalCode: postalCode ?? null,
      },
    });

    return { user: updatedUser, profile };
  });
}

export async function banCustomerRepository(id: string, banReason?: string) {
  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: banReason?.trim() || "Account suspended by administrator",
        bannedAt: new Date(),
      },
    });

    // Revoke user sessions
    await tx.session.deleteMany({
      where: { userId: id },
    });

    return updatedUser;
  });
}

export async function unbanCustomerRepository(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      banned: false,
      banReason: null,
      bannedAt: null,
    },
  });
}

export async function getCustomerStatsRepository(): Promise<CustomerStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalCustomers, bannedCustomers, newCustomers30Days] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { banned: true } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  const activeCustomers = totalCustomers - bannedCustomers;

  return {
    totalCustomers,
    activeCustomers,
    bannedCustomers,
    newCustomers30Days,
  };
}
