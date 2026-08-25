import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/home/SectionHeader";

const shopByNeedItems = [
  {
    emoji: "🥗",
    title: "Quick Salads & Greens",
    text: "Crisp vegetables, tomatoes, and organic produce.",
    slug: "sabzi-fresh-produce",
  },
  {
    emoji: "🍳",
    title: "Breakfast & Dairy",
    text: "Fresh milk, farm eggs, bread, and morning essentials.",
    slug: "dairy-eggs",
  },
  {
    emoji: "🍛",
    title: "Dinner & Cooking",
    text: "Basmati rice, lentils, chicken, and authentic spices.",
    slug: "daal-chawal-pantry",
  },
  {
    emoji: "🍿",
    title: "Snacks & Refreshments",
    text: "Crisp namkeen, juices, tea, and sweet treats.",
    slug: "snacks-namkeen-sweets",
  },
];

export function ShopByNeed() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeader
        title="Shop by Need"
        subtitle="Find groceries by the way you actually cook and eat."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shopByNeedItems.map((n) => (
          <article
            key={n.title}
            className="group flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <div className="grid aspect-[5/3] place-items-center overflow-hidden rounded-2xl bg-accent/70 text-5xl">
              <span
                aria-hidden="true"
                className="transition-transform duration-500 group-hover:scale-110"
              >
                {n.emoji}
              </span>
            </div>
            <h3 className="font-display text-lg text-foreground">{n.title}</h3>
            <p className="text-sm text-muted-foreground">{n.text}</p>
            <Link
              href={`/products?category=${encodeURIComponent(n.slug)}`}
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Explore
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

