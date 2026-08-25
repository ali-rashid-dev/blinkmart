"use client";

import Link from "next/link";
import { Package, ShoppingBag, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNavbarCategories } from "./use-navbar-categories";

export function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { categories } = useNavbarCategories();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Hide the category dropdown on the products page
  if (pathname?.startsWith("/products")) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          open
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <Package className="size-4" />
        Categories
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full mt-2 z-50",
            "w-64 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
          )}
        >
          <div className="p-1.5 space-y-0.5">
            {categories.map(({ id, label, emoji, href }) => (
              <Link
                key={id}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span className="text-base shrink-0 select-none">{emoji}</span>
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-border p-1.5 sticky bottom-0 bg-popover">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <ShoppingBag className="size-4 shrink-0" />
              View All Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
