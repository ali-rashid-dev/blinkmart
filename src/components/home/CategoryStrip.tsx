import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShoppingBag } from "lucide-react";

export type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

interface CategoryStripProps {
  categories?: HomeCategory[];
}

export function CategoryStrip({ categories = [] }: CategoryStripProps) {
  return (
    <section
      aria-label="Shop by category"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Aisles</p>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Shop by category</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Explore our wide range of fresh produce, dairy, bakery, meat, and pantry items.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          View all
          <ChevronRight aria-hidden="true" className="size-4 text-primary" />
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-col items-center gap-3">
            <Link
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/30 hover:shadow-[var(--shadow-soft)] flex items-center justify-center p-3"
            >
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary/70 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="size-8" />
                </div>
              )}
            </Link>
            <Link
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="text-center text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

