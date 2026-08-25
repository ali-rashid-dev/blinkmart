import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center sm:px-10 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-0 size-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 size-64 rounded-full bg-secondary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-2xl text-foreground sm:text-4xl">
            Your groceries are just a few clicks away.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Shop fresh products and get everything you need delivered to your door.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
          >
            Start Shopping
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

