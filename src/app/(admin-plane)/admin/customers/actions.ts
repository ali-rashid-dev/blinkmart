"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, isAuthError, type AuthActionResult } from "@/lib/authz";
import {
  getCustomersService,
  getCustomerDetailsService,
  updateCustomerService,
  banCustomerService,
  unbanCustomerService,
  getCustomerStatsService,
  CustomerNotFoundError,
  CustomerEmailExistsError,
  AdminSelfBanError,
  CustomerValidationError,
} from "@/services/customer.service";
import type {
  PaginatedCustomers,
  CustomerDetails,
  CustomerStats,
} from "@/repositories/customer.repository";
import type {
  CustomerQueryParams,
  UpdateCustomerInput,
  BanCustomerInput,
} from "@/validations/customer";

export type CustomerActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CUSTOMER_NOT_FOUND"
  | "EMAIL_EXISTS"
  | "SELF_BAN_NOT_ALLOWED"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type CustomerActionError = {
  code: CustomerActionErrorCode;
  message: string;
  details?: Record<string, string>;
};

export type CustomerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: CustomerActionError };

function buildError<T = never>(
  code: CustomerActionErrorCode,
  message: string,
  details?: Record<string, string>
): CustomerActionResult<T> {
  return {
    success: false,
    error: { code, message, details },
  };
}

const requireCustomerAdmin = () =>
  requireAdmin<CustomerActionErrorCode, CustomerActionResult<never>>(buildError);

export async function getCustomersAction(
  query: CustomerQueryParams
): Promise<CustomerActionResult<PaginatedCustomers>> {
  const authResult = await requireCustomerAdmin();
  if (isAuthError(authResult)) return authResult;

  try {
    const data = await getCustomersService(query);
    return { success: true, data };
  } catch (error) {
    if (error instanceof CustomerValidationError) {
      return buildError("VALIDATION_ERROR", error.message, error.fieldErrors);
    }
    console.error("[getCustomersAction] Error:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve customers list.");
  }
}

export async function getCustomerDetailsAction(
  id: string
): Promise<CustomerActionResult<CustomerDetails>> {
  const authResult = await requireCustomerAdmin();
  if (isAuthError(authResult)) return authResult;

  try {
    const data = await getCustomerDetailsService(id);
    return { success: true, data };
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return buildError("CUSTOMER_NOT_FOUND", error.message);
    }
    console.error("[getCustomerDetailsAction] Error:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve customer details.");
  }
}

export async function updateCustomerAction(
  input: UpdateCustomerInput
): Promise<CustomerActionResult<{ id: string }>> {
  const authResult = await requireCustomerAdmin();
  if (isAuthError(authResult)) return authResult;

  try {
    const result = await updateCustomerService(authResult.userId, input);
    revalidatePath("/admin/customers");
    return { success: true, data: { id: result.user.id } };
  } catch (error) {
    if (error instanceof CustomerValidationError) {
      return buildError("VALIDATION_ERROR", error.message, error.fieldErrors);
    }
    if (error instanceof CustomerEmailExistsError) {
      return buildError("EMAIL_EXISTS", error.message);
    }
    if (error instanceof CustomerNotFoundError) {
      return buildError("CUSTOMER_NOT_FOUND", error.message);
    }
    console.error("[updateCustomerAction] Error:", error);
    return buildError("DATABASE_ERROR", "Failed to update customer details.");
  }
}

export async function banCustomerAction(
  input: BanCustomerInput
): Promise<CustomerActionResult<{ id: string }>> {
  const authResult = await requireCustomerAdmin();
  if (isAuthError(authResult)) return authResult;

  try {
    const user = await banCustomerService(authResult.userId, input);
    revalidatePath("/admin/customers");
    return { success: true, data: { id: user.id } };
  } catch (error) {
    if (error instanceof AdminSelfBanError) {
      return buildError("SELF_BAN_NOT_ALLOWED", error.message);
    }
    if (error instanceof CustomerValidationError) {
      return buildError("VALIDATION_ERROR", error.message, error.fieldErrors);
    }
    if (error instanceof CustomerNotFoundError) {
      return buildError("CUSTOMER_NOT_FOUND", error.message);
    }
    console.error("[banCustomerAction] Error:", error);
    return buildError("DATABASE_ERROR", "Failed to ban customer.");
  }
}

export async function unbanCustomerAction(
  id: string
): Promise<CustomerActionResult<{ id: string }>> {
  const authResult = await requireCustomerAdmin();
  if (isAuthError(authResult)) return authResult;

  try {
    const user = await unbanCustomerService(authResult.userId, id);
    revalidatePath("/admin/customers");
    return { success: true, data: { id: user.id } };
  } catch (error) {
    if (error instanceof CustomerValidationError) {
      return buildError("VALIDATION_ERROR", error.message, error.fieldErrors);
    }
    if (error instanceof CustomerNotFoundError) {
      return buildError("CUSTOMER_NOT_FOUND", error.message);
    }
    console.error("[unbanCustomerAction] Error:", error);
    return buildError("DATABASE_ERROR", "Failed to unban customer.");
  }
}

export async function getCustomerStatsAction(): Promise<CustomerActionResult<CustomerStats>> {
  const authResult = await requireCustomerAdmin();
  if (isAuthError(authResult)) return authResult;

  try {
    const data = await getCustomerStatsService();
    return { success: true, data };
  } catch (error) {
    console.error("[getCustomerStatsAction] Error:", error);
    return buildError("DATABASE_ERROR", "Failed to retrieve customer statistics.");
  }
}
