import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { CustomerProduct } from "@/components/products/data";
import { SectionHeader } from "@/components/home/SectionHeader";

export function ProductRow({
  title,
  subtitle,
  products,
  ctaLabel,
}: {
  title: string;
  subtitle: string;
  products: CustomerProduct[];
  ctaLabel: string;
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <Link
            href="/products"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
          >
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

