import {
  createCategory as dbCreate,
  updateCategory as dbUpdate,
  deleteCategory as dbDelete,
  toggleCategoryStatus as dbToggle,
  findCategoryById,
  findCategoryBySlug,
  listCategories as dbList,
  listCustomerCategories as dbListCustomer,
  checkDuplicateName,
  checkDuplicateSlug,
  countProductsByCategory,
  type CategoryRecord,
  type CustomerCategoryRecord,
} from "@/repositories/category.repository";
import { Prisma } from "@prisma/client";
import {
  slugify,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryQueryParams,
  type CustomerCategoryQueryParams,
} from "@/validations/category";

// ──────────────────────────────────────────────────────────
//  Error classes
// ──────────────────────────────────────────────────────────
export class CategoryNameConflictError extends Error {
  constructor(name: string) {
    super(`A category with the name "${name}" already exists.`);
    this.name = "CategoryNameConflictError";
  }
}

export class CategorySlugConflictError extends Error {
  constructor(slug: string) {
    super(`A category with the slug "${slug}" already exists.`);
    this.name = "CategorySlugConflictError";
  }
}

export class CategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Category "${id}" was not found.`);
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryHasProductsError extends Error {
  constructor(count: number) {
    super(`Cannot delete: this category has ${count} product${count !== 1 ? "s" : ""} assigned to it.`);
    this.name = "CategoryHasProductsError";
  }
}

// ──────────────────────────────────────────────────────────
//  Pagination type
// ──────────────────────────────────────────────────────────
export type PaginatedCategories = {
  items: CategoryRecord[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// ──────────────────────────────────────────────────────────
//  Slug generation
// ──────────────────────────────────────────────────────────
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = attempt === 0 ? base : `${base}-${attempt}`;
    const isDuplicate = await checkDuplicateSlug(candidate, excludeId);
    if (!isDuplicate) return candidate;
    attempt += 1;
  }
}

// ──────────────────────────────────────────────────────────
//  Create
// ──────────────────────────────────────────────────────────
export async function createCategory(input: CreateCategoryInput): Promise<CategoryRecord> {
  if (await checkDuplicateName(input.name)) {
    throw new CategoryNameConflictError(input.name);
  }

  // Use provided slug if valid, otherwise auto-generate
  let slug: string;
  if (input.slug) {
    if (await checkDuplicateSlug(input.slug)) {
      throw new CategorySlugConflictError(input.slug);
    }
    slug = input.slug;
  } else {
    slug = await generateUniqueSlug(input.name);
  }

  try {
    return await dbCreate({
      name: input.name,
      slug,
      imageUrl: input.imageUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta as any)?.target;
      if (Array.isArray(target)) {
        if (target.includes("name")) throw new CategoryNameConflictError(input.name);
        if (target.includes("slug")) throw new CategorySlugConflictError(slug);
      }
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────────────
//  Update
// ──────────────────────────────────────────────────────────
export async function updateCategory(input: UpdateCategoryInput): Promise<CategoryRecord> {
  const existing = await findCategoryById(input.id);
  if (!existing) throw new CategoryNotFoundError(input.id);

  // Name uniqueness
  if (input.name && input.name !== existing.name) {
    if (await checkDuplicateName(input.name, input.id)) {
      throw new CategoryNameConflictError(input.name);
    }
  }

  // Slug: if name changed and no explicit slug provided, regenerate
  let slug: string | undefined;
  if (input.slug !== undefined) {
    if (input.slug !== existing.slug && (await checkDuplicateSlug(input.slug, input.id))) {
      throw new CategorySlugConflictError(input.slug);
    }
    slug = input.slug;
  } else if (input.name && input.name !== existing.name) {
    slug = await generateUniqueSlug(input.name, input.id);
  }

  try {
    return await dbUpdate(input.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(slug !== undefined && { slug }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta as any)?.target;
      if (Array.isArray(target)) {
        if (target.includes("name")) throw new CategoryNameConflictError(input.name ?? "");
        if (target.includes("slug")) throw new CategorySlugConflictError(slug ?? "");
      }
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────────────
//  Delete (real delete, blocks if products exist)
// ──────────────────────────────────────────────────────────
export async function deleteCategory(id: string): Promise<CategoryRecord> {
  const existing = await findCategoryById(id);
  if (!existing) throw new CategoryNotFoundError(id);

  const productCount = await countProductsByCategory(id);
  if (productCount > 0) throw new CategoryHasProductsError(productCount);

  return dbDelete(id);
}

// ──────────────────────────────────────────────────────────
//  Toggle status
// ──────────────────────────────────────────────────────────
export async function toggleCategoryStatus(id: string, isActive: boolean): Promise<CategoryRecord> {
  const existing = await findCategoryById(id);
  if (!existing) throw new CategoryNotFoundError(id);
  return dbToggle(id, isActive);
}

// ──────────────────────────────────────────────────────────
//  Admin listing
// ──────────────────────────────────────────────────────────
export async function getCategories(params: CategoryQueryParams): Promise<PaginatedCategories> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const { items, totalItems } = await dbList(params);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

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
//  Single lookups
// ──────────────────────────────────────────────────────────
export async function getCategoryById(id: string): Promise<CategoryRecord> {
  const category = await findCategoryById(id);
  if (!category) throw new CategoryNotFoundError(id);
  return category;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRecord> {
  const category = await findCategoryBySlug(slug);
  if (!category) throw new CategoryNotFoundError(slug);
  return category;
}

// ──────────────────────────────────────────────────────────
//  Customer listing (active only, sorted)
// ──────────────────────────────────────────────────────────
export async function getActiveCategories(
  params: CustomerCategoryQueryParams
): Promise<CustomerCategoryRecord[]> {
  return dbListCustomer(params);
}
