/**
 * Uniform Currency Formatter for BlinkMart (Pakistan Rupee - Rs)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "Rs 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rs 0";

  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);

  return `Rs ${formatted}`;
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rs ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `Rs ${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}
