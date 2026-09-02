"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, Truck } from "lucide-react";
import {
  getHomePageSettings,
  type HomePageSettings,
} from "@/lib/home/home-config";

export function FinalCta() {
  const [cfg, setCfg] = useState<HomePageSettings>(getHomePageSettings());

  useEffect(() => {
    setCfg(getHomePageSettings());
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-secondary px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          
          {/* Badge */}
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Guaranteed Evening Delivery
          </span>

          {/* Heading */}
          <h2 className="font-display text-3xl font-bold leading-tight text-secondary-foreground sm:text-5xl">
            Your groceries are just a{" "}
            <span className="text-primary">
              few clicks away.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-secondary-foreground/70 sm:text-base">
            Shop farm-fresh produce, weekly staples &amp; monthly pantry
            stock-ups delivered straight to your door in our{" "}
            {cfg.deliverySlotLabel} evening slot.
          </p>

          {/* CTA */}
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

          {/* Features */}
          <div className="mt-8 flex w-full max-w-md items-center justify-center gap-6 border-t border-secondary-foreground/10 pt-4 text-xs font-medium text-secondary-foreground/70">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-primary" />
              Free Delivery &gt; Rs {cfg.freeDeliveryThreshold}
            </span>

            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              100% Quality Inspected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
