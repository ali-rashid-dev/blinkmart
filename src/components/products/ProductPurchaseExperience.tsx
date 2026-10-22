"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { ProductGallery } from "@/components/products/ProductGallery";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { QuantitySelector } from "@/components/products/QuantitySelector";
import { cartStore, useCartState } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/currency";
import type { CustomerProduct, CustomerProductVariant } from "@/components/products/data";

function getMatchingVariants(
  variants: CustomerProductVariant[],
  selection: Record<string, string>,
  exceptKey?: string
) {
  return variants.filter((variant) =>
    Object.entries(selection).every(([key, value]) => key === exceptKey || variant.attributes[key] === value)
  );
}

export function ProductPurchaseExperience({ product }: { product: CustomerProduct }) {
  const { lines } = useCartState();
  const availableVariants = product.variantsEnabled
    ? product.variants.filter((variant) => variant.isActive)
    : [];
  const attributeNames = [...new Set(availableVariants.flatMap((variant) => Object.keys(variant.attributes)))];
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const first = availableVariants.find((variant) => variant.stockQuantity > 0) ?? availableVariants[0];
    return first?.attributes ?? {};
  });
  const selected = availableVariants.find((variant) =>
    attributeNames.every((name) => selection[name] === undefined || variant.attributes[name] === selection[name])
  );
  const selectedVariant = selected ?? availableVariants.find((variant) => variant.stockQuantity > 0) ?? availableVariants[0];
  const variantId = product.variantsEnabled ? selectedVariant?.id : undefined;
  const cartLine = lines.find((line) => line.productId === product.id && line.variantId === (variantId ?? null));
  const inCart = cartLine?.quantity ?? 0;
  const [quantity, setQuantity] = useState(1);
  const price = selectedVariant?.price ?? product.price;
  const effectivePrice = selectedVariant?.effectivePrice ?? product.effectivePrice;
  const soldOut = !product.enabled || (product.variantsEnabled && (!selectedVariant || selectedVariant.stockQuantity < 1));
  const purchaseQuantity = Math.min(quantity, selectedVariant?.stockQuantity ?? 99, 99);

  function selectAttribute(key: string, value: string) {
    const nextSelection = { ...selection, [key]: value };
    const matches = getMatchingVariants(availableVariants, nextSelection);
    if (matches.length) {
      const inStock = matches.find((variant) => variant.stockQuantity > 0);
      setSelection(inStock?.attributes ?? matches[0]!.attributes);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductGallery
        product={{
          ...product,
          imageUrl: selectedVariant?.imageUrl || product.imageUrl,
          enabled: !soldOut,
        }}
      />
      <div className="animate-rise min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {product.brandName || "kitcomart"} · {product.categoryName || "Groceries"}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">{product.name}</h1>

        {product.variantsEnabled && attributeNames.map((name) => {
          const options = [...new Set(availableVariants.map((variant) => variant.attributes[name]).filter(Boolean))];
          return (
            <fieldset key={name} className="mt-5">
              <legend className="mb-2 text-sm font-semibold capitalize text-foreground">
                {name.replace(/([A-Z])/g, " $1")}
                {selection[name] && <span className="ml-1 font-normal text-muted-foreground">· {selection[name]}</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {options.map((value) => {
                  const matches = getMatchingVariants(availableVariants, selection, name)
                    .filter((variant) => variant.attributes[name] === value);
                  const disabled = matches.length === 0 || matches.every((variant) => variant.stockQuantity < 1);
                  const active = selection[name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      aria-pressed={active}
                      onClick={() => selectAttribute(name, value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"} disabled:cursor-not-allowed disabled:opacity-45`}
                    >
                      {value}{disabled && <span className="ml-1 text-xs">· Out of stock</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div aria-live="polite" aria-atomic="true" className="mt-5 flex flex-wrap items-end gap-3">
          <span className="font-display text-4xl text-foreground">{formatCurrency(effectivePrice)}</span>
          {effectivePrice < price && <span className="pb-1 text-lg text-muted-foreground line-through">{formatCurrency(price)}</span>}
          {price > effectivePrice && <span className="mb-1 rounded-lg bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive">SALE</span>}
        </div>
        <p aria-live="polite" className={`mt-3 text-sm font-semibold ${soldOut ? "text-destructive" : "text-success-text"}`}>
          <span aria-hidden="true" className="mr-2 inline-block size-2 rounded-full bg-current" />
          {soldOut ? "Out of stock" : selectedVariant ? `${selectedVariant.stockQuantity} available` : "In stock"}
        </p>
        {selectedVariant && (
          <p className="mt-1 text-xs text-muted-foreground">
            SKU: <span className="font-mono">{selectedVariant.sku}</span>
            {Object.entries(selectedVariant.attributes).map(([key, value]) => ` · ${key}: ${value}`).join("")}
          </p>
        )}
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {product.description || "High quality grocery product."}
        </p>

        <div className="mt-6 rounded-3xl border border-border bg-card p-4">
          {inCart > 0 && !soldOut ? (
            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector
                value={inCart}
                onChange={(next) => void cartStore.updateQuantity(product.id, next, variantId)}
                max={selectedVariant?.stockQuantity ?? 99}
                label={product.name}
              />
              <p className="text-sm font-semibold text-success-text">In your basket</p>
              <Link href="/cart" className="ml-auto text-sm font-semibold text-primary underline-offset-4 hover:underline">View cart</Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector value={purchaseQuantity} onChange={setQuantity} disabled={soldOut} max={selectedVariant?.stockQuantity ?? 99} label={product.name} />
              <div className="flex min-w-[12rem] flex-1">
                <AddToCartButton
                  label={product.name}
                  disabled={soldOut}
                  size="lg"
                  productId={product.id}
                  variantId={variantId}
                  quantity={purchaseQuantity}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-3">
          <Clock3 className="mt-0.5 size-4 shrink-0 text-secondary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">New orders are delivered within 24 hours</span> of placement.
          </p>
        </div>
      </div>
    </div>
  );
}
