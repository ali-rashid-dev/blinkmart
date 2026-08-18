"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getCartDetails,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearUserCart,
  ProductNotFoundError,
  ProductDisabledError,
  InvalidQuantityError,
  type CartDetails,
} from "@/services/cart.service";
import {
  addToCartSchema,
  updateCartQuantitySchema,
  removeFromCartSchema,
  getCartFieldErrors,
} from "@/validations/cart";

const GUEST_CART_COOKIE = "blinkmart_cart_id";

export type CartActionErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_DISABLED"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type CartActionError = {
  code: CartActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type CartActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: CartActionError };

function buildError(
  code: CartActionErrorCode,
  message: string,
  details?: Record<string, string>
): CartActionResult<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

async function getCartIdentifier(): Promise<{ userId?: string; sessionToken?: string }> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (session?.user?.id) {
    return { userId: session.user.id };
  }

  const cookieStore = await cookies();
  let guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!guestToken) {
    guestToken = crypto.randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, guestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }

  return { sessionToken: guestToken };
}

export async function getCartAction(): Promise<CartActionResult<CartDetails>> {
  try {
    const identifier = await getCartIdentifier();
    const cart = await getCartDetails(identifier);
    return { success: true, data: cart };
  } catch (error) {
    console.error("Failed to load cart:", error);
    return buildError("DATABASE_ERROR", "Unable to load your cart.");
  }
}

export async function addToCartAction(input: {
  productId: string;
  quantity?: number;
}): Promise<CartActionResult<CartDetails>> {
  try {
    const parsed = addToCartSchema.safeParse(input);
    if (!parsed.success) {
      return buildError(
        "VALIDATION_ERROR",
        "Invalid product or quantity.",
        getCartFieldErrors(addToCartSchema, input)
      );
    }

    const identifier = await getCartIdentifier();
    const cart = await addItemToCart(identifier, parsed.data);
    return { success: true, data: cart };
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return buildError("PRODUCT_NOT_FOUND", error.message);
    }
    if (error instanceof ProductDisabledError) {
      return buildError("PRODUCT_DISABLED", error.message);
    }
    if (error instanceof InvalidQuantityError) {
      return buildError("VALIDATION_ERROR", error.message);
    }
    console.error("Failed to add item to cart:", error);
    return buildError("DATABASE_ERROR", "Unable to add item to cart right now.");
  }
}

export async function updateCartQuantityAction(input: {
  productId: string;
  quantity: number;
}): Promise<CartActionResult<CartDetails>> {
  try {
    const parsed = updateCartQuantitySchema.safeParse(input);
    if (!parsed.success) {
      return buildError(
        "VALIDATION_ERROR",
        "Invalid quantity specified.",
        getCartFieldErrors(updateCartQuantitySchema, input)
      );
    }

    const identifier = await getCartIdentifier();
    const cart = await updateItemQuantity(identifier, parsed.data);
    return { success: true, data: cart };
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    return buildError("DATABASE_ERROR", "Unable to update quantity.");
  }
}

export async function removeFromCartAction(
  productId: string
): Promise<CartActionResult<CartDetails>> {
  try {
    const parsed = removeFromCartSchema.safeParse({ productId });
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid product ID.");
    }

    const identifier = await getCartIdentifier();
    const cart = await removeItemFromCart(identifier, parsed.data.productId);
    return { success: true, data: cart };
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    return buildError("DATABASE_ERROR", "Unable to remove item from cart.");
  }
}

export async function clearCartAction(): Promise<CartActionResult<CartDetails>> {
  try {
    const identifier = await getCartIdentifier();
    const cart = await clearUserCart(identifier);
    return { success: true, data: cart };
  } catch (error) {
    console.error("Failed to clear cart:", error);
    return buildError("DATABASE_ERROR", "Unable to clear cart.");
  }
}
