"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Clock,
  Flame,
  Layout,
  Moon,
  Save,
  Sliders,
  Sparkles,
  Truck,
  CheckCircle2,
  Package,
  Power,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  getHomePageSettings,
  saveHomePageSettings,
  type HomePageSettings,
} from "@/lib/home/home-config";
import { getAdminProductsAction, type SerializedProduct } from "@/app/(admin-plane)/admin/products/actions";

export default function AdminHomepageControlPage() {
  const [settings, setSettings] = useState<HomePageSettings>(getHomePageSettings);
  const [saved, setSaved] = useState(false);
  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    setSettings(getHomePageSettings());

    // Fetch products for Deal of the Day selector
    async function loadProducts() {
      try {
        const res = await getAdminProductsAction({ limit: 100 });
        if (res.success && res.data) {
          setProducts(res.data.items);
        }
      } catch (err) {
        console.error("Failed to load products for deal selector:", err);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveHomePageSettings(settings);
    setSaved(true);
    toast.success("Homepage settings saved successfully!", {
      description: "Changes are now live across desktop and mobile home views.",
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const updateField = <K extends keyof HomePageSettings>(key: K, value: HomePageSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const selectedDealProduct = settings.dealProductId
    ? products.find((p) => p.id === settings.dealProductId)
    : null;

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

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-button transition-transform active:scale-95 shrink-0 cursor-pointer"
        >
          {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
          {saved ? "Saved Live!" : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
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
                onChange={(e) => updateField("heroTitle", e.target.value)}
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
                onChange={(e) => updateField("heroHighlight", e.target.value)}
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
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
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
                onChange={(e) => updateField("heroCtaText", e.target.value)}
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
                onChange={(e) => updateField("heroImageUrl", e.target.value)}
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
                onChange={(e) => updateField("deliverySlotLabel", e.target.value)}
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
                onChange={(e) => updateField("cutoffHour", Number(e.target.value))}
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
                onChange={(e) => updateField("freeDeliveryThreshold", Number(e.target.value))}
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
              <button
                type="button"
                onClick={() => updateField("showDealOfTheDay", !settings.showDealOfTheDay)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.showDealOfTheDay ? "bg-emerald-600" : "bg-muted-foreground/30"
                }`}
                role="switch"
                aria-checked={settings.showDealOfTheDay}
              >
                <span className="sr-only">Toggle Deal of the Day</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.showDealOfTheDay ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
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
              <select
                value={settings.dealProductId || ""}
                onChange={(e) => updateField("dealProductId", e.target.value || null)}
                disabled={loadingProducts}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">-- Select Product for Deal of the Day --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Rs {Math.round(p.price)} {p.category?.name ? `(${p.category.name})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {loadingProducts
                  ? "Loading products..."
                  : "Select the specific product you want to spotlight on the homepage."}
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
                onChange={(e) => updateField("dealBadgeText", e.target.value)}
                placeholder="e.g. 20% OFF Daily Offer"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Custom badge text shown over the product image.
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
            ) : selectedDealProduct ? (
              <div className="flex items-center gap-4 bg-card p-3 rounded-lg border border-border shadow-xs">
                <div className="relative size-16 shrink-0 rounded-md overflow-hidden bg-accent/50 border border-border">
                  {selectedDealProduct.imageUrl ? (
                    <Image
                      src={selectedDealProduct.imageUrl}
                      alt={selectedDealProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/40">
                      <ImageIcon className="size-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground px-2 py-0.5 text-[10px] font-bold">
                      <Flame className="size-3" /> {settings.dealBadgeText || "DEAL"}
                    </span>
                    {selectedDealProduct.category?.name && (
                      <span className="text-[11px] font-semibold text-primary">
                        {selectedDealProduct.category.name}
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-sm font-bold text-foreground truncate mt-1">
                    {selectedDealProduct.name}
                  </h4>
                  <p className="text-xs font-semibold text-foreground">
                    Rs {Math.round(selectedDealProduct.price)}{" "}
                    <span className="text-muted-foreground text-[11px] line-through font-normal">
                      Rs {Math.round(selectedDealProduct.price / 0.8)}
                    </span>
                  </p>
                </div>
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
                  onChange={(e) => updateField("weeklyPromoTitle", e.target.value)}
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
                  onChange={(e) => updateField("weeklyPromoSubtitle", e.target.value)}
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
                  onChange={(e) => updateField("monthlyPromoTitle", e.target.value)}
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
                  onChange={(e) => updateField("monthlyPromoSubtitle", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-button transition-transform active:scale-95 cursor-pointer"
          >
            <Save className="size-4" />
            Save Homepage Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
