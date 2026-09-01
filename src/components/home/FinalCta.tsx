"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { getHomePageSettings, type HomePageSettings } from "@/lib/home/home-config";

export function FinalCta() {
  const [cfg, setCfg] = useState<HomePageSettings>(getHomePageSettings());

  useEffect(() => {
    setCfg(getHomePageSettings());
  }, []);
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-secondary/20 px-6 py-12 text-center sm:px-12 sm:py-16 shadow-card">
        {/* Decorative Glow Blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-primary/20 blur-3xl animate-soft-float"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-secondary/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4 backdrop-blur-md">
            <Sparkles className="size-3.5" /> Guaranteed Evening Delivery
          </span>

          <h2 className="font-display text-3xl text-foreground sm:text-5xl font-bold leading-tight">
            Your groceries are just a{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent">
              few clicks away.
            </span>
          </h2>

          <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed max-w-lg">
            Shop farm-fresh produce, weekly staples &amp; monthly pantry stock-ups delivered straight to your door in our {cfg.deliverySlotLabel} evening slot.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-button transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="size-5" />
              Start Shopping Now
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4 w-full max-w-md">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-primary" /> Free Delivery &gt; Rs {cfg.freeDeliveryThreshold}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> 100% Quality Inspected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
