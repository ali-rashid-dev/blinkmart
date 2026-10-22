"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminProductAction, toggleProductStatusAction, type SerializedProduct } from "../actions";
import { formatCurrency } from "@/lib/currency";
import { getSupportedImageSrc } from "@/lib/image";

export default function ProductDetailsPage({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<SerializedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getAdminProductAction(productId)
      .then((result) => {
        if (!active) return;
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        setProduct(result.data);
      })
      .catch((error: unknown) => {
        console.error("Failed to load product details:", error);
        toast.error("Failed to load product details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  function toggleStatus() {
    if (!product) return;
    startTransition(async () => {
      const result = await toggleProductStatusAction(product.id, !product.enabled);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setProduct(result.data);
      toast.success(result.data.enabled ? "Product enabled." : "Product disabled.");
    });
  }

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading product...</div>;
  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product not found" description="This product may have been removed." />
        <Button variant="outline" onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="mr-2 size-4" /> Back to Products
        </Button>
      </div>
    );
  }

  const imageSrc = getSupportedImageSrc(product.imageUrl);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={product.name}
        description="Product catalog details and purchase options."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/products")}>
              <ArrowLeft className="mr-2 size-4" /> Products
            </Button>
            <Button onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
              <Pencil className="mr-2 size-4" /> Edit Product
            </Button>
          </div>
        }
      />

      <section className="grid gap-6 rounded-xl border border-border bg-card p-5 md:grid-cols-[240px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {imageSrc ? (
            <Image src={imageSrc} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center"><ImageIcon className="size-12 text-muted-foreground" /></div>
          )}
        </div>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={product.enabled ? "default" : "secondary"}>{product.enabled ? "Active" : "Inactive"}</Badge>
            <Badge variant="outline">{product.variantsEnabled ? "Product with variants" : "Simple product"}</Badge>
            <span className="font-mono text-sm text-muted-foreground">{product.slug}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Price" value={formatCurrency(product.salePrice ?? product.price)} />
            {product.salePrice !== null && <Info label="Regular price" value={formatCurrency(product.price)} />}
            <Info label="Category" value={product.category?.name ?? "Uncategorized"} />
            <Info label="Brand" value={product.brand?.name ?? "Generic"} />
          </div>
          <div>
            <h2 className="mb-1 text-sm font-semibold text-muted-foreground">Description</h2>
            <p className="whitespace-pre-wrap text-sm">{product.description || "No product description provided."}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Created {new Date(product.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
            <Button variant="outline" disabled={isPending} onClick={toggleStatus}>
              {product.enabled ? "Disable Product" : "Enable Product"}
            </Button>
          </div>
        </div>
      </section>

      {product.variantsEnabled && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Variants</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Options</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="py-3 pr-4 font-mono">{variant.sku}</td>
                    <td className="py-3 pr-4">{Object.entries(variant.attributes).map(([key, value]) => `${key}: ${value}`).join(" · ")}</td>
                    <td className="py-3 pr-4">{formatCurrency(variant.salePrice ?? variant.price)}</td>
                    <td className="py-3 pr-4">{variant.stockQuantity}</td>
                    <td className="py-3">{variant.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-muted-foreground">{label}</h2>
      <p className="text-sm">{value}</p>
    </div>
  );
}
