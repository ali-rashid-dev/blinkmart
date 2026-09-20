"use client";

import {
  Flame,
  Layout,
  Moon,
  Sliders,
  Package,
  Power,
} from "lucide-react";

interface HomePageSettings {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImageUrl: string;
  deliverySlotLabel: string;
  cutoffHour: number;
  freeDeliveryThreshold: number;
  showDealOfTheDay: boolean;
  dealBadgeText: string;
  dealProductId?: string | null;
  dealCompareAtPrice?: number | null;
  weeklyPromoTitle: string;
  weeklyPromoSubtitle: string;
  monthlyPromoTitle: string;
  monthlyPromoSubtitle: string;
}

const DEFAULT_SETTINGS: HomePageSettings = {
  heroTitle: "Quality packaged groceries,",
  heroHighlight: "delivered tonight.",
  heroSubtitle: "Flour, pulses, cooking oils, spices, tea, snacks, and daily household essentials — delivered in our guaranteed evening slot.",
  heroCtaText: "Explore Market",
  heroCtaLink: "/products",
  heroImageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80",
  deliverySlotLabel: "7:00 PM – 10:00 PM",
  cutoffHour: 17,
  freeDeliveryThreshold: 3000,
  showDealOfTheDay: true,
  dealBadgeText: "20% OFF Daily Offer",
  dealProductId: null,
  dealCompareAtPrice: null,
  weeklyPromoTitle: "Weekly Grocery Staples Pack",
  weeklyPromoSubtitle: "Flour, rice, pulses & daily essentials delivered every week with 15% subscriber savings.",
  monthlyPromoTitle: "Monthly Super Pantry Stock-Up",
  monthlyPromoSubtitle: "Bulk bags of Atta, Rice, Cooking Oil & Spices delivered to your door.",
};

export default function AdminHomepageControlPage() {
  const settings = DEFAULT_SETTINGS;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sliders className="size-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Homepage Control Center
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage hero banners, delivery slot rules, flash deal of the day, and promotional sections for desktop &amp; mobile shoppers.
          </p>
        </div>

      </div>

      <div className="space-y-8">
        {/* Section 1: Hero Banner Management */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Layout className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Hero Banner Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Hero Title (Line 1)
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Hero Highlight (Line 2 Colored Text)
              </label>
              <input
                type="text"
                value={settings.heroHighlight}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Hero Subtitle Description
              </label>
              <textarea
                rows={2}
                value={settings.heroSubtitle}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                value={settings.heroCtaText}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Hero Background Image URL
              </label>
              <input
                type="text"
                value={settings.heroImageUrl}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Slot & Cutoff Rules */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Moon className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Evening Delivery Window &amp; Cutoff Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Delivery Window Label
              </label>
              <input
                type="text"
                value={settings.deliverySlotLabel}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Order Cutoff Hour (24h format, e.g. 17 = 5 PM)
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={settings.cutoffHour}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Free Delivery Threshold (Rs)
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold}
                readOnly
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Deal of the Day Management */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-destructive" />
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Deal of the Day Configuration
                </h2>
                <p className="text-xs text-muted-foreground">
                  Control display status and select the featured deal product for storefront visitors.
                </p>
              </div>
            </div>

            {/* ON / OFF Toggle Switch */}
            <div className="flex items-center gap-3 bg-accent/50 p-2.5 rounded-xl border border-border/80 shrink-0">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Power className="size-3.5 text-muted-foreground" />
                Status:
              </span>
              <div
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.showDealOfTheDay ? "bg-emerald-600" : "bg-muted-foreground/30"
                }`}
                role="switch"
                aria-checked={settings.showDealOfTheDay}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.showDealOfTheDay ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  settings.showDealOfTheDay
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-destructive/15 text-destructive border border-destructive/20"
                }`}
              >
                {settings.showDealOfTheDay ? "ON (Visible)" : "OFF (Hidden)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                Featured Deal Product (Set by Admin)
              </label>
              <div className="w-full rounded-xl border border-input bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                No featured deal product configured
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Deal selections are not persisted or consumed by the storefront.
              </p>
            </div>

            {/* Deal Badge Label */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Deal Badge Label
              </label>
              <input
                type="text"
                value={settings.dealBadgeText}
                readOnly
                placeholder="e.g. 20% OFF Daily Offer"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Custom badge text shown over the product image.
              </p>
            </div>

            {/* Deal Compare-At Price */}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Original/Compare-At Price (Optional)
              </label>
              <input
                type="number"
                value={settings.dealCompareAtPrice || ""}
                readOnly
                placeholder="e.g. 500 (for strikethrough)"
                step="0.01"
                min="0"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                The original price to show as strikethrough. Leave empty to hide the strikethrough price.
              </p>
            </div>
          </div>

          {/* Product Live Preview */}
          <div className="rounded-xl border border-border/80 bg-accent/30 p-4">
            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">
              Deal of the Day Live Preview
            </h3>
            {!settings.showDealOfTheDay ? (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-center text-xs font-semibold text-destructive">
                Deal of the Day is currently turned <strong>OFF</strong>. It will be completely hidden from storefront visitors.
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-background border border-dashed border-border text-center text-xs font-medium text-muted-foreground">
                No product selected yet. Choose a product from the dropdown above to show it on the homepage.
              </div>
            )}
          </div>

          {/* Promotional Banners Subsection */}
          <div className="border-t border-border/60 pt-4 mt-4 space-y-4">
            <h3 className="font-display text-sm font-bold text-foreground">
              Weekly &amp; Monthly Promotional Banners
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Weekly Promo Title
                </label>
                <input
                  type="text"
                  value={settings.weeklyPromoTitle}
                  readOnly
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Weekly Promo Subtitle
                </label>
                <input
                  type="text"
                  value={settings.weeklyPromoSubtitle}
                  readOnly
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Monthly Stock-Up Promo Title
                </label>
                <input
                  type="text"
                  value={settings.monthlyPromoTitle}
                  readOnly
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Monthly Stock-Up Promo Subtitle
                </label>
                <input
                  type="text"
                  value={settings.monthlyPromoSubtitle}
                  readOnly
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
