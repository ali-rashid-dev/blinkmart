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

export function parseCategoryEmoji(name: string, slug?: string): { emoji: string; label: string } {
  if (!name) return { emoji: "🛒", label: "" };

  const emojiRegex = /^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}])\s*/u;
  const match = name.match(emojiRegex);
  if (match && match[1]) {
    return {
      emoji: match[1],
      label: name.substring(match[0].length).trim(),
    };
  }

  const lower = (name + " " + (slug || "")).toLowerCase();
  if (lower.includes("produce") || lower.includes("fruit") || lower.includes("veg")) return { emoji: "🥦", label: name };
  if (lower.includes("dairy") || lower.includes("milk") || lower.includes("egg")) return { emoji: "🥛", label: name };
  if (lower.includes("bakery") || lower.includes("bread")) return { emoji: "🥖", label: name };
  if (lower.includes("meat") || lower.includes("seafood") || lower.includes("fish")) return { emoji: "🥩", label: name };
  if (lower.includes("pantry") || lower.includes("grain") || lower.includes("staple")) return { emoji: "🥫", label: name };
  if (lower.includes("beverage") || lower.includes("drink") || lower.includes("juice")) return { emoji: "🥤", label: name };
  if (lower.includes("snack") || lower.includes("sweet") || lower.includes("candy")) return { emoji: "🍿", label: name };
  if (lower.includes("frozen") || lower.includes("ice")) return { emoji: "🧊", label: name };
  if (lower.includes("house") || lower.includes("clean")) return { emoji: "🧼", label: name };
  if (lower.includes("care") || lower.includes("beauty")) return { emoji: "💆", label: name };

  return { emoji: "🛒", label: name };
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
      const matchesCategory = filters.categories.some(
        (catId) =>
          p.categoryId === catId ||
          p.categoryName?.toLowerCase() === catId.toLowerCase()
      );
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
