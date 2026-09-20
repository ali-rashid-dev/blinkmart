import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const categoryData = [
  {
    name: "Flour & Grains",
    slug: "flour-grains",
    emoji: "🌾",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Pulses & Lentils",
    slug: "pulses-lentils",
    emoji: "🫘",
    imageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800&auto=format&fit=crop&q=80",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Cooking Oils & Ghee",
    slug: "cooking-oils-ghee",
    emoji: "🫗",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "Spices & Seasonings",
    slug: "spices-seasonings",
    emoji: "🌶️",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "Tea, Coffee & Beverages",
    slug: "tea-coffee-beverages",
    emoji: "☕",
    imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8a69b?w=800&auto=format&fit=crop&q=80",
    sortOrder: 5,
    isActive: true,
  },
  {
    name: "Sugar & Sweeteners",
    slug: "sugar-sweeteners",
    emoji: "🍯",
    imageUrl: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&auto=format&fit=crop&q=80",
    sortOrder: 6,
    isActive: true,
  },
  {
    name: "Breakfast & Cereals",
    slug: "breakfast-cereals",
    emoji: "🥣",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
    sortOrder: 7,
    isActive: true,
  },
  {
    name: "Biscuits & Snacks",
    slug: "biscuits-snacks",
    emoji: "🍪",
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80",
    sortOrder: 8,
    isActive: true,
  },
  {
    name: "Milk & Dairy",
    slug: "milk-dairy",
    emoji: "🥛",
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=80",
    sortOrder: 9,
    isActive: true,
  },
  {
    name: "Sauces & Condiments",
    slug: "sauces-condiments",
    emoji: "🥫",
    imageUrl: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800&auto=format&fit=crop&q=80",
    sortOrder: 10,
    isActive: true,
  },
  {
    name: "Canned & Packaged Foods",
    slug: "canned-packaged-foods",
    emoji: "📦",
    imageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=80",
    sortOrder: 11,
    isActive: true,
  },
  {
    name: "Noodles, Pasta & Vermicelli",
    slug: "noodles-pasta-vermicelli",
    emoji: "🍜",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?w=800&auto=format&fit=crop&q=80",
    sortOrder: 12,
    isActive: true,
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    emoji: "🧴",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    sortOrder: 13,
    isActive: true,
  },
  {
    name: "Home Cleaning",
    slug: "home-cleaning",
    emoji: "🧹",
    imageUrl: "https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=800&auto=format&fit=crop&q=80",
    sortOrder: 14,
    isActive: true,
  },
  {
    name: "Paper & Household Essentials",
    slug: "paper-household-essentials",
    emoji: "🧻",
    imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=800&auto=format&fit=crop&q=80",
    sortOrder: 15,
    isActive: true,
  },
  {
    name: "Baby & Family Care",
    slug: "baby-family-care",
    emoji: "👶",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80",
    sortOrder: 16,
    isActive: true,
  },
];

export async function main() {
  console.log("Seeding categories with Unsplash images & emojis...");

  const legacyCategorySlugs = [
    "sabzi-fresh-produce",
    "dairy-eggs",
    "roti-bread-bakery",
    "meat-chicken-fish",
    "daal-chawal-pantry",
    "juices-beverages",
    "snacks-namkeen-sweets",
    "frozen-foods",
    "household-cleaning",
    "personal-care-beauty",
  ];

  await prisma.category.updateMany({
    where: { slug: { in: legacyCategorySlugs } },
    data: { isActive: false },
  });

  for (const cat of categoryData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        emoji: cat.emoji,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: cat,
    });
    console.log(`✓ Category seeded: ${record.name}`);
  }
  console.log(`✓ All ${categoryData.length} categories seeded successfully!`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });