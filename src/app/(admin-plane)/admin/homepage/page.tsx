"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  getHomePageSettings,
  saveHomePageSettings,
  type HomePageSettings,
} from "@/lib/home/home-config";

export default function AdminHomepageControlPage() {
  const [settings, setSettings] = useState<HomePageSettings>(getHomePageSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getHomePageSettings());
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
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-button transition-transform active:scale-95 shrink-0"
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

        {/* Section 3: Deal of the Day & Promos */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Flame className="size-5 text-destructive" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Deal of the Day &amp; Weekly / Monthly Banners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Deal Badge Label
              </label>
              <input
                type="text"
                value={settings.dealBadgeText}
                onChange={(e) => updateField("dealBadgeText", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>

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

            <div className="md:col-span-2">
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

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-button transition-transform active:scale-95"
          >
            <Save className="size-4" />
            Save Homepage Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
