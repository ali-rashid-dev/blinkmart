"use server";

import { listCustomerCategories } from "@/repositories/category.repository";

export async function getNavbarCategoriesAction() {
  try {
    const dbCategories = await listCustomerCategories({});
    return dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      emoji: c.emoji,
      imageUrl: c.imageUrl,
    }));
  } catch (error) {
    console.error("Failed to load real categories from database:", error);
    return [];
  }
}
