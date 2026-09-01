"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Flame,
  Leaf,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ImageIcon,
} from "lucide-react";

import { DeliverySlotBanner } from "./DeliverySlotBanner";
import { ActiveOrderTracker } from "./ActiveOrderTracker";
import { RepeatOrderCard } from "./RepeatOrderCard";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { getHomePageSettings, formatCutoffHour, type HomePageSettings } from "@/lib/home/home-config";
import type { CustomerProduct } from "@/components/products/data";
import type { HomeCategory } from "./CategoryStrip";

interface MobileHomeViewProps {
  categories: HomeCategory[];
  products: CustomerProduct[];
  dealProduct: CustomerProduct | null;
}

const GROCERY_CHIPS = [
  "All Products",
  "Fresh Vegetables",
  "Fruits & Berries",
  "Dairy & Eggs",
  "Fresh Bakery",
  "Daily Essentials",
];

export function MobileHomeView({
  categories = [],
  products = [],
  dealProduct,
}: MobileHomeViewProps) {
  const [selectedChip, setSelectedChip] = useState("All Products");
  const [cfg, setCfg] = useState<HomePageSettings>(getHomePageSettings);

  useEffect(() => {
    setCfg(getHomePageSettings());
  }, []);

  const filteredProducts =
    selectedChip === "All Products"
      ? products
      : products.filter(
          (p) =>
            p.categoryName?.toLowerCase().includes(selectedChip.toLowerCase()) ||
            p.name.toLowerCase().includes(selectedChip.toLowerCase())
        );

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

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
              Slot: {cfg.deliverySlotLabel} • Cutoff {formatCutoffHour(cfg.cutoffHour)}
            </p>
          </div>
        </div>
        <Link
          href="/products"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Search items"
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
            <Leaf className="size-4 text-primary" />
            Shop Fresh Produce & Essentials
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-primary flex items-center gap-0.5"
          >
            See All <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="flex items-start gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {categories.map((cat) => (
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
          ))}
        </div>
      </div>

      {/* ── 7. Flash Deal Spotlight ────────────────────────────────── */}
      {dealProduct && (
        <div className="overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-br from-card via-card to-destructive/5 p-4 shadow-soft">
          <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
              <Flame className="size-3" /> {cfg.dealBadgeText}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Moon className="size-3 text-primary" /> Tonight {cfg.deliverySlotLabel}
            </span>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative size-24 shrink-0 rounded-xl overflow-hidden bg-accent/60">
              {dealProduct.imageUrl ? (
                <Image
                  src={dealProduct.imageUrl}
                  alt={dealProduct.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/40">
                  <ImageIcon className="size-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                {dealProduct.categoryName || "Fresh Grocery"}
              </span>
              <h3 className="font-display text-base font-bold text-foreground truncate">
                {dealProduct.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-lg font-bold text-foreground">
                  Rs {Math.round(dealProduct.price)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  Rs {Math.round(dealProduct.price / 0.8)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <AddToCartButton
                  productId={dealProduct.id}
                  quantity={1}
                  label={dealProduct.name}
                  size="md"
                  className="w-full text-xs py-1.5 h-8"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Category Chips ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 py-1">
        {GROCERY_CHIPS.map((chip) => {
          const isActive = selectedChip === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setSelectedChip(chip)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "bg-card text-muted-foreground border border-border/80 hover:text-foreground"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* ── 8. Product Grid ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            Featured Items
          </h2>
          <span className="text-xs text-muted-foreground">
            {displayProducts.length} items
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {displayProducts.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-3 shadow-xs transition-shadow hover:shadow-soft"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-accent/50 mb-2">
                  {prod.imageUrl ? (
                    <Image
                      src={prod.imageUrl}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30">
                      <ShoppingBag className="size-8" />
                    </div>
                  )}

                  <span className="absolute left-1.5 top-1.5 rounded-md bg-background/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow-xs">
                    {prod.categoryName || "1 Pack"}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                  {prod.name}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-border/50 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-sm font-bold text-foreground">
                    Rs {Math.round(prod.price)}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    In Stock
                  </span>
                </div>

                <AddToCartButton
                  productId={prod.id}
                  quantity={1}
                  label={prod.name}
                  size="md"
                  className="w-full text-xs h-8 rounded-xl font-bold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
