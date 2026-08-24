export function getCategoryEmoji(categoryName?: string | null, categorySlug?: string | null): string {
  if (categoryName) {
    const emojiMatch = categoryName.match(/^(\p{Extended_Pictographic})/u);
    if (emojiMatch) {
      return emojiMatch[1];
    }
  }

  const slugMap: Record<string, string> = {
    "fresh-produce": "🥦",
    "dairy-eggs": "🥛",
    "bakery-bread": "🥖",
    "meat-seafood": "🥩",
    "pantry-staples": "🥫",
    beverages: "🥤",
    "snacks-sweets": "🍿",
    "frozen-foods": "🧊",
    "household-cleaning": "🧼",
    "personal-care": "💆",
  };

  if (categorySlug && slugMap[categorySlug]) {
    return slugMap[categorySlug];
  }

  return "📦";
}

import { formatCurrency, formatCompactCurrency } from "@/lib/currency";

export { formatCurrency };

export function formatCompact(amount: number): string {
  return formatCompactCurrency(amount);
}

export function calculateDelta(current: number, prior: number): number {
  if (prior === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - prior) / prior) * 100).toFixed(1));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "C";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
