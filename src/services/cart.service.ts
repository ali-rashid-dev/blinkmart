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
import { calculateDeliveryFee, calculatePlatformFee } from "@/lib/orders/eligibility";

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

export class VariantUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VariantUnavailableError";
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
  variantId: string | null;
  sku: string | null;
  attributes: Record<string, string>;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  discountPercent: number;
  originalTotal: number;
  quantity: number;
  unit: string;
  image: string;
  maxQuantity: number;
  total: number;
  enabled: boolean;
}

export interface CartTotals {
  subtotal: number;
  originalSubtotal: number;
  discountAmount: number;
  discountPercent: number;
  deliveryFee: number;
  platformFee: number;
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
  let originalSubtotal = 0;
  let itemCount = 0;

  for (const line of lines) {
    const effective = line.effectivePrice ?? (line.salePrice && line.salePrice < line.price ? line.salePrice : line.price);
    const original = line.price;
    subtotal += effective * line.quantity;
    originalSubtotal += original * line.quantity;
    itemCount += line.quantity;
  }

  // Round currency to 2 decimal places cleanly
  subtotal = Math.round(subtotal * 100) / 100;
  originalSubtotal = Math.round(originalSubtotal * 100) / 100;
  const discountAmount = Math.max(0, Math.round((originalSubtotal - subtotal) * 100) / 100);
  const discountPercent = originalSubtotal > 0 && discountAmount > 0
    ? Math.round((discountAmount / originalSubtotal) * 100)
    : 0;

  const deliveryFee = calculateDeliveryFee(subtotal);
  const platformFee = calculatePlatformFee(subtotal);
  const tax = 0; // Tax can be expanded if needed
  const total = Math.round((subtotal + deliveryFee + platformFee + tax) * 100) / 100;

  return {
    subtotal,
    originalSubtotal,
    discountAmount,
    discountPercent,
    deliveryFee,
    platformFee,
    tax,
    total,
    itemCount,
  };
}

function mapCartToDetails(cart: CartWithItems): CartDetails {
  const lines: CartLineItem[] = cart.items.map((item) => {
    const priceNum = Number(item.variant?.price ?? item.product.price);
    const variantSale = item.variant?.salePrice;
    const salePriceNum = variantSale !== null && variantSale !== undefined
      ? Number(variantSale)
      : item.variant ? null : item.product.salePrice !== null ? Number(item.product.salePrice) : null;
    const hasSale = salePriceNum !== null && salePriceNum > 0 && salePriceNum < priceNum;
    const effectivePrice = hasSale ? salePriceNum : priceNum;
    const discountPercent = hasSale ? Math.round(((priceNum - salePriceNum) / priceNum) * 100) : 0;
    const lineTotal = Math.round(effectivePrice * item.quantity * 100) / 100;
    const originalTotal = Math.round(priceNum * item.quantity * 100) / 100;
    const isProductEnabled =
      item.product.enabled && (!item.product.brand || item.product.brand.enabled) &&
      (!item.product.variantsEnabled || Boolean(item.variant?.isActive && item.variant.stockQuantity > 0));
    const attributes = item.variant?.attributes && typeof item.variant.attributes === "object" && !Array.isArray(item.variant.attributes)
      ? Object.fromEntries(Object.entries(item.variant.attributes).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
      : {};
    const attributeLabel = Object.entries(attributes).map(([key, value]) => `${key}: ${value}`).join(" · ");

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.variant?.sku ?? null,
      attributes,
      name: item.product.name,
      slug: item.product.slug,
      price: priceNum,
      salePrice: salePriceNum,
      effectivePrice,
      discountPercent,
      originalTotal,
      quantity: item.quantity,
      unit: attributeLabel || (item.product.category?.name ? `1 ${item.product.category.name.toLowerCase()}` : "1 pack"),
      image: item.variant?.imageUrl || item.product.imageUrl || "🛒",
      maxQuantity: item.variant ? Math.min(99, item.variant.stockQuantity) : 99,
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
  let variantId: string | undefined;
  if (product.variantsEnabled) {
    const variant = product.variants.find((candidate) => candidate.id === parsed.variantId);
    if (!variant || !variant.isActive) {
      throw new VariantUnavailableError("Select an active product option.");
    }
    if (variant.stockQuantity < 1) {
      throw new VariantUnavailableError("This option is out of stock.");
    }
    variantId = variant.id;
  } else if (parsed.variantId) {
    throw new VariantUnavailableError("This product does not have selectable options.");
  }

  const cart = await getOrCreateCart(identifier);
  const existing = cart.items.find((item) => item.productId === parsed.productId && item.variantId === (variantId ?? null));
  if (existing && existing.quantity + parsed.quantity > 99) {
    throw new InvalidQuantityError("Maximum quantity per option is 99.");
  }
  if (variantId) {
    if ((existing?.quantity ?? 0) + parsed.quantity > (product.variants.find((variant) => variant.id === variantId)?.stockQuantity ?? 0)) {
      throw new InvalidQuantityError("Requested quantity exceeds available stock.");
    }
  }
  await upsertCartItem(cart.id, parsed.productId, parsed.quantity, variantId);

  return getCartDetails(identifier);
}

export async function updateItemQuantity(
  identifier: { userId?: string; sessionToken?: string },
  input: UpdateCartQuantityInput
): Promise<CartDetails> {
  const parsed = updateCartQuantitySchema.parse(input);

  const cart = await getOrCreateCart(identifier);
  const item = cart.items.find((line) => line.productId === parsed.productId && line.variantId === (parsed.variantId ?? null));
  if (parsed.variantId && !item?.variant) {
    throw new VariantUnavailableError("This product option is no longer available.");
  }
  if (item?.variant) {
    if (!item.variant.isActive || parsed.quantity > item.variant.stockQuantity) {
      throw new InvalidQuantityError("Requested quantity exceeds available stock.");
    }
  }
  await updateCartItemQuantity(cart.id, parsed.productId, parsed.quantity, parsed.variantId);

  return getCartDetails(identifier);
}

export async function removeItemFromCart(
  identifier: { userId?: string; sessionToken?: string },
  productId: string,
  variantId?: string
): Promise<CartDetails> {
  const parsed = removeFromCartSchema.parse({ productId, variantId });

  const cart = await getOrCreateCart(identifier);
  await removeCartItem(cart.id, parsed.productId, parsed.variantId);

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
