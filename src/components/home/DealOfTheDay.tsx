"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Flame, ImageIcon } from "lucide-react";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import type { CustomerProduct } from "@/components/products/data";
import { SectionHeader } from "./SectionHeader";

const DURATION = 6 * 3600 + 42 * 60 + 18;

const pad = (n: number) => String(n).padStart(2, "0");

interface DealOfTheDayProps {
  product?: CustomerProduct | null;
}

export function DealOfTheDay({ product }: DealOfTheDayProps) {
  const [left, setLeft] = useState(DURATION);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setLeft((v) => (v <= 1 ? DURATION : v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  if (!product) {
    return null;
  }

  const parts = [
    { label: "Hrs", value: pad(Math.floor(left / 3600)) },
    { label: "Min", value: pad(Math.floor((left % 3600) / 60)) },
    { label: "Sec", value: pad(left % 60) },
  ];

  const p = product;
  const soldOut = !p.enabled;
  const originalPrice = Math.round(p.price * 1.2); // Special deal original price comparison

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeader title="Deal of the Day" subtitle="One standout price, refreshed daily." />
      <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-accent/70">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--color-card),transparent_65%)]"
          />
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.name}
              fill
              className="object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/40">
              <ImageIcon className="h-20 w-20" />
            </div>
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-destructive-foreground">
            <Flame className="size-3" />−20% OFF
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            {p.categoryName && (
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {p.categoryName}
              </span>
            )}
            <h3 className="font-display text-2xl text-foreground sm:text-3xl mt-1">{p.name}</h3>
            {p.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-3xl text-foreground">Rs {Math.round(p.price)}</span>
            <span className="text-sm text-muted-foreground line-through">
              Rs {originalPrice}
            </span>
          </div>

          <p className="text-[13px] font-semibold text-success">
            {soldOut ? "Out of Stock" : "In Stock — Fresh Daily"}
          </p>

          <div className="rounded-2xl border border-border bg-accent/40 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <Clock className="size-3.5" />
              Deal ends soon
            </p>
            <div className="mt-2 flex items-center gap-2">
              {parts.map((part) => (
                <div
                  key={part.label}
                  className="min-w-14 rounded-xl bg-card px-3 py-2 text-center shadow-[var(--shadow-soft)]"
                >
                  <span className="block font-display text-xl tabular-nums text-foreground">
                    {part.value}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {part.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
            <QuantitySelector
              value={qty}
              onChange={setQty}
              max={99}
              disabled={soldOut}
              label={p.name}
            />
            <AddToCartButton
              productId={p.id}
              quantity={qty}
              label={p.name}
              disabled={soldOut}
              size="lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

