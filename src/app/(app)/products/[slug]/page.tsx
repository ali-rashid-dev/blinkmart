import { findCustomerProductBySlug } from "@/repositories/product.repository";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";
import { ProductGallery } from "@/components/products/ProductGallery";
import { PurchasePanel } from "@/components/products/PurchasePanel";
import { toCustomerProduct } from "@/components/products/data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findCustomerProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categoryName = product.category?.name || "Groceries";
  const brandName = product.brand?.name || "BlinkMart";
  const price = Number(product.price);
  const formattedPrice = `Rs ${Math.round(price)}`;

  const customerProductData = toCustomerProduct(product);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-accent/60 blur-3xl animate-soft-float"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-8 lg:pt-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="size-3" />
          <span>{categoryName}</span>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery product={customerProductData} />

          <div className="animate-rise min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {brandName} · {categoryName}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className="font-display text-4xl text-foreground">
                {formattedPrice}
              </span>
              <span className="pb-1.5 text-sm text-muted-foreground">/ item</span>
            </div>

            <div className="mt-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <span aria-hidden="true" className="size-2 rounded-full bg-current" />
                {product.enabled ? "In Stock" : "Unavailable"}
              </p>
            </div>

            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {product.description || "High quality grocery product."}
            </p>

            
            <PurchasePanel product={customerProductData} />

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-3">
              <Truck className="mt-0.5 size-4 shrink-0 text-secondary" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Same-day delivery</span> on
                orders before 4pm in selected areas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
