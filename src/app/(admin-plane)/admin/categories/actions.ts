"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, isAuthError, type AuthActionResult } from "@/lib/authz";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategories,
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  CategoryNameConflictError,
  CategorySlugConflictError,
  CategoryNotFoundError,
  CategoryHasProductsError,
  type PaginatedCategories,
} from "@/services/category.service";
import {
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryStatusSchema,
  categoryQuerySchema,
  customerCategoryQuerySchema,
  getFieldErrors,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryQueryParams,
  type CustomerCategoryQueryParams,
} from "@/validations/category";
import type { CategoryRecord, CustomerCategoryRecord } from "@/repositories/category.repository";

// ──────────────────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────────────────
export type CategoryActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CATEGORY_NOT_FOUND"
  | "CATEGORY_ALREADY_EXISTS"
  | "SLUG_ALREADY_EXISTS"
  | "CATEGORY_HAS_PRODUCTS"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type CategoryActionError = {
  code: CategoryActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type CategoryActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: CategoryActionError };

// ──────────────────────────────────────────────────────────
//  Internal helpers
// ──────────────────────────────────────────────────────────
function buildError<T = never>(
  code: CategoryActionErrorCode,
  message: string,
  details?: Record<string, string>
): CategoryActionResult<T> {
  return { success: false, error: { code, message, details } };
}

const requireCategoryAdmin = () =>
  requireAdmin<CategoryActionErrorCode, CategoryActionResult<never>>(buildError);

function handleServiceError(error: unknown): CategoryActionResult<never> {
  if (error instanceof CategoryNameConflictError) {
    return buildError("CATEGORY_ALREADY_EXISTS", error.message);
  }
  if (error instanceof CategorySlugConflictError) {
    return buildError("SLUG_ALREADY_EXISTS", error.message);
  }
  if (error instanceof CategoryNotFoundError) {
    return buildError("CATEGORY_NOT_FOUND", error.message);
  }
  if (error instanceof CategoryHasProductsError) {
    return buildError("CATEGORY_HAS_PRODUCTS", error.message);
  }

  console.error("[CategoryAction]", error);
  return buildError("UNKNOWN_ERROR", "An unexpected error occurred. Please try again.");
}

function revalidateCategoryPaths() {
  revalidatePath("/categories", "page");
  revalidatePath("/", "layout");
}

// ──────────────────────────────────────────────────────────
//  Admin mutations
// ──────────────────────────────────────────────────────────
export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<CategoryActionResult<CategoryRecord>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Please fix the errors below.", getFieldErrors(createCategorySchema, input));
    }

    const category = await createCategory(parsed.data);
    revalidateCategoryPaths();
    return { success: true, data: category };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function updateCategoryAction(
  input: UpdateCategoryInput
): Promise<CategoryActionResult<CategoryRecord>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = updateCategorySchema.safeParse(input);
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Please fix the errors below.", getFieldErrors(updateCategorySchema, input));
    }

    const category = await updateCategory(parsed.data);
    revalidateCategoryPaths();
    return { success: true, data: category };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult<CategoryRecord>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    if (!id || typeof id !== "string") {
      return buildError("VALIDATION_ERROR", "A valid category ID is required.");
    }

    const category = await deleteCategory(id);
    revalidateCategoryPaths();
    return { success: true, data: category };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function toggleCategoryStatusAction(
  id: string,
  isActive: boolean
): Promise<CategoryActionResult<CategoryRecord>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = toggleCategoryStatusSchema.safeParse({ id, isActive });
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid input for status toggle.");
    }

    const category = await toggleCategoryStatus(parsed.data.id, parsed.data.isActive);
    revalidateCategoryPaths();
    return { success: true, data: category };
  } catch (error) {
    return handleServiceError(error);
  }
}

// ──────────────────────────────────────────────────────────
//  Admin reads
// ──────────────────────────────────────────────────────────
export async function getCategoriesAction(
  params?: Partial<CategoryQueryParams>
): Promise<CategoryActionResult<PaginatedCategories>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    const parsed = categoryQuerySchema.safeParse(params ?? {});
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid query parameters.");
    }

    const result = await getCategories(parsed.data);
    return { success: true, data: result };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function getCategoryByIdAction(
  id: string
): Promise<CategoryActionResult<CategoryRecord>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    const category = await getCategoryById(id);
    return { success: true, data: category };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function getCategoryBySlugAction(
  slug: string
): Promise<CategoryActionResult<CategoryRecord>> {
  try {
    const authResult = await requireCategoryAdmin();
    if (isAuthError(authResult)) return authResult;

    const category = await getCategoryBySlug(slug);
    return { success: true, data: category };
  } catch (error) {
    return handleServiceError(error);
  }
}

// ──────────────────────────────────────────────────────────
//  Customer reads (public — active categories only)
// ──────────────────────────────────────────────────────────
export async function getActiveCategoriesAction(
  params?: Partial<CustomerCategoryQueryParams>
): Promise<CategoryActionResult<CustomerCategoryRecord[]>> {
  try {
    const parsed = customerCategoryQuerySchema.safeParse(params ?? {});
    if (!parsed.success) {
      return buildError("VALIDATION_ERROR", "Invalid query parameters.");
    }

    const items = await getActiveCategories(parsed.data);
    return { success: true, data: items };
  } catch (error) {
    return handleServiceError(error);
  }
}
