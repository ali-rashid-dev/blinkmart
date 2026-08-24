/**
 * Uniform Currency Formatter for BlinkMart (Pakistan Rupee - Rs)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "Rs 0";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "Rs 0";

  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);

  return `Rs ${formatted}`;
}

export function formatCompactCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "Rs 0";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "Rs 0";

  if (num >= 1_000_000) {
    return `Rs ${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `Rs ${(num / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(num);
}
