import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { CustomerProduct } from "@/components/products/data";
import { SectionHeader } from "@/components/home/SectionHeader";

export function ProductRow({
  title,
  subtitle,
  products,
  ctaLabel,
  error = false,
}: {
  title: string;
  subtitle: string;
  products: CustomerProduct[];
  ctaLabel: string;
  error?: boolean;
}) {
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
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
          <ShoppingBag className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">
            {error ? "Products are temporarily unavailable" : "No products to show yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ? "Please try browsing the market again shortly." : "New products will appear here when they are added."}
          </p>
          {error && (
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Browse all products <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
