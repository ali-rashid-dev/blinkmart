"use client";

import { useSyncExternalStore } from "react";
import { HomeBanner } from "./HomeBanner";
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
import { AdBanner } from "./AdBanner";
import type { HomeCategory } from "./CategoryStrip";
import type { CustomerProduct } from "@/components/products/data";
import type { AdBannerRecord } from "@/repositories/ad-banner.repository";

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
  /** Up to three active banners, ordered top, middle, then end of page. */
  activeAds: AdBannerRecord[];
}

export function HomeLayout({
  categories,
  products,
  recentProducts,
  moreProducts,
  productsFailedToLoad,
  dealProduct: serverDealProduct,
  dealCompareAtPrice,
  activeAds,
}: HomeLayoutProps) {
  const isMobile = useSyncExternalStore(subscribeToViewport, getIsMobile, getServerIsMobile);

  if (isMobile) {
    return (
      <MobileHomeView
        categories={categories}
        products={products}
        productsFailedToLoad={productsFailedToLoad}
        activeAds={activeAds}
      />
    );
  }

  return (
    <main className="overflow-x-hidden bg-background">
      {activeAds[0] && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
          <AdBanner banner={activeAds[0]} />
        </div>
      )}
      <HomeBanner />

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 flex flex-col gap-6">
        <ActiveOrderTracker />
        <RepeatOrderCard />
        <DeliverySlotBanner />
      </div>

      <CategoryStrip categories={categories} />
      <PromoBanner />
      {activeAds[1] && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <AdBanner banner={activeAds[1]} />
        </div>
      )}
      <ProductRow
        title="Recently added"
        subtitle="Browse the latest products added to the market."
        products={recentProducts}
        ctaLabel="View All Products"
        error={productsFailedToLoad}
      />
      {serverDealProduct && <DealOfTheDay product={serverDealProduct} compareAtPrice={dealCompareAtPrice} />}
      {(moreProducts.length > 0 || productsFailedToLoad) && (
        <ProductRow
          title="More to explore"
          subtitle="Continue browsing more products from the market."
          products={moreProducts}
          ctaLabel="See All Items"
          error={productsFailedToLoad}
        />
      )}
      <WhyShopWithUs />
      <FinalCta />
      {activeAds[2] && (
        <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
          <AdBanner banner={activeAds[2]} />
        </div>
      )}
    </main>
  );
}
