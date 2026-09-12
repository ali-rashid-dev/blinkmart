"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductSearch } from "@/components/products/ProductSearch";
import { FilterSidebar, type CategoryCountItem } from "@/components/products/FilterSidebar";
import { MobileFilterDrawer } from "@/components/products/MobileFilterDrawer";
import { SortDropdown } from "@/components/products/SortDropdown";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { CategoryNav, type NavCategory } from "@/components/products/CategoryNav";

import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/products/Pagination";
import {
  EmptyState,
  ErrorState,
  PaginationSkeleton,
  ProductGridSkeleton,
  SidebarSkeleton,
} from "@/components/products/States";
import { products as fallbackProducts, type CustomerProduct } from "@/components/products/data";
import type { CustomerCategoryRecord } from "@/repositories/category.repository";
import type { CustomerBrandRecord } from "@/repositories/brand.repository";
import {
  buildChips,
  filterProducts,
  initialFilters,
  parseCategoryEmoji,
  sortProducts,
  type Filters,
  type SortValue,
} from "@/components/products/filters";

export type ProductsClientProps = {
  categories?: CustomerCategoryRecord[];
  brands?: CustomerBrandRecord[];
  // If `initialProducts` is `undefined`, the component will fall back to
  // `fallbackProducts` (demo data). If an empty array (`[]`) is explicitly
  // provided, the component will honor that and render the EmptyState.
  initialProducts?: CustomerProduct[] | undefined;
  initialCategory?: string;
  initialSearch?: string;
  initialBrand?: string;
};

function resolveCategoryParamToId(
  param: string | null | undefined,
  rawCategories: CustomerCategoryRecord[],
  productList: CustomerProduct[]
): string | null {
  if (!param) return null;
  const target = decodeURIComponent(param).trim().toLowerCase();
  if (!target || target === "all") return null;

  // 1. Check exact match on category ID
  const byId = rawCategories.find((c) => c.id.toLowerCase() === target);
  if (byId) return byId.id;

  // 2. Check exact match on category slug
  const bySlug = rawCategories.find((c) => c.slug.toLowerCase() === target);
  if (bySlug) return bySlug.id;

  // 3. Check exact match on category name
  const byName = rawCategories.find((c) => c.name.toLowerCase() === target);
  if (byName) return byName.id;

  // 4. Check slugified category name match
  const bySlugifiedName = rawCategories.find(
    (c) => c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target
  );
  if (bySlugifiedName) return bySlugifiedName.id;

  // 5. Check alias / substring matching
  const byAlias = rawCategories.find((c) => {
    const slugLower = c.slug.toLowerCase();
    const nameLower = c.name.toLowerCase();
    return (
      slugLower.includes(target) ||
      target.includes(slugLower) ||
      nameLower.includes(target) ||
      target.includes(nameLower)
    );
  });
  if (byAlias) return byAlias.id;

  // 6. Check against productList categoryId or categoryName
  const prodMatch = productList.find(
    (p) =>
      p.categoryId?.toLowerCase() === target ||
      p.categoryName?.toLowerCase() === target ||
      p.categoryName?.toLowerCase().includes(target)
  );
  if (prodMatch) return prodMatch.categoryId || prodMatch.categoryName || target;

  return target;
}

