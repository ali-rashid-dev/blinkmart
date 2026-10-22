import { findCustomerProductBySlug } from "@/repositories/product.repository";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductPurchaseExperience } from "@/components/products/ProductPurchaseExperience";
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

        <div className="mt-6">
          <ProductPurchaseExperience product={customerProductData} />
        </div>
      </div>
    </main>
  );
}
