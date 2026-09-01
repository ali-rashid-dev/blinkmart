export interface HomePageSettings {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImageUrl: string;
  deliverySlotLabel: string;
  cutoffHour: number; // e.g. 17 for 5:00 PM
  freeDeliveryThreshold: number; // e.g. 499
  dealBadgeText: string;
  dealProductId?: string | null;
  weeklyPromoTitle: string;
  weeklyPromoSubtitle: string;
  monthlyPromoTitle: string;
  monthlyPromoSubtitle: string;
}

/**
 * Format a 24-hour cutoff hour (0-23) to a readable AM/PM time string.
 * Examples: 9 -> "9:00 AM", 17 -> "5:00 PM", 0 -> "12:00 AM", 12 -> "12:00 PM"
 */
export function formatCutoffHour(hour: number): string {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
}

export const DEFAULT_HOME_SETTINGS: HomePageSettings = {
  heroTitle: "Handpicked fresh groceries,",
  heroHighlight: "delivered tonight.",
  heroSubtitle: "Fresh produce, dairy, bakery and monthly pantry staples — picked fresh each morning and delivered in our guaranteed evening slot.",
  heroCtaText: "Explore Market",
  heroCtaLink: "/products",
  heroImageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
  deliverySlotLabel: "7:00 PM – 10:00 PM",
  cutoffHour: 17,
  freeDeliveryThreshold: 499,
  dealBadgeText: "20% OFF Daily Offer",
  dealProductId: null,
  weeklyPromoTitle: "Weekly Fresh Produce Basket",
  weeklyPromoSubtitle: "Handpicked fruits & vegetables delivered every week with 15% subscriber savings.",
  monthlyPromoTitle: "Monthly Super Pantry Stock-Up",
  monthlyPromoSubtitle: "Bulk bags of Atta, Rice, Cooking Oil & Spices delivered to your door.",
};

const STORAGE_KEY = "blinkmart_admin_home_settings";

export function getHomePageSettings(): HomePageSettings {
  if (typeof window === "undefined") return DEFAULT_HOME_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOME_SETTINGS;
    return { ...DEFAULT_HOME_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HOME_SETTINGS;
  }
}

export function saveHomePageSettings(settings: Partial<HomePageSettings>): HomePageSettings {
  const current = getHomePageSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}