export function ProductsClient({
  categories: rawCategories = [],
  brands: rawBrands = [],
  initialProducts,
  initialCategory,
  initialSearch,
  initialBrand,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams ? (searchParams.get("category") || searchParams.get("categories")) : null;
  const urlSearch = searchParams ? (searchParams.get("search") || searchParams.get("q")) : null;
  const urlBrand = searchParams ? (searchParams.get("brand") || searchParams.get("brands")) : null;

  const activeCategoryParam = urlCategory ?? initialCategory;
  const activeSearchParam = urlSearch ?? initialSearch;
  const activeBrandParam = urlBrand ?? initialBrand;

  // Treat an omitted `initialProducts` (undefined) as the signal to use
  // demo `fallbackProducts`. If callers explicitly pass an empty array,
  // preserve it so the EmptyState is reachable.
  const productList = initialProducts !== undefined ? initialProducts : fallbackProducts;

  const priceBounds: [number, number] = useMemo(() => {
    if (productList.length === 0) return [0, 5000];
    const prices = productList.map((p) => Number(p.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [Math.floor(min), Math.ceil(max)];
  }, [productList]);

  const [filters, setFilters] = useState<Filters>(() => {
    const resolvedCatId = resolveCategoryParamToId(
      activeCategoryParam,
      rawCategories,
      productList
    );
    return {
      ...initialFilters,
      categories: resolvedCatId ? [resolvedCatId] : (activeCategoryParam ? [activeCategoryParam] : []),
      search: activeSearchParam || "",
      brands: activeBrandParam ? [activeBrandParam] : [],
      priceRange: priceBounds,
    };
  });

  const [sort, setSort] = useState<SortValue>("featured");
  const [view, setView] = useState<"grid" | "compact">("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const navCategories: NavCategory[] = useMemo(() => {
    if (!rawCategories || rawCategories.length === 0) {
      return [];
    }
    return rawCategories.map((c) => {
      return {
        id: c.id,
        label: c.name,
        emoji: c.emoji || "🛒",
      };
    });
  }, [rawCategories]);

  const availableBrands = useMemo(() => {
    const names = new Set<string>();
    for (const b of rawBrands) {
      if (b.name) names.add(b.name);
    }
    for (const p of productList) {
      if (p.brandName) names.add(p.brandName);
    }
    return Array.from(names).sort();
  }, [rawBrands, productList]);

  const categoryCounts: CategoryCountItem[] = useMemo(() => {
    return navCategories.map((cat) => {
      const count = productList.filter(
        (p) =>
          p.categoryId === cat.id ||
          p.categoryName?.toLowerCase() === cat.label.toLowerCase()
      ).length;
      return {
        id: cat.id,
        label: cat.label,
        emoji: cat.emoji,
        count,
      };
    });
  }, [navCategories, productList]);

  useEffect(() => {
    const resolvedCatId = resolveCategoryParamToId(
      activeCategoryParam,
      rawCategories,
      productList
    );

    setFilters((prev) => {
      let nextCategories = prev.categories;
      if (activeCategoryParam) {
        const catValue = resolvedCatId || activeCategoryParam;
        nextCategories = [catValue];
      } else if (urlCategory === null && initialCategory === undefined) {
        nextCategories = [];
      }

      const nextSearch = activeSearchParam !== undefined && activeSearchParam !== null ? activeSearchParam : prev.search;
      const nextBrands = activeBrandParam ? [activeBrandParam] : prev.brands;

      if (
        JSON.stringify(prev.categories) === JSON.stringify(nextCategories) &&
        prev.search === nextSearch &&
        JSON.stringify(prev.brands) === JSON.stringify(nextBrands)
      ) {
        return prev;
      }

      return {
        ...prev,
        categories: nextCategories,
        search: nextSearch,
        brands: nextBrands,
      };
    });
  }, [activeCategoryParam, activeSearchParam, activeBrandParam, rawCategories, productList, urlCategory, initialCategory]);

  useEffect(() => {
    const t = setTimeout(() => setStatus("ready"), 400);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(
    () => sortProducts(filterProducts(productList, filters), sort),
    [productList, filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const current = page > totalPages ? 1 : page;
  const pageItems = results.slice((current - 1) * perPage, current * perPage);

  const categoryLabel = (id: string) => {
    const cat = navCategories.find((c) => c.id === id);
    if (!cat) return id;
    return cat.emoji ? `${cat.emoji} ${cat.label}` : cat.label;
  };

  const chips = buildChips(filters, categoryLabel);

  const update = (updater: (f: Filters) => Filters) => {
    setFilters(updater);
    setPage(1);
  };

  const handleSelectCategory = (id: string) => {
    const newCategories = id === "all" ? [] : [id];
    update((f) => ({ ...f, categories: newCategories }));

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (id === "all" || newCategories.length === 0) {
        url.searchParams.delete("category");
        url.searchParams.delete("categories");
      } else {
        const catObj = rawCategories.find((c) => c.id === id);
        url.searchParams.set("category", catObj?.slug || id);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const reset = () => {
    setFilters({ ...initialFilters, priceRange: priceBounds });
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      url.searchParams.delete("categories");
      url.searchParams.delete("search");
      url.searchParams.delete("q");
      url.searchParams.delete("brand");
      url.searchParams.delete("brands");
      window.history.replaceState(null, "", url.toString());
    }
  };
  const retry = () => {
    setStatus("loading");
    setTimeout(() => setStatus("ready"), 400);
  };

  const toggleBtn = (active: boolean) =>
    cn(
      "grid size-10 place-items-center rounded-xl border transition-colors",
      active
        ? "border-primary bg-accent text-accent-foreground"
        : "border-border bg-card text-muted-foreground hover:text-foreground",
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-accent/60 blur-3xl animate-soft-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 right-0 size-96 rounded-full bg-secondary/10 blur-3xl animate-soft-float"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-8 lg:pb-14 lg:pt-12">
        <ProductsHeader total={results.length} />

        <div className="sticky top-0 z-20 -mx-4 mt-6 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <ProductSearch
            value={filters.search}
            onChange={(v) => update((f) => ({ ...f, search: v }))}
          />
        </div>

        {navCategories.length > 0 && (
          <nav aria-label="Browse categories" className="mt-5 hidden lg:block">
            <CategoryNav
              categories={[{ id: "all", label: "All", emoji: "✨" }, ...navCategories]}
              selectedId={filters.categories[0] ?? "all"}
              onSelect={handleSelectCategory}
            />
          </nav>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start xl:gap-8">
          <aside className="hidden rounded-3xl border border-border bg-card/70 p-5 lg:sticky lg:top-6 lg:block">
            {status === "loading" ? (
              <SidebarSkeleton />
            ) : (
              <FilterSidebar
                filters={filters}
                onChange={update}
                onClear={reset}
                showCategories={false}
                categoryCounts={categoryCounts}
                brands={availableBrands}
                priceBounds={priceBounds}
              />
            )}
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {chips.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                    {chips.length}
                  </span>
                )}
              </button>

              <p className="hidden text-sm text-muted-foreground lg:block">
                Showing{" "}
                <span className="font-semibold text-foreground">{pageItems.length}</span> of{" "}
                <span className="font-semibold text-foreground">{results.length}</span> products
              </p>

              <div className="flex items-center gap-2">
                <SortDropdown value={sort} onChange={setSort} />
                <div className="hidden items-center gap-1.5 sm:flex">
                  <button
                    type="button"
                    aria-pressed={view === "grid"}
                    aria-label="Grid view"
                    onClick={() => setView("grid")}
                    className={toggleBtn(view === "grid")}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === "compact"}
                    aria-label="Compact view"
                    onClick={() => setView("compact")}
                    className={toggleBtn(view === "compact")}
                  >
                    <Rows3 className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <ActiveFilters chips={chips} onChange={update} onClear={reset} />

            {status === "loading" ? (
              <>
                <ProductGridSkeleton count={perPage > 12 ? 12 : perPage} />
                <PaginationSkeleton />
              </>
            ) : status === "error" ? (
              <ErrorState onRetry={retry} />
            ) : results.length === 0 ? (
              <EmptyState onReset={reset} />
            ) : (
              <>
                <ProductGrid products={pageItems} view={view} />
                <Pagination
                  page={current}
                  totalPages={totalPages}
                  perPage={perPage}
                  onPageChange={setPage}
                  onPerPageChange={(n) => {
                    setPerPage(n);
                    setPage(1);
                  }}
                />
              </>
            )}
          </section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-5 left-1/2 z-30 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform active:scale-95 lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filters &amp; Sort
      </button>

      <MobileFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        onChange={update}
        onClear={reset}
        resultCount={results.length}
        categoryCounts={categoryCounts}
        brands={availableBrands}
        priceBounds={priceBounds}
      />
    </main>
  );
}
