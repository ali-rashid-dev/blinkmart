import prisma from "@/lib/prisma";
import type { CategoryQueryParams, CustomerCategoryQueryParams } from "@/validations/category";

// ──────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────
export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  imageUrl: string | null;
};

// ──────────────────────────────────────────────────────────
//  Writes
// ──────────────────────────────────────────────────────────
export async function createCategory(data: {
  name: string;
  slug: string;
  emoji?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<CategoryRecord> {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      emoji: data.emoji ?? "🛒",
      imageUrl: data.imageUrl ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    emoji?: string | null;
    imageUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<CategoryRecord> {
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.emoji !== undefined && { emoji: data.emoji }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteCategory(id: string): Promise<CategoryRecord> {
  return prisma.category.delete({ where: { id } });
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean
): Promise<CategoryRecord> {
  return prisma.category.update({
    where: { id },
    data: { isActive },
  });
}

// ──────────────────────────────────────────────────────────
//  Reads
// ──────────────────────────────────────────────────────────
export async function findCategoryById(id: string): Promise<CategoryRecord | null> {
  return prisma.category.findUnique({ where: { id } });
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  return prisma.category.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
  });
}

export async function findCategoryByName(name: string): Promise<CategoryRecord | null> {
  return prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
}

export async function checkDuplicateName(name: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function checkDuplicateSlug(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.category.findFirst({
    where: {
      slug: { equals: slug, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function countProductsByCategory(categoryId: string): Promise<number> {
  return prisma.product.count({ where: { categoryId } });
}


// ──────────────────────────────────────────────────────────
//  Admin listing
// ──────────────────────────────────────────────────────────
export async function listCategories(params: CategoryQueryParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // Status filter
  const statusWhere =
    params.status === "active"
      ? { isActive: true }
      : params.status === "inactive"
      ? { isActive: false }
      : {};

  // Search
  const searchWhere =
    params.search && params.search.trim() !== ""
      ? {
          OR: [
            { name: { contains: params.search.trim(), mode: "insensitive" as const } },
            { slug: { contains: params.search.trim(), mode: "insensitive" as const } },
          ],
        }
      : {};

  const whereClause = { ...statusWhere, ...searchWhere };

  // Sorting
  type OrderBy = { name?: "asc" | "desc"; createdAt?: "asc" | "desc"; sortOrder?: "asc" | "desc" };
  const orderByMap: Record<string, OrderBy> = {
    "name-asc": { name: "asc" },
    "name-desc": { name: "desc" },
    "created-desc": { createdAt: "desc" },
    "created-asc": { createdAt: "asc" },
    "sort-order": { sortOrder: "asc" },
  };
  const orderBy = orderByMap[params.sortBy ?? "sort-order"] ?? { sortOrder: "asc" };

  const [items, totalItems] = await Promise.all([
    prisma.category.findMany({ where: whereClause, orderBy, skip, take: limit }),
    prisma.category.count({ where: whereClause }),
  ]);

  return { items, totalItems };
}

// ──────────────────────────────────────────────────────────
//  Customer listing (active only, sortOrder ASC, name ASC)
// ──────────────────────────────────────────────────────────
export async function listCustomerCategories(
  params: CustomerCategoryQueryParams
): Promise<CustomerCategoryRecord[]> {
  const searchWhere =
    params.search && params.search.trim() !== ""
      ? { name: { contains: params.search.trim(), mode: "insensitive" as const } }
      : {};

  return prisma.category.findMany({
    where: { isActive: true, ...searchWhere },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, emoji: true, imageUrl: true },
  });
}
