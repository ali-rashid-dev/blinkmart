"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import type { CustomerProduct } from "./data";
import { getSupportedImageSrc } from "@/lib/image";

interface ProductGalleryProps {
  product: CustomerProduct;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  // The Prisma schema has a single imageUrl field — no image array on the DB model.
  // We keep an array here so that if extra images are ever added via an extension, the
  // gallery naturally supports them without a code change.
  const images: string[] = product.imageUrl ? [product.imageUrl] : [];

  const soldOut = !product.enabled;
  const currentImage = images[active] ?? null;

  return (
    <div className="space-y-3">
      {/* ── Main image slot ─────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-accent/60 grid place-items-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--color-card),transparent_70%)]"
        />

        {currentImage && getSupportedImageSrc(currentImage) && !failedImages.has(currentImage) ? (
          <Image
            key={active}
            src={getSupportedImageSrc(currentImage)!}
            alt={product.name}
            fill
            className={cn(
              "object-cover object-center transition-all duration-300",
              soldOut && "opacity-45 saturate-0"
            )}
            onError={() => setFailedImages((failed) => new Set(failed).add(currentImage))}
          />
        ) : (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 text-muted-foreground/60",
              soldOut && "opacity-45 saturate-0"
            )}
          >
            <ImageIcon className="h-20 w-20" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-background">
            Unavailable
          </span>
        )}
      </div>

      {/* ── Thumbnail strip — shown only when multiple images exist ── */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${product.name}`}
              aria-pressed={i === active}
              className={cn(
                "relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-accent/50 transition-all sm:size-20",
                i === active
                  ? "border-primary ring-2 ring-primary/20 shadow-[var(--shadow-soft)]"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              {getSupportedImageSrc(img) && !failedImages.has(img) ? (
                <Image
                  src={getSupportedImageSrc(img)!}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover object-center"
                  onError={() => setFailedImages((failed) => new Set(failed).add(img))}
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
