import type { Metadata } from "next";
import { MarketHero } from "@/components/home/MarketHero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductRow } from "@/components/home/ProductRow";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";
import { FinalCta } from "@/components/home/FinalCta";
import { DeliverySlotBanner } from "@/components/home/DeliverySlotBanner";
import { ActiveOrderTracker } from "@/components/home/ActiveOrderTracker";
import { RepeatOrderCard } from "@/components/home/RepeatOrderCard";
import { MobileHomeView } from "@/components/home/MobileHomeView";
import { listCustomerCategories } from "@/repositories/category.repository";
import { listCustomerProducts } from "@/repositories/product.repository";
import { toCustomerProduct } from "@/components/products/data";

export const metadata: Metadata = {
  title: "Kit&Co — Weekly & Monthly Grocery Delivery (7–10 PM Slot)",
  description:
    "Shop handpicked fruit, vegetables, weekly dairy boxes, and monthly bulk pantry stock-ups with guaranteed evening delivery (7:00 PM – 10:00 PM) and same-day 5:00 PM cutoff.",
  openGraph: {
    title: "Kit&Co — Weekly & Monthly Grocery Delivery (7–10 PM Slot)",
    description:
      "Weekly fresh produce boxes and monthly pantry stock-ups delivered in our guaranteed evening slot.",
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
    dbProducts = await listCustomerProducts({ take: 24 });
  } catch (error) {
    console.error("Error loading products for home page:", error);
  }

  const allCustomerProducts = dbProducts.map(toCustomerProduct);

  const bestSellers = allCustomerProducts.slice(0, 6);
  const freshArrivals = allCustomerProducts.slice(6, 12);
  const dealProduct = allCustomerProducts.length > 0 ? allCustomerProducts[0] : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <h1 className="sr-only">Kit&Co — Weekly &amp; Monthly Grocery Delivery</h1>

      {/* ── 1. Dedicated Mobile View ───────────────────────────────────────── */}
      <MobileHomeView
        categories={dbCategories}
        products={allCustomerProducts}
        dealProduct={dealProduct}
      />

      {/* ── 2. Desktop Layout ──────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <MarketHero />

        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 flex flex-col gap-6">
          <ActiveOrderTracker />
          <RepeatOrderCard />
          <DeliverySlotBanner />
        </div>

        <CategoryStrip categories={dbCategories} />
        <PromoBanner />
        <ProductRow
          title="Weekly Staples & Best Sellers"
          subtitle="Customer favorite fresh produce, dairy & recurring household items."
          products={bestSellers}
          ctaLabel="View All Products"
        />
        <DealOfTheDay product={dealProduct} />
        <ProductRow
          title="Monthly Stock-Up Essentials"
          subtitle="Bulk pantry items, flour, rice, oils, and restocked shelves."
          products={freshArrivals.length > 0 ? freshArrivals : bestSellers}
          ctaLabel="See All Items"
        />
        <WhyShopWithUs />
        <FinalCta />
      </div>
    </main>
  );
}
