import { getEnabledBrands } from "@/services/brand.service";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brands — BlinkMart",
  description: "Browse featured brands and artisanal producers available on BlinkMart.",
};

export const dynamic = "force-dynamic";

export default async function CustomerBrandsPage() {
  let brands: Awaited<ReturnType<typeof getEnabledBrands>> = [];
  let loadError: string | null = null;
  try {
    brands = await getEnabledBrands();
  } catch (error) {
    console.error("Error loading brands from backend DB:", error);
    loadError = error instanceof Error ? error.message : "Failed to load brands";
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Our Brands
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover high-quality products from top producers and makers.
        </p>
      </div>

      {loadError ? (
        <div className="paper-card rounded-xl border border-destructive/30 p-8 py-16 text-center" role="alert">
          <Store className="mx-auto mb-3 h-10 w-10 text-destructive/70" />
          <h3 className="font-serif text-lg font-medium text-foreground">Unable to load brands</h3>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <a className="mt-4 inline-block text-sm font-medium text-primary underline" href="/brand">
            Try again
          </a>
        </div>
      ) : brands.length === 0 ? (
        <div className="paper-card py-16 text-center rounded-xl border border-border p-8">
          <Store className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="font-serif text-lg font-medium text-foreground">No brands available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for newly added brands and products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => {
            const productCount = brand._count?.products ?? 0;

            return (
              <div
                key={brand.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 font-serif text-2xl font-semibold text-primary transition-transform group-hover:scale-105">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {brand.name}
                    </h2>

                    {brand.origin && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{brand.origin}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-xs font-normal">
                        <Package className="mr-1 h-3 w-3" />
                        {productCount} {productCount === 1 ? "Product" : "Products"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
