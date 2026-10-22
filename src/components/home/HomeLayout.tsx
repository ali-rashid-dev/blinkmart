"use client";

import { useSyncExternalStore } from "react";
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

const subscribeToViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};

const getIsMobile = () => window.innerWidth < 1024;
const getServerIsMobile = () => false;

interface HomeLayoutProps {
  categories: HomeCategory[];
  products: CustomerProduct[];
  recentProducts: CustomerProduct[];
  moreProducts: CustomerProduct[];
  productsFailedToLoad: boolean;
  dealProduct: CustomerProduct | null;
  dealCompareAtPrice: number | null;
}

export function HomeLayout({
  categories,
  products,
  recentProducts,
  moreProducts,
  productsFailedToLoad,
  dealProduct: serverDealProduct,
  dealCompareAtPrice,
}: HomeLayoutProps) {
  const isMobile = useSyncExternalStore(subscribeToViewport, getIsMobile, getServerIsMobile);

  if (isMobile) {
    return (
      <MobileHomeView
        categories={categories}
        products={products}
        productsFailedToLoad={productsFailedToLoad}
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
        title="Recently added"
        subtitle="Browse the latest products added to the market."
        products={recentProducts}
        ctaLabel="View All Products"
        error={productsFailedToLoad}
      />
      {serverDealProduct && <DealOfTheDay product={serverDealProduct} compareAtPrice={dealCompareAtPrice} />}
      <ProductRow
        title="More to explore"
        subtitle="Continue browsing more products from the market."
        products={moreProducts}
        ctaLabel="See All Items"
        error={productsFailedToLoad}
      />
      <WhyShopWithUs />
      <FinalCta />
      <Footer />
    </main>
  );
}
