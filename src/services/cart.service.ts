import {
  findCartByIdentifier,
  createCart,
  upsertCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  mergeCarts,
  type CartWithItems,
} from "@/repositories/cart.repository";
import { findCustomerProductById } from "@/repositories/product.repository";
import {
  addToCartSchema,
  updateCartQuantitySchema,
  removeFromCartSchema,
  type AddToCartInput,
  type UpdateCartQuantityInput,
} from "@/validations/cart";

export class ProductNotFoundError extends Error {
  constructor(public productId: string) {
    super(`Product with ID "${productId}" was not found.`);
    this.name = "ProductNotFoundError";
  }
}

export class ProductDisabledError extends Error {
  constructor(public productName: string) {
    super(`Product "${productName}" is currently unavailable.`);
    this.name = "ProductDisabledError";
  }
}

export class InvalidQuantityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidQuantityError";
  }
}

export interface CartLineItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  maxQuantity: number;
  total: number;
  enabled: boolean;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface CartDetails {
  id: string;
  lines: CartLineItem[];
  totals: CartTotals;
}

export function calculateCartTotals(lines: CartLineItem[]): CartTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (const line of lines) {
    subtotal += line.price * line.quantity;
    itemCount += line.quantity;
  }

  // Round currency to 2 decimal places cleanly
  subtotal = Math.round(subtotal * 100) / 100;
  const tax = 0; // Tax can be expanded if needed
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    subtotal,
    tax,
    total,
    itemCount,
  };
}

function mapCartToDetails(cart: CartWithItems): CartDetails {
  const lines: CartLineItem[] = cart.items.map((item) => {
    const priceNum = Number(item.product.price);
    const lineTotal = Math.round(priceNum * item.quantity * 100) / 100;
    const isProductEnabled =
      item.product.enabled && (!item.product.brand || item.product.brand.enabled);

    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: priceNum,
      quantity: item.quantity,
      unit: item.product.category?.name ? `1 ${item.product.category.name.toLowerCase()}` : "1 pack",
      image: item.product.imageUrl || "🛒",
      maxQuantity: 99,
      total: lineTotal,
      enabled: isProductEnabled,
    };
  });

  // Filter out products that are disabled or whose brands are disabled from active calculations
  const activeLines = lines.filter((line) => line.enabled);
  const totals = calculateCartTotals(activeLines);

  return {
    id: cart.id,
    lines,
    totals,
  };
}

export async function getOrCreateCart(identifier: {
  userId?: string;
  sessionToken?: string;
}): Promise<CartWithItems> {
  if (!identifier.userId && !identifier.sessionToken) {
    throw new Error("Either userId or sessionToken is required to access cart.");
  }

  let cart = await findCartByIdentifier(identifier);
  if (!cart) {
    cart = await createCart(identifier);
  }
  return cart;
}

export async function getCartDetails(identifier: {
  userId?: string;
  sessionToken?: string;
}): Promise<CartDetails> {
  const cart = await getOrCreateCart(identifier);
  return mapCartToDetails(cart);
}

export async function addItemToCart(
  identifier: { userId?: string; sessionToken?: string },
  input: AddToCartInput
): Promise<CartDetails> {
  const parsed = addToCartSchema.parse(input);

  // Verify product exists & customer accessible
  const product = await findCustomerProductById(parsed.productId);
  if (!product) {
    throw new ProductNotFoundError(parsed.productId);
  }

  if (!product.enabled || (product.brand && !product.brand.enabled)) {
    throw new ProductDisabledError(product.name);
  }

  const cart = await getOrCreateCart(identifier);
  await upsertCartItem(cart.id, parsed.productId, parsed.quantity);

  return getCartDetails(identifier);
}

export async function updateItemQuantity(
  identifier: { userId?: string; sessionToken?: string },
  input: UpdateCartQuantityInput
): Promise<CartDetails> {
  const parsed = updateCartQuantitySchema.parse(input);

  const cart = await getOrCreateCart(identifier);
  await updateCartItemQuantity(cart.id, parsed.productId, parsed.quantity);

  return getCartDetails(identifier);
}

export async function removeItemFromCart(
  identifier: { userId?: string; sessionToken?: string },
  productId: string
): Promise<CartDetails> {
  const parsed = removeFromCartSchema.parse({ productId });

  const cart = await getOrCreateCart(identifier);
  await removeCartItem(cart.id, parsed.productId);

  return getCartDetails(identifier);
}

export async function clearUserCart(identifier: {
  userId?: string;
  sessionToken?: string;
}): Promise<CartDetails> {
  const cart = await getOrCreateCart(identifier);
  await clearCart(cart.id);

  return getCartDetails(identifier);
}

export async function handleGuestCartTransfer(
  guestToken: string,
  userId: string
): Promise<CartDetails> {
  const guestCart = await findCartByIdentifier({ sessionToken: guestToken });
  if (guestCart) {
    const userCart = await getOrCreateCart({ userId });
    await mergeCarts(guestCart.id, userCart.id);
  }
  return getCartDetails({ userId });
}
