"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Moon, ShieldCheck, Truck } from "lucide-react";
import { getHomePageSettings, formatCutoffHour, type HomePageSettings } from "@/lib/home/home-config";

export function MarketHero() {
  const [cfg, setCfg] = useState<HomePageSettings>(getHomePageSettings);

  useEffect(() => {
    setCfg(getHomePageSettings());
  }, []);

  const trustPoints = [
    { Icon: Leaf, label: "Farm-fresh handpicked harvest" },
    { Icon: Moon, label: `${cfg.deliverySlotLabel} Evening Slot` },
    { Icon: Truck, label: `Free delivery over Rs ${cfg.freeDeliveryThreshold}` },
  ];

  return (
    <section
      aria-label="Fresh groceries delivered daily in the evening window"
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-secondary text-secondary-foreground">
        <Image
          src={cfg.heroImageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"}
          alt="Baskets of fresh seasonal fruit and vegetables at the market"
          fill
          priority
          className="object-cover opacity-35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/40"
        />

        <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/25 bg-secondary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <Moon aria-hidden="true" className="size-3.5 text-primary" />
              Evening Delivery Slot ({cfg.deliverySlotLabel})
            </span>

            <h1 className="mt-4 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              {cfg.heroTitle}{" "}
              <span className="block text-primary">{cfg.heroHighlight}</span>
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-secondary-foreground/80">
              {cfg.heroSubtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={cfg.heroCtaLink || "/products"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-button transition-transform duration-300 hover:-translate-y-0.5"
              >
                {cfg.heroCtaText || "Explore Market"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary-foreground/10"
              >
                Track Active Order
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-secondary-foreground/80">
                  <Icon aria-hidden="true" className="size-4 text-primary shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-end lg:flex">
            <dl className="ml-auto grid w-full max-w-xs gap-3">
              {[
                { k: cfg.deliverySlotLabel, v: "Fixed Evening Slot" },
                { k: formatCutoffHour(cfg.cutoffHour), v: "Order Cutoff Time" },
                { k: "100%", v: "Handpicked Fresh Produce" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-secondary-foreground/15 bg-secondary-foreground/10 px-5 py-4 backdrop-blur-sm"
                >
                  <dt className="font-display text-2xl font-bold">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-[0.12em] text-secondary-foreground/70 mt-0.5">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
