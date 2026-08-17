import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData = [
  {
    id: "admin-1",
    name: "Alice",
    email: "alice@prisma.io",
    emailVerified: true,
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-1",
    name: "Bob",
    email: "bob@prisma.io",
    emailVerified: true,
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categoryData = [
  { name: "🥦 Fresh Produce", slug: "fresh-produce", sortOrder: 1, isActive: true },
  { name: "🥛 Dairy & Eggs", slug: "dairy-eggs", sortOrder: 2, isActive: true },
  { name: "🥖 Bakery & Bread", slug: "bakery-bread", sortOrder: 3, isActive: true },
  { name: "🥩 Meat & Seafood", slug: "meat-seafood", sortOrder: 4, isActive: true },
  { name: "🥫 Pantry Staples", slug: "pantry-staples", sortOrder: 5, isActive: true },
  { name: "🥤 Beverages", slug: "beverages", sortOrder: 6, isActive: true },
  { name: "🍿 Snacks & Sweets", slug: "snacks-sweets", sortOrder: 7, isActive: true },
  { name: "🧊 Frozen Foods", slug: "frozen-foods", sortOrder: 8, isActive: true },
  { name: "🧼 Household & Cleaning", slug: "household-cleaning", sortOrder: 9, isActive: true },
  { name: "💆 Personal Care", slug: "personal-care", sortOrder: 10, isActive: true },
];

const brandData = [
  { name: "Verdant Organic", origin: "California, USA", enabled: true },
  { name: "FarmFresh Dairy", origin: "Vermont, USA", enabled: true },
  { name: "Artisan Bakehouse", origin: "Oregon, USA", enabled: true },
  { name: "OceanDelight", origin: "Alaska, USA", enabled: true },
  { name: "PureHarvest Pantry", origin: "Italy", enabled: true },
];

export async function main() {
  console.log("Seeding database...");

  // Seed Users
  for (const user of userData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, name: user.name },
      create: user,
    });
  }
  console.log("✓ Users seeded");

  // Seed Categories
  const seededCategories: Record<string, string> = {};
  for (const cat of categoryData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: cat,
    });
    seededCategories[cat.slug] = record.id;
  }
  console.log(`✓ ${categoryData.length} Categories seeded with emojis & names`);

  // Seed Brands
  const seededBrands: Record<string, string> = {};
  for (const b of brandData) {
    const record = await prisma.brand.upsert({
      where: { name: b.name },
      update: { origin: b.origin, enabled: b.enabled },
      create: b,
    });
    seededBrands[b.name] = record.id;
  }
  console.log(`✓ ${brandData.length} Brands seeded`);

  // Seed Sample Products
  const sampleProducts = [
    {
      name: "Organic Hass Avocados (4 Pack)",
      slug: "organic-hass-avocados",
      description: "Rich, creamy, handpicked organic avocados grown sustainably.",
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["fresh-produce"],
      brandId: seededBrands["Verdant Organic"],
    },
    {
      name: "Fresh Organic Strawberries 1lb",
      slug: "fresh-organic-strawberries",
      description: "Sweet, juicy organic strawberries packed fresh daily.",
      price: 399,
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["fresh-produce"],
      brandId: seededBrands["Verdant Organic"],
    },
    {
      name: "Whole Pasture-Raised Milk 1 Gal",
      slug: "whole-pasture-raised-milk",
      description: "Non-GMO pasture-raised whole milk with cream top.",
      price: 549,
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["dairy-eggs"],
      brandId: seededBrands["FarmFresh Dairy"],
    },
    {
      name: "Organic Free-Range Large Brown Eggs 12ct",
      slug: "organic-free-range-eggs",
      description: "Grade A organic free-range eggs rich in omega-3.",
      price: 429,
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["dairy-eggs"],
      brandId: seededBrands["FarmFresh Dairy"],
    },
    {
      name: "Artisanal Sourdough Bread Loaf",
      slug: "artisanal-sourdough-bread",
      description: "Traditional slow-fermented sourdough baked crispy and fresh.",
      price: 375,
      imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["bakery-bread"],
      brandId: seededBrands["Artisan Bakehouse"],
    },
    {
      name: "Wild-Caught Alaska Salmon Fillet 1lb",
      slug: "wild-caught-alaska-salmon",
      description: "Sustainably caught wild king salmon, skin-on.",
      price: 1299,
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["meat-seafood"],
      brandId: seededBrands["OceanDelight"],
    },
    {
      name: "Extra Virgin Cold Pressed Olive Oil 500ml",
      slug: "extra-virgin-olive-oil",
      description: "First cold pressed single-origin Italian extra virgin olive oil.",
      price: 899,
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["pantry-staples"],
      brandId: seededBrands["PureHarvest Pantry"],
    },
    {
      name: "Cold Pressed Orange Juice 1L",
      slug: "cold-pressed-orange-juice",
      description: "100% pure cold pressed Valencia orange juice, no added sugar.",
      price: 449,
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["beverages"],
      brandId: seededBrands["Verdant Organic"],
    },
    {
      name: "Organic Dark Chocolate Almonds 200g",
      slug: "organic-dark-chocolate-almonds",
      description: "Roasted almonds coated in 70% fair-trade dark chocolate.",
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["snacks-sweets"],
      brandId: seededBrands["PureHarvest Pantry"],
    },
  ];

  for (const prod of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        imageUrl: prod.imageUrl,
        enabled: prod.enabled,
        categoryId: prod.categoryId,
        brandId: prod.brandId,
      },
      create: prod,
    });
  }
  console.log(`✓ ${sampleProducts.length} Sample Products seeded`);
  console.log("Seeding completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });