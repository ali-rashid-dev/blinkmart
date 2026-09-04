"use client";

import { useEffect, useState } from "react";
import { getNavbarCategoriesAction } from "./actions";

export type NavbarCategoryItem = {
  id: string;
  label: string;
  emoji: string;
  href: string;
  slug: string;
};

export function useNavbarCategories() {
  const [categories, setCategories] = useState<NavbarCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getNavbarCategoriesAction()
      .then((items) => {
        if (!isMounted) return;
        if (items !== null && items !== undefined) {
          const parsed: NavbarCategoryItem[] = items.map((c) => ({
            id: c.id,
            label: c.name,
            emoji: c.emoji || "🛒",
            href: `/products?category=${encodeURIComponent(c.slug)}`,
            slug: c.slug,
          }));
          setCategories(parsed);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories from database:", err);
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
