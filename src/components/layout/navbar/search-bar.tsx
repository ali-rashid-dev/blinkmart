"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const pathname = usePathname();

  // Hide the navbar search bar when on the products page
  if (pathname?.startsWith("/products")) {
    return null;
  }

  return (
    <Link
      href="/products"
      className={cn(
        "relative flex h-10 w-full items-center gap-3 rounded-xl border border-border bg-background px-3.5 text-sm text-muted-foreground transition-all hover:border-border/80 hover:text-foreground",
        className
      )}
      aria-label="Search products"
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">Search groceries, brands…</span>
    </Link>
  );
}
