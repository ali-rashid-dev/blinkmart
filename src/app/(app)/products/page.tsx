import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsClient } from "@/components/products/ProductsClient";
import { listCustomerCategories } from "@/repositories/category.repository";
import { listCustomerProducts } from "@/repositories/product.repository";
import { getEnabledBrands } from "@/services/brand.service";
import { toCustomerProduct } from "@/components/products/data";
import { ProductGridSkeleton } from "@/components/products/States";

export const metadata: Metadata = {
  title: "Shop Fresh Groceries — Kit&Co",
  description:
    "Browse handpicked organic produce, dairy, bakery and pantry staples. Filter by category, brand, price and rating.",
  openGraph: {
    title: "Shop Fresh Groceries — Kit&Co",
    description:
      "Browse handpicked organic produce, dairy, bakery and pantry staples with same-day delivery.",
  },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; search?: string; brand?: string; q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialCategory = resolvedSearchParams.category;
  const initialSearch = resolvedSearchParams.search || resolvedSearchParams.q;
  const initialBrand = resolvedSearchParams.brand;

  let dbCategories: Awaited<ReturnType<typeof listCustomerCategories>> = [];
  let dbProducts: Awaited<ReturnType<typeof listCustomerProducts>> = [];
  let dbBrands: Awaited<ReturnType<typeof getEnabledBrands>> = [];

  try {
    const [cats, prods, brands] = await Promise.all([
      listCustomerCategories({}),
      listCustomerProducts({}),
      getEnabledBrands({}),
    ]);
    dbCategories = cats;
    dbProducts = prods;
    dbBrands = brands;
  } catch (error) {
    console.error("Error loading categories, products, or brands from backend DB:", error);
  }

  const initialProducts = dbProducts.map(toCustomerProduct);

  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsClient
        categories={dbCategories}
        brands={dbBrands}
        initialProducts={initialProducts}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        initialBrand={initialBrand}
      />
    </Suspense>
  );
}
