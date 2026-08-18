import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type CartWithItems = Prisma.CartGetPayload<{
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

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        brand: true;
        category: true;
      };
    };
  };
}>;

export async function findCartByIdentifier(identifier: {
  userId?: string;
  sessionToken?: string;
}): Promise<CartWithItems | null> {
  if (!identifier.userId && !identifier.sessionToken) {
    return null;
  }

  return prisma.cart.findFirst({
    where: identifier.userId
      ? { userId: identifier.userId }
      : { sessionToken: identifier.sessionToken },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
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

export async function createCart(identifier: {
  userId?: string;
  sessionToken?: string;
}): Promise<CartWithItems> {
  return prisma.cart.create({
    data: {
      ...(identifier.userId ? { userId: identifier.userId } : {}),
      ...(identifier.sessionToken ? { sessionToken: identifier.sessionToken } : {}),
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
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

export async function upsertCartItem(
  cartId: string,
  productId: string,
  quantityDelta: number
): Promise<CartItemWithProduct | null> {
  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });

  if (existing) {
    const newQty = existing.quantity + quantityDelta;
    if (newQty <= 0) {
      await prisma.cartItem.delete({
        where: { id: existing.id },
      });
      return null;
    }
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
    });
  } else {
    if (quantityDelta <= 0) return null;
    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity: quantityDelta,
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
    });
  }
}

export async function updateCartItemQuantity(
  cartId: string,
  productId: string,
  newQuantity: number
): Promise<CartItemWithProduct | null> {
  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });

  if (!existing) {
    if (newQuantity <= 0) return null;
    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity: newQuantity,
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
    });
  }

  if (newQuantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: existing.id },
    });
    return null;
  }

  return prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: newQuantity },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
        },
      },
    },
  });
}

export async function removeCartItem(
  cartId: string,
  productId: string
): Promise<boolean> {
  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });

  if (!existing) return false;

  await prisma.cartItem.delete({
    where: { id: existing.id },
  });
  return true;
}

export async function clearCart(cartId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });
}

export async function mergeCarts(
  guestCartId: string,
  userCartId: string
): Promise<void> {
  if (guestCartId === userCartId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { id: guestCartId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) {
      await prisma.cart.delete({ where: { id: guestCartId } }).catch(() => {});
    }
    return;
  }

  for (const item of guestCart.items) {
    await upsertCartItem(userCartId, item.productId, item.quantity);
  }

  await prisma.cart.delete({ where: { id: guestCartId } }).catch(() => {});
}
