import type { Metadata } from "next";
import { MarketHero } from "@/components/home/MarketHero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductRow } from "@/components/home/ProductRow";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { ShopByNeed } from "@/components/home/ShopByNeed";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";
import { FinalCta } from "@/components/home/FinalCta";
import { listCustomerCategories } from "@/repositories/category.repository";
import { listCustomerProducts } from "@/repositories/product.repository";
import { toCustomerProduct } from "@/components/products/data";

export const metadata: Metadata = {
  title: "BlinkMart — Fresh Groceries Delivered Daily",
  description:
    "Shop handpicked fruit, vegetables, dairy, bakery, meat and pantry staples with daily deals and fast delivery from BlinkMart.",
  openGraph: {
    title: "BlinkMart — Fresh Groceries Delivered Daily",
    description:
      "Shop handpicked fresh produce, dairy, bakery and household essentials with fast delivery.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let dbCategories: Awaited<ReturnType<typeof listCustomerCategories>> = [];
  let dbProducts: Awaited<ReturnType<typeof listCustomerProducts>> = [];

  try {
    dbCategories = await listCustomerCategories({});
  } catch (error) {
    console.error("Error loading categories for home page:", error);
  }

  try {
    dbProducts = await listCustomerProducts({ take: 20 });
  } catch (error) {
    console.error("Error loading products for home page:", error);
  }

  const allCustomerProducts = dbProducts.map(toCustomerProduct);

  const bestSellers = allCustomerProducts.slice(0, 5);
  const freshArrivals = allCustomerProducts.slice(5, 10);

  const dealProduct = allCustomerProducts.length > 0 ? allCustomerProducts[0] : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <h1 className="sr-only">BlinkMart — fresh groceries delivered daily</h1>
      <MarketHero />
      <CategoryStrip categories={dbCategories} />
      <PromoBanner />
      <ProductRow
        title="Best Sellers"
        subtitle="Popular picks our customers love."
        products={bestSellers}
        ctaLabel="View All Products"
      />
      <DealOfTheDay product={dealProduct} />
      <ShopByNeed />
      <ProductRow
        title="Fresh Arrivals"
        subtitle="New products added to our shelves."
        products={freshArrivals.length > 0 ? freshArrivals : bestSellers}
        ctaLabel="See New Arrivals"
      />
      <WhyShopWithUs />
      <FinalCta />
    </main>
  );
}

