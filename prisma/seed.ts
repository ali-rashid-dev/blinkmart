import { PrismaClient } from "../src/generated/prisma/client";
import { Role, OrderStatus } from "../src/generated/prisma/enums";
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
    name: "Alice Admin",
    email: "admin@blinkmart.pk",
    emailVerified: true,
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-1",
    name: "Ahmed Khan",
    email: "ahmed@example.com.pk",
    emailVerified: true,
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-2",
    name: "Fatima Ali",
    email: "fatima@example.com.pk",
    emailVerified: true,
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categoryData = [
  { name: "🥦 Sabzi & Fresh Produce", slug: "sabzi-fresh-produce", sortOrder: 1, isActive: true },
  { name: "🥛 Dairy & Eggs", slug: "dairy-eggs", sortOrder: 2, isActive: true },
  { name: "🥖 Roti, Bread & Bakery", slug: "roti-bread-bakery", sortOrder: 3, isActive: true },
  { name: "🥩 Meat, Chicken & Fish", slug: "meat-chicken-fish", sortOrder: 4, isActive: true },
  { name: "🫙 Daal, Chawal & Pantry", slug: "daal-chawal-pantry", sortOrder: 5, isActive: true },
  { name: "🥤 Juices & Beverages", slug: "juices-beverages", sortOrder: 6, isActive: true },
  { name: "🍿 Snacks, Namkeen & Sweets", slug: "snacks-namkeen-sweets", sortOrder: 7, isActive: true },
  { name: "🧊 Frozen Foods", slug: "frozen-foods", sortOrder: 8, isActive: true },
  { name: "🧼 Household & Cleaning", slug: "household-cleaning", sortOrder: 9, isActive: true },
  { name: "💆 Personal Care & Beauty", slug: "personal-care-beauty", sortOrder: 10, isActive: true },
];

const brandData = [
  { name: "Green Valley Organic", origin: "Punjab, Pakistan", enabled: true },
  { name: "Haleeb Dairy", origin: "Punjab, Pakistan", enabled: true },
  { name: "Bakery Wala", origin: "Lahore, Pakistan", enabled: true },
  { name: "K&N’s", origin: "Karachi, Pakistan", enabled: true },
  { name: "Shan Foods", origin: "Karachi, Pakistan", enabled: true },
  { name: "National Foods", origin: "Karachi, Pakistan", enabled: true },
  { name: "Tapal", origin: "Karachi, Pakistan", enabled: true },
  { name: "Olper’s", origin: "Punjab, Pakistan", enabled: true },
  { name: "Nestlé Pakistan", origin: "Punjab, Pakistan", enabled: true },
];

