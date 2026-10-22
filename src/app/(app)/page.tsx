import type { Metadata } from "next";
import { HomeLayout } from "@/components/home/HomeLayout";
import { listCustomerCategories } from "@/repositories/category.repository";
import { listCustomerProducts } from "@/repositories/product.repository";
import { toCustomerProduct } from "@/components/products/data";

export const metadata: Metadata = {
  title: "kitcomart — Weekly & Monthly Grocery Delivery (7–10 PM Slot)",
  description:
    "Shop flour, grains, pulses, cooking oils, spices, tea, and monthly bulk pantry stock-ups with guaranteed evening delivery (7:00 PM – 10:00 PM) and same-day 5:00 PM cutoff.",
  openGraph: {
    title: "kitcomart — Weekly & Monthly Grocery Delivery (7–10 PM Slot)",
    description:
      "Weekly staple essentials and monthly pantry stock-ups delivered in our guaranteed evening slot.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let dbCategories: Awaited<ReturnType<typeof listCustomerCategories>> = [];
  let dbProducts: Awaited<ReturnType<typeof listCustomerProducts>> = [];
  let productsFailedToLoad = false;

  try {
    dbCategories = await listCustomerCategories({});
  } catch (error) {
    console.error("Error loading categories for home page:", error);
  }

  try {
    dbProducts = await listCustomerProducts({ take: 30 });
  } catch (error) {
    console.error("Error loading products for home page:", error);
    productsFailedToLoad = true;
  }

  const allCustomerProducts = dbProducts.map(toCustomerProduct);
  const recentProducts = allCustomerProducts.slice(0, 10);
  const moreProducts = allCustomerProducts.slice(10, 20);

  return (
    <>
      <h1 className="sr-only">kitcomart — Weekly &amp; Monthly Grocery Delivery</h1>
      <HomeLayout
        categories={dbCategories}
        products={allCustomerProducts}
        recentProducts={recentProducts}
        moreProducts={moreProducts}
        productsFailedToLoad={productsFailedToLoad}
        dealProduct={null}
        dealCompareAtPrice={null}
      />
    </>
  );
}
