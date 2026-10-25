"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Moon,
  Search,
  ShoppingBag,
} from "lucide-react";

import { DeliverySlotBanner } from "./DeliverySlotBanner";
import { ActiveOrderTracker } from "./ActiveOrderTracker";
import { RepeatOrderCard } from "./RepeatOrderCard";
import { ProductCard } from "@/components/products/ProductCard";
import { SearchBar } from "@/components/layout/navbar/search-bar";
import { AdBanner } from "./AdBanner";
import type { CustomerProduct } from "@/components/products/data";
import type { HomeCategory } from "./CategoryStrip";
import type { AdBannerRecord } from "@/repositories/ad-banner.repository";

interface MobileHomeViewProps {
  categories: HomeCategory[];
  products: CustomerProduct[];
  productsFailedToLoad: boolean;
  activeAds: AdBannerRecord[];
}

export function MobileHomeView({
  categories = [],
  products = [],
  productsFailedToLoad,
  activeAds,
}: MobileHomeViewProps) {
  const displayProducts = products;

  return (
    <div className="lg:hidden flex flex-col gap-5 px-4 pt-4 pb-8">
      {activeAds[0] && <AdBanner banner={activeAds[0]} />}

      {/* ── 1. Search ───────────────────────────────────────────────────── */}
      <SearchBar className="h-12 rounded-xl bg-card shadow-xs" />


      {/* ── 0. FreshMart-style Mobile Campaign Hero ───────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(160deg, #2D4A3E 0%, #3a6352 35%, #4d8066 60%, #6fa882 80%, #a8d4b8 100%)",
          border: "1.5px solid rgba(45,74,62,0.45)",
          minHeight: "200px",
        }}
      >
        {/* Giant background wordmark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
        >
          <span
            className="font-display font-black leading-none tracking-tight whitespace-nowrap"
            style={{
              fontSize: "clamp(4.5rem, 28vw, 8rem)",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.15)",
              letterSpacing: "-0.04em",
            }}
          >
            kitcomart
          </span>
        </div>

        {/* Left vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 5% 50%, rgba(45,74,62,0.75) 0%, rgba(45,74,62,0.15) 65%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="relative flex items-end" style={{ minHeight: "200px" }}>
          {/* Left copy */}
          <div
            className="z-10 flex flex-col gap-3 p-5 pb-6 pr-2"
            style={{ maxWidth: "55%" }}
          >
            <h2
              className="font-display font-black leading-[1.05] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.6rem, 7vw, 2.2rem)" }}
            >
              Ghar Ka Har
              <br />
              <span style={{ color: "#a8d4b8" }}>Zaroori</span>{" "}
              <span style={{ color: "#FAF6F0" }}>Saaman.</span>
            </h2>

            <Link
              href="/products"
              id="mobile-hero-cta-primary"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                background: "#D96C3F",
                boxShadow: "0 4px 14px -4px rgba(217,108,63,0.5)",
              }}
            >
              Shop Now
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          {/* Model image */}
          <div
            className="absolute bottom-0 right-0"
            style={{ width: "50%", maxWidth: "190px", zIndex: 5 }}
          >
            <Image
              src="/hero-modle.png"
              alt="Kitcomart shopper with packaged groceries"
              width={550}
              height={640}
              className="h-auto w-full object-contain object-bottom"
              style={{
                mixBlendMode: "multiply",
                maxHeight: "210px",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>


      {/* ── 2. Active Order Progress Tracker ───────────────────────── */}
      <ActiveOrderTracker />

      {/* ── 3. Weekly/Monthly Repeat Order Widget ─────────────────── */}
      <RepeatOrderCard />

      {/* ── 4. Delivery Slot & Cutoff Banner ───────────────────────── */}

      {/* ── 5. Category Aisles Bubbles ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-primary" />
            Shop Groceries &amp; Essentials
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-primary flex items-center gap-0.5"
          >
            See All <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="flex items-start gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {categories.length > 0 ? categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="flex flex-col items-center gap-1.5 shrink-0 w-20 group"
            >
              <div className="relative size-16 rounded-2xl bg-card border border-border/70 p-2 shadow-xs group-active:scale-95 transition-transform flex items-center justify-center overflow-hidden">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover rounded-xl"
                  />
                ) : (
                  <ShoppingBag className="size-7 text-primary/70" />
                )}
              </div>
              <span className="text-[11px] font-semibold text-center text-foreground line-clamp-1">
                {cat.name}
              </span>
            </Link>
          )) : (
            <Link href="/products" className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-primary">
              Browse all products
            </Link>
          )}
        </div>
      </div>

      {activeAds[1] && <AdBanner banner={activeAds[1]} />}

      {/* ── 8. Products ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-primary" />
            Browse products
          </h2>
          <span className="text-xs text-muted-foreground">
            {displayProducts.length} {displayProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {productsFailedToLoad ? (
            <div className="col-span-full rounded-xl border border-border bg-card px-4 py-10 text-center">
              <p className="font-semibold text-foreground">Products are temporarily unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">Please try again shortly.</p>
              <Link href="/products" className="mt-3 inline-flex text-sm font-semibold text-primary">Browse all products</Link>
            </div>
          ) : displayProducts.length > 0 ? (
            displayProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full rounded-xl border border-border bg-card px-4 py-10 text-center">
              <ShoppingBag className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 font-semibold text-foreground">No products to show yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Please check back soon.</p>
            </div>
          )}
        </div>
      </div>

      {activeAds[2] && <AdBanner banner={activeAds[2]} />}
    </div>
  );
}
