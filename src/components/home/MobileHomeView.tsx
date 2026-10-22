"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Moon,
  Search,
  ShoppingBag,
} from "lucide-react";

import { DeliverySlotBanner } from "./DeliverySlotBanner";
import { ActiveOrderTracker } from "./ActiveOrderTracker";
import { RepeatOrderCard } from "./RepeatOrderCard";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import type { CustomerProduct } from "@/components/products/data";
import type { HomeCategory } from "./CategoryStrip";

interface MobileHomeViewProps {
  categories: HomeCategory[];
  products: CustomerProduct[];
  productsFailedToLoad: boolean;
}

export function MobileHomeView({
  categories = [],
  products = [],
  productsFailedToLoad,
}: MobileHomeViewProps) {
  const displayProducts = products;

  return (
    <div className="lg:hidden flex flex-col gap-5 px-4 pt-4 pb-8">
      {/* ── 1. Top Location & Slot Header ─────────────────────────── */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-card p-3 border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Moon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold uppercase text-primary tracking-wider">
                Evening Delivery Run
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-foreground truncate">
              Slot: 7:00 PM – 10:00 PM • Cutoff 5:00 PM
            </p>
          </div>
        </div>
        <Link
          href="/products"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Browse and search products"
        >
          <Search className="size-4" />
        </Link>
      </div>

      {/* ── 2. Active Order Progress Tracker ───────────────────────── */}
      <ActiveOrderTracker />

      {/* ── 3. Weekly/Monthly Repeat Order Widget ─────────────────── */}
      <RepeatOrderCard />

      {/* ── 4. Delivery Slot & Cutoff Banner ───────────────────────── */}
      <DeliverySlotBanner />

      {/* ── 5. Category Aisles Bubbles ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-primary" />
            Shop Groceries & Essentials
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

      {/* ── 9. Homepage Footer ────────────────────────────────────────── */}
      <div className="-mx-4 -mb-8 mt-6">
        <Footer />
      </div>
    </div>
  );
}
