import {
  createOrderInDb,
  findOrdersByUserId,
  findOrderByIdOrCode,
  cancelOrderInDb,
  findAdminOrdersInDb,
  getAdminOrderStatsInDb,
  updateAdminOrderStatusInDb,
  findAdminOrderByIdInDb,
  type OrderWithItems,
  type AdminOrderStats,
} from "@/repositories/order.repository";
import type { OrderStatus as PrismaOrderStatus } from "@/generated/prisma/client";
import { findCartByIdentifier } from "@/repositories/cart.repository";
import { addItemToCart } from "@/services/cart.service";
import {
  placeOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  type PlaceOrderInput,
  type CancelOrderInput,
  type UpdateOrderStatusInput,
} from "@/validations/order";
import {
  type Order,
  type OrderStatus,
  type OrderItem,
  type OrderTimelineEvent,
  getAvailableDeliveryDates,
} from "@/lib/orders/types";
import { parseISO, isBefore, startOfDay } from "date-fns";

export class EmptyCartError extends Error {
  constructor() {
    super("Your cart is empty. Add items to cart before placing an order.");
    this.name = "EmptyCartError";
  }
}

export class InvalidDeliveryDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDeliveryDateError";
  }
}

export class OrderNotFoundError extends Error {
  constructor(idOrCode: string) {
    super(`Order "${idOrCode}" was not found.`);
    this.name = "OrderNotFoundError";
  }
}

const DB_STATUS_TO_DOMAIN: Record<string, OrderStatus> = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export function mapPrismaOrderToDomainOrder(dbOrder: OrderWithItems): Order {
  const status = DB_STATUS_TO_DOMAIN[dbOrder.status] ?? "placed";
  const subtotal = Number(dbOrder.subtotal);
  const deliveryFee = Number(dbOrder.deliveryFee);
  const total = Number(dbOrder.total);

  const items: OrderItem[] = dbOrder.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    unit: item.unit,
    image: item.imageUrl || item.product?.imageUrl || "🛒",
  }));

  // Build realistic timeline step events
  const timeline: OrderTimelineEvent[] = [
    { status: "placed", at: dbOrder.createdAt.toISOString() },
  ];

  if (status === "confirmed" || status === "packed" || status === "out_for_delivery" || status === "delivered") {
    timeline.push({
      status: "confirmed",
      at: new Date(dbOrder.createdAt.getTime() + 5 * 60 * 1000).toISOString(),
    });
  }

  if (status === "packed" || status === "out_for_delivery" || status === "delivered") {
    timeline.push({
      status: "packed",
      at: new Date(dbOrder.createdAt.getTime() + 20 * 60 * 1000).toISOString(),
    });
  }

  if (status === "out_for_delivery" || status === "delivered") {
    timeline.push({
      status: "out_for_delivery",
      at: new Date(dbOrder.createdAt.getTime() + 45 * 60 * 1000).toISOString(),
    });
  }

  if (status === "delivered") {
    timeline.push({
      status: "delivered",
      at: dbOrder.updatedAt.toISOString(),
    });
  }

  if (status === "cancelled") {
    timeline.push({
      status: "cancelled",
      at: (dbOrder.cancelledAt || dbOrder.updatedAt).toISOString(),
    });
  }

  return {
    id: dbOrder.id,
    code: dbOrder.code,
    status,
    placedAt: dbOrder.createdAt.toISOString(),
    deliveryDate: dbOrder.deliveryDate.toISOString().split("T")[0]!,
    deliverySlot: dbOrder.deliverySlot,
    cancelReason: dbOrder.cancelReason ?? null,
    cancelledAt: dbOrder.cancelledAt ? dbOrder.cancelledAt.toISOString() : null,
    subtotal,
    deliveryFee,
    total,
    address: {
      fullName: dbOrder.fullName,
      phone: dbOrder.phone,
      house: dbOrder.house,
      street: dbOrder.street,
      area: dbOrder.area,
      city: dbOrder.city,
      postal: dbOrder.postal,
      notes: dbOrder.notes ?? null,
    },
    items,
    timeline,
  };
}

