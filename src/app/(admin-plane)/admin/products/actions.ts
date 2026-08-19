"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, isAuthError, type AuthActionResult } from "@/lib/authz";
import {
  getAdminProducts,
  getProductStats,
  createProductService,
  updateProductService,
  deleteProductService,
  toggleProductStatusService,
  ProductSlugConflictError,
  ProductNotFoundError,
  type PaginatedProducts,
} from "@/services/product.service";
import {
  createProductSchema,
  updateProductSchema,
  toggleProductStatusSchema,
  productQuerySchema,
  getFieldErrors,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductQueryParams,
} from "@/validations/product";
import type { ProductWithBrandAndCategory } from "@/repositories/product.repository";

// ──────────────────────────────────────────────────────────
//  Serialization helper
// ──────────────────────────────────────────────────────────
/**
 * Prisma returns `price` as a `Decimal` object which cannot be passed
 * from Server Components / Server Actions to Client Components.
 * This helper converts it to a plain `number`.
 */
/** Prisma's Decimal serialized to a plain number for the client boundary. */
export type SerializedProduct = Omit<ProductWithBrandAndCategory, "price"> & { price: number };

/** Paginated list with price already serialized. */
export type SerializedPaginatedProducts = Omit<import("@/services/product.service").PaginatedProducts, "items"> & { items: SerializedProduct[] };

function serializeProduct(p: ProductWithBrandAndCategory): SerializedProduct {
  return { ...p, price: Number(p.price) };
}

// ──────────────────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────────────────
export type ProductActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_ALREADY_EXISTS"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type ProductActionError = {
  code: ProductActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type ProductActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ProductActionError };

// ──────────────────────────────────────────────────────────
//  Internal helpers
// ──────────────────────────────────────────────────────────
function buildError<T = never>(
  code: ProductActionErrorCode,
  message: string,
  details?: Record<string, string>
): ProductActionResult<T> {
  return { success: false, error: { code, message, details } };
}

const requireProductAdmin = () =>
  requireAdmin<ProductActionErrorCode, ProductActionResult<never>>(buildError);

function handleServiceError(error: unknown): ProductActionResult<never> {
  if (error instanceof ProductSlugConflictError) {
    return buildError("PRODUCT_ALREADY_EXISTS", error.message);
  }
  if (error instanceof ProductNotFoundError) {
    return buildError("PRODUCT_NOT_FOUND", error.message);
  }

  console.error("[ProductAction Error]", error);
  return buildError("UNKNOWN_ERROR", "An unexpected error occurred. Please try again.");
}

function revalidateProductPaths() {
  revalidatePath("/products");
  revalidatePath("/brands");
  revalidatePath("/categories");
  revalidatePath("/", "layout");
}

// ──────────────────────────────────────────────────────────
//  Admin Mutations
// ──────────────────────────────────────────────────────────
export async function createProductAction(
  input: CreateProductInput
): Promise<ProductActionResult<SerializedProduct>> {
  try {
    const authResult = await requireProductAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = createProductSchema.safeParse(input);
    if (!parsed.success) {
      return buildError(
        "VALIDATION_ERROR",
        "Please fix the validation errors below.",
        getFieldErrors(createProductSchema, input)
      );
    }

    const product = await createProductService(parsed.data);
    revalidateProductPaths();
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function updateProductAction(
  input: UpdateProductInput
): Promise<ProductActionResult<SerializedProduct>> {
  try {
    const authResult = await requireProductAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = updateProductSchema.safeParse(input);
    if (!parsed.success) {
      return buildError(
        "VALIDATION_ERROR",
        "Please fix the validation errors below.",
        getFieldErrors(updateProductSchema, input)
      );
    }

    const product = await updateProductService(parsed.data);
    revalidateProductPaths();
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function deleteProductAction(
  id: string
): Promise<ProductActionResult<SerializedProduct>> {
  try {
    const authResult = await requireProductAdmin();
    if (isAuthError(authResult)) return authResult;

    if (!id || typeof id !== "string") {
      return buildError("VALIDATION_ERROR", "A valid product ID is required.");
    }

    const product = await deleteProductService(id);
    revalidateProductPaths();
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function toggleProductStatusAction(
  id: string,
  enabled: boolean
): Promise<ProductActionResult<SerializedProduct>> {
  try {
    const authResult = await requireProductAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = toggleProductStatusSchema.safeParse({ id, enabled });
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid input for status toggle.");
    }

    const product = await toggleProductStatusService(parsed.data.id, parsed.data.enabled);
    revalidateProductPaths();
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    return handleServiceError(error);
  }
}

// ──────────────────────────────────────────────────────────
//  Queries
// ──────────────────────────────────────────────────────────
export async function getAdminProductsAction(
  params: Partial<ProductQueryParams> = {}
): Promise<ProductActionResult<SerializedPaginatedProducts>> {
  try {
    const authResult = await requireProductAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = productQuerySchema.safeParse(params);
    if (!parsed.success) {
      return buildError(
        "VALIDATION_ERROR",
        "Invalid query parameters.",
        getFieldErrors(productQuerySchema, params)
      );
    }

    const result = await getAdminProducts(parsed.data);
    return {
      success: true,
      data: {
        ...result,
        items: result.items.map(serializeProduct),
      },
    };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function getAdminProductStatsAction(): Promise<
  ProductActionResult<{ total: number; active: number; inactive: number }>
> {
  try {
    const authResult = await requireProductAdmin();
    if (isAuthError(authResult)) return authResult;

    const stats = await getProductStats();
    return { success: true, data: stats };
  } catch (error) {
    return handleServiceError(error);
  }
}
