"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
async function getSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

function buildError<T = never>(
  code: ProductActionErrorCode,
  message: string,
  details?: Record<string, string>
): ProductActionResult<T> {
  return { success: false, error: { code, message, details } };
}

async function requireAdmin(): Promise<{ userId: string } | ProductActionResult<never>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return buildError("UNAUTHORIZED", "You must be signed in to perform this action.");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return buildError("FORBIDDEN", "You do not have permission to perform this action.");
    }

    return { userId: session.user.id };
  } catch (error) {
    console.error("[ProductAction Auth Error]", error);
    return buildError("DATABASE_ERROR", "Authentication check failed. Please try again.");
  }
}

function isAuthError(result: unknown): result is ProductActionResult<never> {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    (result as ProductActionResult<never>).success === false
  );
}

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
): Promise<ProductActionResult<ProductWithBrandAndCategory>> {
  try {
    const authResult = await requireAdmin();
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
    return { success: true, data: product };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function updateProductAction(
  input: UpdateProductInput
): Promise<ProductActionResult<ProductWithBrandAndCategory>> {
  try {
    const authResult = await requireAdmin();
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
    return { success: true, data: product };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function deleteProductAction(
  id: string
): Promise<ProductActionResult<ProductWithBrandAndCategory>> {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    if (!id || typeof id !== "string") {
      return buildError("VALIDATION_ERROR", "A valid product ID is required.");
    }

    const product = await deleteProductService(id);
    revalidateProductPaths();
    return { success: true, data: product };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function toggleProductStatusAction(
  id: string,
  enabled: boolean
): Promise<ProductActionResult<ProductWithBrandAndCategory>> {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = toggleProductStatusSchema.safeParse({ id, enabled });
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid input for status toggle.");
    }

    const product = await toggleProductStatusService(parsed.data.id, parsed.data.enabled);
    revalidateProductPaths();
    return { success: true, data: product };
  } catch (error) {
    return handleServiceError(error);
  }
}

// ──────────────────────────────────────────────────────────
//  Queries
// ──────────────────────────────────────────────────────────
export async function getAdminProductsAction(
  params: Partial<ProductQueryParams> = {}
): Promise<ProductActionResult<PaginatedProducts>> {
  try {
    const authResult = await requireAdmin();
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
    return { success: true, data: result };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function getAdminProductStatsAction(): Promise<
  ProductActionResult<{ total: number; active: number; inactive: number }>
> {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const stats = await getProductStats();
    return { success: true, data: stats };
  } catch (error) {
    return handleServiceError(error);
  }
}
