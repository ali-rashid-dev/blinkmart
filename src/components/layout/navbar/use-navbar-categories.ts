"use client";

import { useEffect, useState } from "react";
import { parseCategoryEmoji } from "@/components/products/filters";
import { getNavbarCategoriesAction } from "./actions";

export type NavbarCategoryItem = {
  id: string;
  label: string;
  emoji: string;
  href: string;
  slug: string;
};

// Fallback category items used during SSR or before initial DB fetch completes
const FALLBACK_CATEGORIES: NavbarCategoryItem[] = [
  { id: "1", label: "Fresh Produce",       emoji: "🥦", href: "/products?category=sabzi-fresh-produce", slug: "sabzi-fresh-produce" },
  { id: "2", label: "Dairy & Eggs",        emoji: "🥛", href: "/products?category=dairy-eggs",          slug: "dairy-eggs" },
  { id: "3", label: "Roti & Bakery",       emoji: "🥖", href: "/products?category=roti-bread-bakery",   slug: "roti-bread-bakery" },
  { id: "4", label: "Meat & Fish",         emoji: "🥩", href: "/products?category=meat-chicken-fish",   slug: "meat-chicken-fish" },
  { id: "5", label: "Daal & Pantry",       emoji: "🫙", href: "/products?category=daal-chawal-pantry",   slug: "daal-chawal-pantry" },
  { id: "6", label: "Juices & Beverages",  emoji: "🥤", href: "/products?category=juices-beverages",    slug: "juices-beverages" },
  { id: "7", label: "Snacks & Sweets",     emoji: "🍿", href: "/products?category=snacks-namkeen-sweets", slug: "snacks-namkeen-sweets" },
  { id: "8", label: "Frozen Foods",        emoji: "🧊", href: "/products?category=frozen-foods",        slug: "frozen-foods" },
];

export function useNavbarCategories() {
  const [categories, setCategories] = useState<NavbarCategoryItem[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getNavbarCategoriesAction()
      .then((items) => {
        if (!isMounted) return;
        if (items && items.length > 0) {
          const parsed: NavbarCategoryItem[] = items.map((c) => {
            const { emoji, label } = parseCategoryEmoji(c.name, c.slug);
            return {
              id: c.id,
              label: label || c.name,
              emoji: emoji || "🛒",
              href: `/products?category=${encodeURIComponent(c.slug)}`,
              slug: c.slug,
            };
          });
          setCategories(parsed);
        }
      })
      .catch((err) => {
        console.error("Failed to load real categories:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading };
}