export async function main() {
  console.log("Seeding database (Pakistan grocery)...");

  // Seed Users
  const seededUsers: Record<string, { id: string }> = {};
  for (const user of userData) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, name: user.name },
      create: user,
    });
    seededUsers[user.email] = record;
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
  console.log(`✓ ${categoryData.length} Categories seeded`);

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

  // Seed Sample Products (Pakistan-focused)
  const sampleProducts = [
    {
      name: "Desi Aloo (Potatoes) 1 kg",
      slug: "desi-aloo-1kg",
      description: "Fresh local potatoes, washed and packed.",
      price: 80,
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["sabzi-fresh-produce"],
      brandId: seededBrands["Green Valley Organic"],
    },
    {
      name: "Tamatar (Tomatoes) 1 kg",
      slug: "tamatar-1kg",
      description: "Ripe red tomatoes, ideal for curries and salads.",
      price: 60,
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["sabzi-fresh-produce"],
      brandId: seededBrands["Green Valley Organic"],
    },
    {
      name: "Haleeb Full Cream Milk 1 L",
      slug: "haleeb-full-cream-milk-1l",
      description: "UHT full cream milk, no added preservatives.",
      price: 210,
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["dairy-eggs"],
      brandId: seededBrands["Haleeb Dairy"],
    },
    {
      name: "Farm Fresh Eggs 12 pcs",
      slug: "farm-fresh-eggs-12pcs",
      description: "Grade A farm fresh eggs.",
      price: 360,
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["dairy-eggs"],
      brandId: seededBrands["Green Valley Organic"],
    },
    {
      name: "Tandoori Roti 4 pcs",
      slug: "tandoori-roti-4pcs",
      description: "Freshly baked tandoori rotis, soft and fluffy.",
      price: 100,
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["roti-bread-bakery"],
      brandId: seededBrands["Bakery Wala"],
    },
    {
      name: "Chicken Boneless 1 kg",
      slug: "chicken-boneless-1kg",
      description: "Fresh boneless chicken, cleaned and packed.",
      price: 720,
      imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["meat-chicken-fish"],
      brandId: seededBrands["K&N’s"],
    },
    {
      name: "Basmati Rice Super Kernel 1 kg",
      slug: "basmati-rice-super-kernel-1kg",
      description: "Premium long-grain basmati rice.",
      price: 260,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["daal-chawal-pantry"],
      brandId: seededBrands["Green Valley Organic"],
    },
    {
      name: "Masoor Daal (Red Lentils) 1 kg",
      slug: "masoor-daal-1kg",
      description: "Washed and polished red lentils.",
      price: 280,
      imageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["daal-chawal-pantry"],
      brandId: seededBrands["Green Valley Organic"],
    },
    {
      name: "Tapal Danedar Tea 190 g",
      slug: "tapal-danedar-tea-190g",
      description: "Strong, rich flavor Pakistani tea blend.",
      price: 295,
      imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8a69b?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["daal-chawal-pantry"],
      brandId: seededBrands["Tapal"],
    },
    {
      name: "Shan Biryani Masala 50 g",
      slug: "shan-biryani-masala-50g",
      description: "Classic Karachi-style biryani spice mix.",
      price: 70,
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["daal-chawal-pantry"],
      brandId: seededBrands["Shan Foods"],
    },
    {
      name: "National Chicken Karahi Mix 50 g",
      slug: "national-chicken-karahi-mix-50g",
      description: "Ready-to-cook chicken karahi spice mix.",
      price: 65,
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["daal-chawal-pantry"],
      brandId: seededBrands["National Foods"],
    },
    {
      name: "Olper’s Mango Drink 1 L",
      slug: "olpers-mango-drink-1l",
      description: "Real mango fruit drink, chilled and refreshing.",
      price: 190,
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["juices-beverages"],
      brandId: seededBrands["Olper’s"],
    },
    {
      name: "Lays Chips Classic Salted 40 g",
      slug: "lays-chips-classic-40g",
      description: "Crispy potato chips, lightly salted.",
      price: 50,
      imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["snacks-namkeen-sweets"],
      brandId: seededBrands["Nestlé Pakistan"],
    },
    {
      name: "Gulab Jamun 6 pcs",
      slug: "gulab-jamun-6pcs",
      description: "Soft, syrupy traditional Pakistani sweet.",
      price: 250,
      imageUrl: "https://images.unsplash.com/photo-1593701461250-d718b258c5f2?w=800&auto=format&fit=crop&q=80",
      enabled: true,
      categoryId: seededCategories["snacks-namkeen-sweets"],
      brandId: seededBrands["Bakery Wala"],
    },
  ];

  const seededProducts: Record<string, any> = {};
  for (const prod of sampleProducts) {
    const record = await prisma.product.upsert({
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
    seededProducts[prod.slug] = record;
  }
  console.log(`✓ ${sampleProducts.length} Sample Products seeded`);

  // Seed Sample Orders (Pakistan addresses & phone format)
  console.log("Seeding sample orders (Pakistan)...");
  const sampleOrders = [
      {
        code: "BM-PK-1001",
        userId: seededUsers["ahmed@example.com.pk"].id,
        status: OrderStatus.DELIVERED,
        subtotal: 1320,
        deliveryFee: 150,
        total: 1470,
        deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fullName: "Ahmed Khan",
        phone: "+92 300 1234567",
        house: "House 12, Street 5",
        street: "Gulberg III",
        area: "Gulberg",
        city: "Lahore",
        postal: "54000",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        items: [
          {
            productId: seededProducts["desi-aloo-1kg"].id,
            name: "Desi Aloo (Potatoes) 1 kg",
            price: 80,
            quantity: 5,
            unit: "1 kg",
          },
          {
            productId: seededProducts["chicken-boneless-1kg"].id,
            name: "Chicken Boneless 1 kg",
            price: 720,
            quantity: 1,
            unit: "1 kg",
          },
          {
            productId: seededProducts["tandoori-roti-4pcs"].id,
            name: "Tandoori Roti 4 pcs",
            price: 100,
            quantity: 2,
            unit: "4 pcs",
          },
        ],
      },
      {
        code: "BM-PK-1002",
        userId: seededUsers["fatima@example.com.pk"].id,
        status: OrderStatus.OUT_FOR_DELIVERY,
        subtotal: 1280,
        deliveryFee: 120,
        total: 1400,
        deliveryDate: new Date(),
        fullName: "Fatima Ali",
        phone: "+92 321 9876543",
        house: "Flat 3B, Al-Noor Apartments",
        street: "Blue Area",
        area: "Blue Area",
        city: "Islamabad",
        postal: "44000",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        items: [
          {
            productId: seededProducts["haleeb-full-cream-milk-1l"].id,
            name: "Haleeb Full Cream Milk 1 L",
            price: 210,
            quantity: 3,
            unit: "1 L",
          },
          {
            productId: seededProducts["basmati-rice-super-kernel-1kg"].id,
            name: "Basmati Rice Super Kernel 1 kg",
            price: 260,
            quantity: 1,
            unit: "1 kg",
          },
          {
            productId: seededProducts["shan-biryani-masala-50g"].id,
            name: "Shan Biryani Masala 50 g",
            price: 70,
            quantity: 2,
            unit: "50 g",
          },
          {
            productId: seededProducts["gulab-jamun-6pcs"].id,
            name: "Gulab Jamun 6 pcs",
            price: 250,
            quantity: 1,
            unit: "6 pcs",
          },
        ],
      },
      {
        code: "BM-PK-1003",
        userId: seededUsers["ahmed@example.com.pk"].id,
        status: OrderStatus.PLACED,
        subtotal: 1030,
        deliveryFee: 130,
        total: 1160,
        deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        fullName: "Ahmed Khan",
        phone: "+92 300 1234567",
        house: "House 12, Street 5",
        street: "Gulberg III",
        area: "Gulberg",
        city: "Lahore",
        postal: "54000",
        createdAt: new Date(),
        items: [
          {
            productId: seededProducts["tamatar-1kg"].id,
            name: "Tamatar (Tomatoes) 1 kg",
            price: 60,
            quantity: 3,
            unit: "1 kg",
          },
          {
            productId: seededProducts["farm-fresh-eggs-12pcs"].id,
            name: "Farm Fresh Eggs 12 pcs",
            price: 360,
            quantity: 1,
            unit: "12 pcs",
          },
          {
            productId: seededProducts["tapal-danedar-tea-190g"].id,
            name: "Tapal Danedar Tea 190 g",
            price: 295,
            quantity: 1,
            unit: "190 g",
          },
          {
            productId: seededProducts["national-chicken-karahi-mix-50g"].id,
            name: "National Chicken Karahi Mix 50 g",
            price: 65,
            quantity: 3,
            unit: "50 g",
          },
        ],
      },
  ];

  for (const order of sampleOrders) {
    const { items, ...orderData } = order;
    await prisma.order.upsert({
      where: { code: order.code },
      update: orderData,
      create: {
        ...orderData,
        items: {
          create: items,
        },
      },
    });
  }
  console.log(`✓ ${sampleOrders.length} Sample Orders seeded`);

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