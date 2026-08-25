import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary px-6 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-foreground/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary-foreground">
              <Sparkles className="size-3" />
              Limited time
            </span>
            <h2 className="mt-3 font-display text-2xl text-secondary-foreground sm:text-4xl">
              Fresh deals every day
            </h2>
            <p className="mt-2 text-sm text-secondary-foreground/80 sm:text-base">
              Save up to 30% on selected groceries, refreshed each morning.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="hidden text-5xl sm:block">
              🧺
            </span>
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
            >
              Shop Deals
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

