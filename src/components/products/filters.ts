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

export function filterProducts<T extends {
  name: string;
  description?: string | null;
  price: number;
  enabled?: boolean;
  brandName?: string | null;
  categoryName?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
}>(
  products: T[],
  filters: Filters
): T[] {
  return products.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const brandMatch = p.brandName?.toLowerCase().includes(q);
      const catMatch = p.categoryName?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !brandMatch && !catMatch) return false;
    }

    if (filters.categories.length > 0) {
      const matchesCategory = filters.categories.some((catFilter) => {
        if (!catFilter) return false;
        const filterLower = catFilter.toLowerCase();

        // 1. Direct ID match
        if (p.categoryId && p.categoryId.toLowerCase() === filterLower) return true;

        // 2. Category name & slug matching
        if (p.categoryName) {
          const catNameLower = p.categoryName.toLowerCase();
          if (catNameLower === filterLower) return true;

          const slugified = catNameLower.replace(/[^a-z0-9]+/g, "-");
          if (slugified === filterLower || slugified.includes(filterLower) || filterLower.includes(slugified)) return true;

          if (catNameLower.includes(filterLower) || filterLower.includes(catNameLower)) return true;
        }

        return false;
      });
      if (!matchesCategory) return false;
    }

    if (filters.brands.length > 0) {
      const matchesBrand = filters.brands.some(
        (b) =>
          p.brandId === b ||
          p.brandName?.toLowerCase() === b.toLowerCase()
      );
      if (!matchesBrand) return false;
    }

    if (filters.priceRange) {
      const price = Number(p.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
    }

    if (filters.inStockOnly && p.enabled === false) {
      return false;
    }

    return true;
  });
}

export function sortProducts<T extends { price: number | any; name: string; createdAt?: Date }>(
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
  if (sort === "newest") {
    return list.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
  return list;
}
