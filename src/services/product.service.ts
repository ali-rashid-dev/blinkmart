import {
  listCustomerProducts,
  findCustomerProductById,
  findCustomerProductBySlug,
  countCustomerProducts,
  listAdminProducts,
  countAdminProducts,
  findAdminProductById,
  checkDuplicateProductSlug,
  createProduct as dbCreateProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  toggleProductStatus as dbToggleProduct,
  getAdminProductStats as dbGetAdminProductStats,
  type ProductWithBrandAndCategory,
} from "@/repositories/product.repository";
import {
  slugify,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductQueryParams,
} from "@/validations/product";

// ──────────────────────────────────────────────────────────
//  Error classes
// ──────────────────────────────────────────────────────────
export class ProductSlugConflictError extends Error {
  constructor(slug: string) {
    super(`A product with the slug "${slug}" already exists.`);
    this.name = "ProductSlugConflictError";
  }
}

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product "${id}" was not found.`);
    this.name = "ProductNotFoundError";
  }
}

// ──────────────────────────────────────────────────────────
//  Paginated result type
// ──────────────────────────────────────────────────────────
export type PaginatedProducts = {
  items: ProductWithBrandAndCategory[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// ──────────────────────────────────────────────────────────
//  Customer Queries
// ──────────────────────────────────────────────────────────
export async function getCustomerProducts(params?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  take?: number;
  skip?: number;
}): Promise<ProductWithBrandAndCategory[]> {
  return listCustomerProducts(params);
}

export async function getCustomerProductById(id: string): Promise<ProductWithBrandAndCategory | null> {
  return findCustomerProductById(id);
}

export async function getCustomerProductBySlug(slug: string): Promise<ProductWithBrandAndCategory | null> {
  return findCustomerProductBySlug(slug);
}

export async function getCustomerProductsCount(params?: {
  categoryId?: string;
  brandId?: string;
}): Promise<number> {
  return countCustomerProducts(params);
}

// ──────────────────────────────────────────────────────────
//  Admin Queries
// ──────────────────────────────────────────────────────────
export async function getAdminProducts(
  params: ProductQueryParams = {
    search: "",
    categoryId: "",
    brandId: "",
    status: "all",
    page: 1,
    limit: 10,
  }
): Promise<PaginatedProducts> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const enabled =
    params.status === "active" ? true : params.status === "inactive" ? false : undefined;

  const [items, totalItems] = await Promise.all([
    listAdminProducts({
      search: params.search,
      categoryId: params.categoryId || undefined,
      brandId: params.brandId || undefined,
      enabled,
      take: limit,
      skip,
    }),
    countAdminProducts({
      search: params.search,
      categoryId: params.categoryId || undefined,
      brandId: params.brandId || undefined,
      enabled,
    }),
  ]);

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

export async function getAdminProductById(id: string): Promise<ProductWithBrandAndCategory | null> {
  return findAdminProductById(id);
}

export async function getProductStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  return dbGetAdminProductStats();
}

// ──────────────────────────────────────────────────────────
//  Admin Mutations
// ──────────────────────────────────────────────────────────
export async function createProductService(
  input: CreateProductInput
): Promise<ProductWithBrandAndCategory> {
  const slug = input.slug && input.slug.trim() !== "" ? input.slug : slugify(input.name);

  if (await checkDuplicateProductSlug(slug)) {
    throw new ProductSlugConflictError(slug);
  }

  try {
    return await dbCreateProduct({
      name: input.name,
      slug,
      description: input.description ?? null,
      price: input.price,
      imageUrl: input.imageUrl ?? null,
      enabled: input.enabled ?? true,
      brandId: input.brandId ?? null,
      categoryId: input.categoryId ?? null,
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new ProductSlugConflictError(slug);
    }
    throw err;
  }
}

export async function updateProductService(
  input: UpdateProductInput
): Promise<ProductWithBrandAndCategory> {
  const existing = await findAdminProductById(input.id);
  if (!existing) {
    throw new ProductNotFoundError(input.id);
  }

  const finalSlug = input.slug;
  if (input.name && (!input.slug || input.slug === existing.slug)) {
    // If name changed but slug didn't explicitly change, auto-slugify if needed or keep existing
  }

  if (finalSlug && finalSlug !== existing.slug) {
    if (await checkDuplicateProductSlug(finalSlug, input.id)) {
      throw new ProductSlugConflictError(finalSlug);
    }
  }

  try {
    return await dbUpdateProduct(input.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(finalSlug !== undefined && { slug: finalSlug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.enabled !== undefined && { enabled: input.enabled }),
      ...(input.brandId !== undefined && { brandId: input.brandId }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new ProductSlugConflictError(finalSlug ?? existing.slug);
    }
    throw err;
  }
}

export async function deleteProductService(id: string): Promise<ProductWithBrandAndCategory> {
  const existing = await findAdminProductById(id);
  if (!existing) {
    throw new ProductNotFoundError(id);
  }
  return dbDeleteProduct(id);
}

export async function toggleProductStatusService(
  id: string,
  enabled: boolean
): Promise<ProductWithBrandAndCategory> {
  const existing = await findAdminProductById(id);
  if (!existing) {
    throw new ProductNotFoundError(id);
  }
  return dbToggleProduct(id, enabled);
}
