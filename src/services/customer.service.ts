import {
  getCustomersRepository,
  getCustomerByIdRepository,
  updateCustomerRepository,
  banCustomerRepository,
  unbanCustomerRepository,
  getCustomerStatsRepository,
  type CustomerDetails,
  type PaginatedCustomers,
  type CustomerStats,
} from "@/repositories/customer.repository";
import {
  customerQuerySchema,
  updateCustomerSchema,
  banCustomerSchema,
  unbanCustomerSchema,
  getFieldErrors,
  type CustomerQueryParams,
  type UpdateCustomerInput,
  type BanCustomerInput,
} from "@/validations/customer";

export class CustomerNotFoundError extends Error {
  constructor(id: string) {
    super(`Customer with ID "${id}" was not found.`);
    this.name = "CustomerNotFoundError";
  }
}

export class CustomerEmailExistsError extends Error {
  constructor(email: string) {
    super(`A customer with email "${email}" already exists.`);
    this.name = "CustomerEmailExistsError";
  }
}

export class AdminSelfBanError extends Error {
  constructor() {
    super("Administrators cannot ban their own account.");
    this.name = "AdminSelfBanError";
  }
}

export class CustomerValidationError extends Error {
  public fieldErrors: Record<string, string>;
  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "CustomerValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export async function getCustomersService(
  rawParams: CustomerQueryParams
): Promise<PaginatedCustomers> {
  const result = customerQuerySchema.safeParse(rawParams);
  if (!result.success) {
    throw new CustomerValidationError("Invalid query parameters", getFieldErrors(result.error));
  }
  return getCustomersRepository(result.data);
}

export async function getCustomerDetailsService(id: string): Promise<CustomerDetails> {
  if (!id || !id.trim()) {
    throw new CustomerValidationError("Customer ID is required");
  }
  const customer = await getCustomerByIdRepository(id.trim());
  if (!customer) {
    throw new CustomerNotFoundError(id);
  }
  return customer;
}

export async function updateCustomerService(
  currentAdminId: string,
  rawInput: UpdateCustomerInput
) {
  const result = updateCustomerSchema.safeParse(rawInput);
  if (!result.success) {
    throw new CustomerValidationError("Validation failed", getFieldErrors(result.error));
  }

  const existing = await getCustomerByIdRepository(result.data.id);
  if (!existing) {
    throw new CustomerNotFoundError(result.data.id);
  }

  // If demoting self from ADMIN, verify logic if needed, but allow role changes safely
  try {
    return await updateCustomerRepository(result.data);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS") {
      throw new CustomerEmailExistsError(result.data.email);
    }
    throw err;
  }
}

export async function banCustomerService(
  currentAdminId: string,
  rawInput: BanCustomerInput
) {
  const result = banCustomerSchema.safeParse(rawInput);
  if (!result.success) {
    throw new CustomerValidationError("Validation failed", getFieldErrors(result.error));
  }

  const { id, banReason } = result.data;

  if (id === currentAdminId) {
    throw new AdminSelfBanError();
  }

  const existing = await getCustomerByIdRepository(id);
  if (!existing) {
    throw new CustomerNotFoundError(id);
  }

  return banCustomerRepository(id, banReason);
}

export async function unbanCustomerService(
  currentAdminId: string,
  id: string
) {
  const result = unbanCustomerSchema.safeParse({ id });
  if (!result.success) {
    throw new CustomerValidationError("Validation failed", getFieldErrors(result.error));
  }

  const existing = await getCustomerByIdRepository(id);
  if (!existing) {
    throw new CustomerNotFoundError(id);
  }

  return unbanCustomerRepository(id);
}

export async function getCustomerStatsService(): Promise<CustomerStats> {
  return getCustomerStatsRepository();
}
