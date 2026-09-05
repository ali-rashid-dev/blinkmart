import type { Metadata } from "next";
import { HomeLayout } from "@/components/home/HomeLayout";
import { listCustomerCategories } from "@/repositories/category.repository";
import { listCustomerProducts, findCustomerProductById } from "@/repositories/product.repository";
import { toCustomerProduct } from "@/components/products/data";
import { getHomePageSettings } from "@/lib/home/home-config";

export const metadata: Metadata = {
  title: "Kit&Co — Weekly & Monthly Grocery Delivery (7–10 PM Slot)",
  description:
    "Shop handpicked fruit, vegetables, weekly dairy boxes, and monthly bulk pantry stock-ups with guaranteed evening delivery (7:00 PM – 10:00 PM) and same-day 5:00 PM cutoff.",
  openGraph: {
    title: "Kit&Co — Weekly & Monthly Grocery Delivery (7–10 PM Slot)",
    description:
      "Weekly fresh produce boxes and monthly pantry stock-ups delivered in our guaranteed evening slot.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let dbCategories: Awaited<ReturnType<typeof listCustomerCategories>> = [];
  let dbProducts: Awaited<ReturnType<typeof listCustomerProducts>> = [];
  let dealProduct: ReturnType<typeof toCustomerProduct> | null = null;

  try {
    dbCategories = await listCustomerCategories({});
  } catch (error) {
    console.error("Error loading categories for home page:", error);
  }

  try {
    dbProducts = await listCustomerProducts({ take: 30 });
  } catch (error) {
    console.error("Error loading products for home page:", error);
  }

  // Resolve deal product server-side by ID from settings
  try {
    const settings = getHomePageSettings();
    if (settings.dealProductId) {
      const dealProductDb = await findCustomerProductById(settings.dealProductId);
      if (dealProductDb) {
        dealProduct = toCustomerProduct(dealProductDb);
      }
    }
  } catch (error) {
    console.error("Error loading deal product for home page:", error);
  }

  const allCustomerProducts = dbProducts.map(toCustomerProduct);

  const bestSellers = allCustomerProducts.slice(0, 10);
  let freshArrivals = allCustomerProducts.slice(10, 20);
  if (freshArrivals.length < 10 && allCustomerProducts.length > 0) {
    const remainingNeeded = 10 - freshArrivals.length;
    const padding = allCustomerProducts.slice(0, remainingNeeded);
    freshArrivals = [...freshArrivals, ...padding].slice(0, 10);
  }

  const settings = getHomePageSettings();

  return (
    <>
      <h1 className="sr-only">Kit&Co — Weekly &amp; Monthly Grocery Delivery</h1>
      <HomeLayout
        categories={dbCategories}
        products={allCustomerProducts}
        bestSellers={bestSellers}
        freshArrivals={freshArrivals}
        dealProduct={dealProduct}
        dealCompareAtPrice={settings.dealCompareAtPrice ?? null}
      />
    </>
  );
}
