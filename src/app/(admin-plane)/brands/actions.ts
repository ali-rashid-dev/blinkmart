"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, isAuthError, type AuthActionResult } from "@/lib/authz";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  getBrands,
  getEnabledBrands,
  getBrandById,
  BrandNameConflictError,
  BrandNotFoundError,
  BrandHasProductsError,
  type PaginatedBrands,
} from "@/services/brand.service";
import {
  createBrandSchema,
  updateBrandSchema,
  toggleBrandStatusSchema,
  brandQuerySchema,
  getFieldErrors,
  type CreateBrandInput,
  type UpdateBrandInput,
  type BrandQueryParams,
} from "@/validations/brand";
import type { BrandRecord, CustomerBrandRecord } from "@/repositories/brand.repository";

// ──────────────────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────────────────
export type BrandActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BRAND_NOT_FOUND"
  | "BRAND_ALREADY_EXISTS"
  | "BRAND_HAS_PRODUCTS"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type BrandActionError = {
  code: BrandActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type BrandActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: BrandActionError };

// ──────────────────────────────────────────────────────────
//  Internal helpers
// ──────────────────────────────────────────────────────────
function buildError<T = never>(
  code: BrandActionErrorCode,
  message: string,
  details?: Record<string, string>
): BrandActionResult<T> {
  return { success: false, error: { code, message, details } };
}

const requireBrandAdmin = () =>
  requireAdmin<BrandActionErrorCode, BrandActionResult<never>>(buildError);

function handleServiceError(error: unknown): BrandActionResult<never> {
  if (error instanceof BrandNameConflictError) {
    return buildError("BRAND_ALREADY_EXISTS", error.message);
  }
  if (error instanceof BrandNotFoundError) {
    return buildError("BRAND_NOT_FOUND", error.message);
  }
  if (error instanceof BrandHasProductsError) {
    return buildError("BRAND_HAS_PRODUCTS", error.message);
  }

  console.error("[BrandAction]", error);
  return buildError("UNKNOWN_ERROR", "An unexpected error occurred. Please try again.");
}

function revalidateBrandPaths() {
  revalidatePath("/brands");
  revalidatePath("/products");
  revalidatePath("/", "layout");
}

// ──────────────────────────────────────────────────────────
//  Admin mutations
// ──────────────────────────────────────────────────────────
export async function createBrandAction(
  input: CreateBrandInput
): Promise<BrandActionResult<BrandRecord>> {
  try {
    const authResult = await requireBrandAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = createBrandSchema.safeParse(input);
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Please fix the validation errors below.", getFieldErrors(createBrandSchema, input));
    }

    const brand = await createBrand(parsed.data);
    revalidateBrandPaths();
    return { success: true, data: brand };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function updateBrandAction(
  input: UpdateBrandInput
): Promise<BrandActionResult<BrandRecord>> {
  try {
    const authResult = await requireBrandAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = updateBrandSchema.safeParse(input);
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Please fix the validation errors below.", getFieldErrors(updateBrandSchema, input));
    }

    const brand = await updateBrand(parsed.data);
    revalidateBrandPaths();
    return { success: true, data: brand };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function deleteBrandAction(
  id: string
): Promise<BrandActionResult<BrandRecord>> {
  try {
    const authResult = await requireBrandAdmin();
    if (isAuthError(authResult)) return authResult;

    if (!id || typeof id !== "string") {
      return buildError("VALIDATION_ERROR", "A valid brand ID is required.");
    }

    const brand = await deleteBrand(id);
    revalidateBrandPaths();
    return { success: true, data: brand };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function toggleBrandStatusAction(
  id: string,
  enabled: boolean
): Promise<BrandActionResult<BrandRecord>> {
  try {
    const authResult = await requireBrandAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = toggleBrandStatusSchema.safeParse({ id, enabled });
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid input for status toggle.");
    }

    const brand = await toggleBrandStatus(parsed.data.id, parsed.data.enabled);
    revalidateBrandPaths();
    return { success: true, data: brand };
  } catch (error) {
    return handleServiceError(error);
  }
}

// ──────────────────────────────────────────────────────────
//  Queries
// ──────────────────────────────────────────────────────────
export async function getBrandsAction(
  params: Partial<BrandQueryParams> = {}
): Promise<BrandActionResult<PaginatedBrands>> {
  try {
    const authResult = await requireBrandAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = brandQuerySchema.safeParse(params);
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid query parameters.", getFieldErrors(brandQuerySchema, params));
    }

    const result = await getBrands(parsed.data);
    return { success: true, data: result };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function getEnabledBrandsAction(): Promise<BrandActionResult<CustomerBrandRecord[]>> {
  try {
    const brands = await getEnabledBrands();
    return { success: true, data: brands };
  } catch (error) {
    return handleServiceError(error);
  }
}
