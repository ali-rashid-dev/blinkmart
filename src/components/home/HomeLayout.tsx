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
import { getHomePageSettings } from "@/lib/home/home-config";
import type { HomeCategory } from "./CategoryStrip";
import type { CustomerProduct } from "@/components/products/data";

interface HomeLayoutProps {
  categories: HomeCategory[];
  products: CustomerProduct[];
  bestSellers: CustomerProduct[];
  freshArrivals: CustomerProduct[];
  dealProduct: CustomerProduct | null;
}

/**
 * Client-side responsive layout that chooses between mobile and desktop views
 * using media query decision, preventing duplicate widget mounting.
 * Shared widgets (ActiveOrderTracker, RepeatOrderCard, DeliverySlotBanner)
 * are only rendered once based on the device type.
 */
export function HomeLayout({
  categories,
  products,
  bestSellers,
  freshArrivals,
  dealProduct: defaultDealProduct,
}: HomeLayoutProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [dealProduct, setDealProduct] = useState(defaultDealProduct);

  useEffect(() => {
    // Set initial value based on window size
    setIsMobile(window.innerWidth < 1024);

    // Listen for resize events
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Find deal product by configured dealProductId, or fall back to default
    const cfg = getHomePageSettings();
    if (cfg.dealProductId) {
      const found = products.find((p) => p.id === cfg.dealProductId);
      if (found) {
        setDealProduct(found);
      }
    }
  }, [products]);

  // Wait for client-side hydration to determine layout
  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    // Mobile view: render dedicated mobile layout which includes all shared widgets
    return (
      <MobileHomeView
        categories={categories}
        products={products}
        dealProduct={dealProduct}
      />
    );
  }

  // Desktop view: render full desktop layout with shared widgets
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
    </main>
  );
}
