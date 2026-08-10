import {
  createBrand as dbCreate,
  updateBrand as dbUpdate,
  deleteBrand as dbDelete,
  toggleBrandStatus as dbToggle,
  findBrandById,
  findBrandByName,
  checkDuplicateBrandName,
  countProductsByBrand,
  listBrands as dbList,
  listCustomerBrands as dbListCustomer,
  type BrandRecord,
  type CustomerBrandRecord,
} from "@/repositories/brand.repository";
import type {
  CreateBrandInput,
  UpdateBrandInput,
  BrandQueryParams,
  CustomerBrandQueryParams,
} from "@/validations/brand";

// ──────────────────────────────────────────────────────────
//  Error classes
// ──────────────────────────────────────────────────────────
export class BrandNameConflictError extends Error {
  constructor(name: string) {
    super(`A brand with the name "${name}" already exists.`);
    this.name = "BrandNameConflictError";
  }
}

export class BrandNotFoundError extends Error {
  constructor(id: string) {
    super(`Brand "${id}" was not found.`);
    this.name = "BrandNotFoundError";
  }
}

export class BrandHasProductsError extends Error {
  constructor(count: number) {
    super(`Cannot delete: this brand has ${count} product${count !== 1 ? "s" : ""} assigned to it.`);
    this.name = "BrandHasProductsError";
  }
}

// ──────────────────────────────────────────────────────────
//  Pagination type
// ──────────────────────────────────────────────────────────
export type PaginatedBrands = {
  items: BrandRecord[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// ──────────────────────────────────────────────────────────
//  Create Brand
// ──────────────────────────────────────────────────────────
export async function createBrand(input: CreateBrandInput): Promise<BrandRecord> {
  if (await checkDuplicateBrandName(input.name)) {
    throw new BrandNameConflictError(input.name);
  }

  try {
    return await dbCreate({
      name: input.name,
      origin: input.origin ?? null,
      enabled: input.enabled ?? true,
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new BrandNameConflictError(input.name);
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────────────
//  Update Brand
// ──────────────────────────────────────────────────────────
export async function updateBrand(input: UpdateBrandInput): Promise<BrandRecord> {
  const existing = await findBrandById(input.id);
  if (!existing) throw new BrandNotFoundError(input.id);

  if (input.name && input.name !== existing.name) {
    if (await checkDuplicateBrandName(input.name, input.id)) {
      throw new BrandNameConflictError(input.name);
    }
  }

  try {
    return await dbUpdate(input.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.origin !== undefined && { origin: input.origin }),
      ...(input.enabled !== undefined && { enabled: input.enabled }),
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new BrandNameConflictError(input.name ?? "");
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────────────
//  Delete Brand (prevents deletion if products exist)
// ──────────────────────────────────────────────────────────
export async function deleteBrand(id: string): Promise<BrandRecord> {
  const existing = await findBrandById(id);
  if (!existing) throw new BrandNotFoundError(id);

  const productCount = await countProductsByBrand(id);
  if (productCount > 0) throw new BrandHasProductsError(productCount);

  return dbDelete(id);
}

// ──────────────────────────────────────────────────────────
//  Toggle Brand Enabled Status
// ──────────────────────────────────────────────────────────
export async function toggleBrandStatus(id: string, enabled: boolean): Promise<BrandRecord> {
  const existing = await findBrandById(id);
  if (!existing) throw new BrandNotFoundError(id);
  return dbToggle(id, enabled);
}

// ──────────────────────────────────────────────────────────
//  Get Brands (Admin)
// ──────────────────────────────────────────────────────────
export async function getBrands(params: BrandQueryParams): Promise<PaginatedBrands> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const { items, totalItems } = await dbList(params);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items,
    totalItems,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// ──────────────────────────────────────────────────────────
//  Get Enabled Brands (Customer)
// ──────────────────────────────────────────────────────────
export async function getEnabledBrands(
  params?: CustomerBrandQueryParams
): Promise<CustomerBrandRecord[]> {
  return dbListCustomer(params);
}

// ──────────────────────────────────────────────────────────
//  Get Brand by ID
// ──────────────────────────────────────────────────────────
export async function getBrandById(id: string): Promise<BrandRecord | null> {
  return findBrandById(id);
}
