import type { Metadata } from "next";
import { ProductsClient } from "@/components/products/ProductsClient";
import { listCustomerCategories } from "@/repositories/category.repository";
import { listCustomerProducts } from "@/repositories/product.repository";
import { getEnabledBrands } from "@/services/brand.service";
import { toCustomerProduct } from "@/components/products/data";

export const metadata: Metadata = {
  title: "Shop Fresh Groceries — Verdant Market",
  description:
    "Browse handpicked organic produce, dairy, bakery and pantry staples. Filter by category, brand, price and rating at Verdant Market.",
  openGraph: {
    title: "Shop Fresh Groceries — Verdant Market",
    description:
      "Browse handpicked organic produce, dairy, bakery and pantry staples with same-day delivery.",
  },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
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
    <ProductsClient
      categories={dbCategories}
      brands={dbBrands}
      initialProducts={initialProducts}
    />
  );
}
