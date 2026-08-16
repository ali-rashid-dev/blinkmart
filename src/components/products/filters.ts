export type Filters = {
  search: string;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
};

export type Chip = {
  id: string;
  label: string;
  type: keyof Filters;
  value: string;
};

export type SortValue = "featured" | "price-asc" | "price-desc" | "name-asc" | "newest";

export const initialFilters: Filters = {
  search: "",
  categories: [],
  brands: [],
  priceRange: [0, 50000],
  inStockOnly: false,
};

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function buildChips(
  filters: Filters,
  getCategoryLabel: (id: string) => string
): Chip[] {
  const chips: Chip[] = [];
  if (filters.search) {
    chips.push({ id: "search", label: `"${filters.search}"`, type: "search", value: filters.search });
  }
  for (const cat of filters.categories) {
    chips.push({ id: `cat-${cat}`, label: getCategoryLabel(cat), type: "categories", value: cat });
  }
  for (const b of filters.brands) {
    chips.push({ id: `brand-${b}`, label: b, type: "brands", value: b });
  }
  if (filters.inStockOnly) {
    chips.push({ id: "in-stock", label: "In stock only", type: "inStockOnly", value: "true" });
  }
  return chips;
}

export function filterProducts<T extends { name: string; brand?: any; categoryId?: string | null }>(
  products: T[],
  filters: Filters
): T[] {
  return products.filter((p) => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.categories.length > 0 && (!p.categoryId || !filters.categories.includes(p.categoryId))) {
      return false;
    }
    return true;
  });
}

export function sortProducts<T extends { price: number | any; name: string }>(
  products: T[],
  sort: SortValue | string
): T[] {
  const list = [...products];
  if (sort === "price-asc") {
    return list.sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (sort === "price-desc") {
    return list.sort((a, b) => Number(b.price) - Number(a.price));
  }
  if (sort === "name-asc") {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}
