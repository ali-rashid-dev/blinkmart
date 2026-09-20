"use client";

import { useEffect, useState } from "react";
import { MarketHero } from "./MarketHero";
import { CategoryStrip } from "./CategoryStrip";
import { PromoBanner } from "./PromoBanner";
import { ProductRow } from "./ProductRow";
import { DealOfTheDay } from "./DealOfTheDay";
import { WhyShopWithUs } from "./WhyShopWithUs";
import { FinalCta } from "./FinalCta";
import { ActiveOrderTracker } from "./ActiveOrderTracker";
import { RepeatOrderCard } from "./RepeatOrderCard";
import { DeliverySlotBanner } from "./DeliverySlotBanner";
import { MobileHomeView } from "./MobileHomeView";
import { Footer } from "@/components/layout/Footer";
import type { HomeCategory } from "./CategoryStrip";
import type { CustomerProduct } from "@/components/products/data";

interface HomeLayoutProps {
  categories: HomeCategory[];
  products: CustomerProduct[];
  bestSellers: CustomerProduct[];
  freshArrivals: CustomerProduct[];
  dealProduct: CustomerProduct | null;
  dealCompareAtPrice: number | null;
}

export function HomeLayout({
  categories,
  products,
  bestSellers,
  freshArrivals,
  dealProduct: serverDealProduct,
  dealCompareAtPrice,
}: HomeLayoutProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    return (
      <MobileHomeView
        categories={categories}
        products={products}
        bestSellers={bestSellers}
        dealProduct={serverDealProduct}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <MarketHero />

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 flex flex-col gap-6">
        <ActiveOrderTracker />
        <RepeatOrderCard />
        <DeliverySlotBanner />
      </div>

      <CategoryStrip categories={categories} />
      <PromoBanner />
      <ProductRow
        title="Weekly Staples & Best Sellers"
        subtitle="Customer favorite packaged groceries, pantry staples & household items."
        products={bestSellers}
        ctaLabel="View All Products"
      />
      {serverDealProduct && <DealOfTheDay product={serverDealProduct} compareAtPrice={dealCompareAtPrice} />}
      <ProductRow
        title="Monthly Stock-Up Essentials"
        subtitle="Bulk pantry items, flour, rice, oils, and restocked shelves."
        products={freshArrivals.length > 0 ? freshArrivals : bestSellers}
        ctaLabel="See All Items"
      />
      <WhyShopWithUs />
      <FinalCta />
      <Footer />
    </main>
  );
}