export async function placeOrder(
  userId: string,
  input: PlaceOrderInput
): Promise<Order> {
  const parsed = placeOrderSchema.parse(input);

  // Validate cart
  const cart = await findCartByIdentifier({ userId });
  if (!cart || cart.items.length === 0) {
    throw new EmptyCartError();
  }

  const validItems = cart.items.filter(
    (item) => item.product.enabled && (!item.product.brand || item.product.brand.enabled)
  );

  if (validItems.length === 0) {
    throw new EmptyCartError();
  }

  // Validate delivery date against available windows (cutoff rule)
  const availableWindows = getAvailableDeliveryDates(new Date());
  const minAvailableIso = availableWindows[0]!.dateIso;
  const requestedDate = startOfDay(parseISO(parsed.deliveryDate));
  const minAvailableDate = startOfDay(parseISO(minAvailableIso));

  if (isBefore(requestedDate, minAvailableDate)) {
    throw new InvalidDeliveryDateError(
      `Selected delivery date is past the 5:00 PM cutoff window. Earliest delivery date is ${minAvailableIso}.`
    );
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of validItems) {
    subtotal += Number(item.product.price) * item.quantity;
  }
  subtotal = Math.round(subtotal * 100) / 100;
  const deliveryFee = subtotal >= 30 ? 0 : 2.99;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const deliveryDateObj = parseISO(parsed.deliveryDate);

  const dbOrder = await createOrderInDb({
    userId,
    cart,
    address: parsed,
    subtotal,
    deliveryFee,
    total,
    deliveryDate: deliveryDateObj,
  });

  return mapPrismaOrderToDomainOrder(dbOrder);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const dbOrders = await findOrdersByUserId(userId);
  return dbOrders.map(mapPrismaOrderToDomainOrder);
}

export async function getUserOrderDetail(
  userId: string,
  idOrCode: string
): Promise<Order | null> {
  const dbOrder = await findOrderByIdOrCode(userId, idOrCode);
  if (!dbOrder) return null;
  return mapPrismaOrderToDomainOrder(dbOrder);
}

export async function cancelUserOrder(
  userId: string,
  input: CancelOrderInput
): Promise<Order> {
  const parsed = cancelOrderSchema.parse(input);
  const dbOrder = await cancelOrderInDb(userId, parsed.orderId, parsed.reason);
  return mapPrismaOrderToDomainOrder(dbOrder);
}

export async function reorderUserOrder(
  userId: string,
  orderId: string
): Promise<{ success: boolean; itemCount: number }> {
  const order = await findOrderByIdOrCode(userId, orderId);
  if (!order) {
    throw new OrderNotFoundError(orderId);
  }

  let itemCount = 0;
  for (const item of order.items) {
    if (item.product && item.product.enabled) {
      await addItemToCart({ userId }, { productId: item.productId, quantity: item.quantity });
      itemCount += item.quantity;
    }
  }

  return { success: true, itemCount };
}

export async function getAdminOrders(params: {
  search?: string;
  status?: string;
  deliveryDate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: Order[];
  totalItems: number;
  totalPages: number;
}> {
  let dbStatus: PrismaOrderStatus | undefined = undefined;
  if (params.status && params.status !== "ALL" && params.status !== "all") {
    const uppercase = params.status.toUpperCase();
    if (["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(uppercase)) {
      dbStatus = uppercase as PrismaOrderStatus;
    }
  }

  const result = await findAdminOrdersInDb({
    search: params.search,
    status: dbStatus,
    deliveryDate: params.deliveryDate,
    page: params.page,
    limit: params.limit,
  });

  return {
    items: result.orders.map(mapPrismaOrderToDomainOrder),
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function getAdminOrderStats(): Promise<AdminOrderStats> {
  return getAdminOrderStatsInDb();
}

export async function updateAdminOrderStatus(
  input: UpdateOrderStatusInput
): Promise<Order> {
  const parsed = updateOrderStatusSchema.parse(input);
  const updatedDbOrder = await updateAdminOrderStatusInDb({
    orderId: parsed.orderId,
    status: parsed.status,
    cancelReason: parsed.cancelReason ?? undefined,
  });
  return mapPrismaOrderToDomainOrder(updatedDbOrder);
}

export async function getAdminOrderDetail(orderId: string): Promise<Order | null> {
  const dbOrder = await findAdminOrderByIdInDb(orderId);
  if (!dbOrder) return null;
  return mapPrismaOrderToDomainOrder(dbOrder);
}

