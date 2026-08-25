import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Leaf, Truck } from "lucide-react";

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80";

const trustPoints = [
  { Icon: Leaf, label: "Farm-fresh daily" },
  { Icon: Truck, label: "Free delivery over Rs 1,000" },
  { Icon: Clock, label: "Express & Scheduled Slots" },
];

export function MarketHero() {
  return (
    <section
      aria-label="Fresh groceries delivered daily"
      className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-secondary text-secondary-foreground">
        <Image
          src={HERO_IMAGE_URL}
          alt="Baskets of fresh seasonal fruit and vegetables at the market"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/40"
        />

        <div className="relative grid gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/25 bg-secondary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <Leaf aria-hidden="true" className="size-3.5" />
              BlinkMart Express Delivery
            </span>

            <p className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Fresh groceries,
              <span className="block text-primary">delivered in minutes.</span>
            </p>

            <p className="mt-4 max-w-md text-base leading-relaxed text-secondary-foreground/80">
              Fresh produce, dairy, bakery and pantry staples — handpicked each morning and delivered straight to your door.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start shopping
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary-foreground/10"
              >
                Track an order
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-secondary-foreground/80">
                  <Icon aria-hidden="true" className="size-4 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-end lg:flex">
            <dl className="ml-auto grid w-full max-w-xs gap-3">
              {[
                { k: "1,000+", v: "Products on the shelf" },
                { k: "30 min", v: "Average delivery time" },
                { k: "4.9 / 5", v: "Rated by happy shoppers" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-secondary-foreground/15 bg-secondary-foreground/10 px-5 py-4 backdrop-blur-sm"
                >
                  <dt className="font-display text-2xl">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-[0.12em] text-secondary-foreground/70">
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

