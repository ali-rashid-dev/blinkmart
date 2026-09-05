import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Grocery Delivery Faisalabad — Evening Slots & Fee Tiers | Kit&Co",
  description:
    "Complete delivery information for grocery delivery in Faisalabad. Learn about our guaranteed 7–10 PM evening slot, 5 PM order cutoff, sector coverage, and delivery fee tiers.",
};

export default function DeliveryInformationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-12">
      {/* ── 1. Hero Header Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/40 p-8 sm:p-12 border border-border/80 shadow-soft">
        <div className="relative z-10 max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary w-fit">
            <Truck className="size-3.5" />
            <span>Targeting Grocery Delivery Faisalabad</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Faisalabad Grocery Delivery Schedule &amp; Rates
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Kit&amp;Co provides reliable evening grocery delivery across Faisalabad. Order before our daily 5:00 PM cutoff to receive handpicked fresh produce, dairy, and bulk pantry stock-ups in our evening delivery slot (7:00 PM – 10:00 PM).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all hover:scale-[1.01]"
            >
              <ShoppingBag className="size-4" />
              Order Groceries Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Order Value, Delivery Fee & Platform Fee Table ──────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <DollarSign className="size-4" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Delivery Fee &amp; Platform Fee Tiers
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We believe in honest, upfront pricing with no hidden surcharges for grocery delivery in Faisalabad.
          </p>
        </div>

        {/* Responsive Table Card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/60 text-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Order Value</th>
                  <th className="px-6 py-4">Delivery Fee</th>
                  <th className="px-6 py-4">Platform Fee</th>
                  <th className="px-6 py-4 text-right">Total Extra Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-muted-foreground">
                <tr className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">Rs. 0 – 999</td>
                  <td className="px-6 py-4 text-foreground font-medium">Rs. 100</td>
                  <td className="px-6 py-4">Rs. 20</td>
                  <td className="px-6 py-4 text-right font-bold text-foreground">Rs. 120</td>
                </tr>
                <tr className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">Rs. 1,000 – 1,999</td>
                  <td className="px-6 py-4 text-foreground font-medium">Rs. 70</td>
                  <td className="px-6 py-4">Rs. 20</td>
                  <td className="px-6 py-4 text-right font-bold text-foreground">Rs. 90</td>
                </tr>
                <tr className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">Rs. 2,000 – 2,999</td>
                  <td className="px-6 py-4 text-foreground font-medium">Rs. 40</td>
                  <td className="px-6 py-4">Rs. 20</td>
                  <td className="px-6 py-4 text-right font-bold text-foreground">Rs. 60</td>
                </tr>
                <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">Rs. 3,000+</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">FREE</td>
                  <td className="px-6 py-4">Rs. 20</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">Rs. 20 (Only Platform Fee)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-accent/40 p-4 px-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="size-4 text-amber-500 shrink-0" />
              Pro Tip: Build a weekly or monthly stock-up order over Rs. 3,000 to enjoy FREE delivery!
            </span>
            <Link href="/cart" className="font-semibold text-primary hover:underline shrink-0">
              Check Your Cart Total →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Evening Delivery Window & Cutoff ───────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Clock className="size-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Daily 5:00 PM Order Cutoff
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            All orders placed before <strong>5:00 PM PKT</strong> enter our same-day evening fulfillment run. Orders placed after 5:00 PM are automatically scheduled for the following evening's run.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>Ensures max freshness for morning-picked fruits &amp; vegetables</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>Allows drivers to optimize route clusters across Faisalabad</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Package className="size-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Guaranteed 7–10 PM Slot
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our delivery fleet operates between <strong>7:00 PM and 10:00 PM</strong> daily. You will receive an automated SMS notification when your delivery vehicle leaves our hub with contact details for your driver.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>No missed packages—deliveries happen when families are home</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>Temperature-controlled insulated bags keep dairy &amp; meat chilled</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── 4. Covered Sectors in Faisalabad ──────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-accent/30 p-8 sm:p-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <MapPin className="size-4" />
            <span>Faisalabad Coverage Zones</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Serving Major Neighborhoods Across Faisalabad
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We currently deliver groceries to all residential and commercial zones in the following Faisalabad areas:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col gap-1.5">
            <h4 className="font-bold text-sm text-foreground">Zone 1: Central &amp; Commercial</h4>
            <p className="text-xs text-muted-foreground">Kohinoor City, D-Ground, Susan Road, People's Colony #1 &amp; #2.</p>
          </div>

          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col gap-1.5">
            <h4 className="font-bold text-sm text-foreground">Zone 2: Canal Corridor</h4>
            <p className="text-xs text-muted-foreground">Canal Road, Eden Gardens, Saeed Colony, Batala Colony.</p>
          </div>

          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col gap-1.5">
            <h4 className="font-bold text-sm text-foreground">Zone 3: Eastern Sectors</h4>
            <p className="text-xs text-muted-foreground">Madina Town, Officers Colony, University Town, Canal Express.</p>
          </div>

          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col gap-1.5">
            <h4 className="font-bold text-sm text-foreground">Zone 4: North-West Sectors</h4>
            <p className="text-xs text-muted-foreground">Civil Lines, Millat Town, Gulberg Faisalabad, Sheikhupura Road.</p>
          </div>

          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col gap-1.5">
            <h4 className="font-bold text-sm text-foreground">Zone 5: Southern Sectors</h4>
            <p className="text-xs text-muted-foreground">Samanabad, Jinnah Colony, Ghulam Muhammad Abad.</p>
          </div>

          <div className="rounded-2xl bg-card p-4 border border-border flex flex-col gap-1.5 bg-primary/5">
            <h4 className="font-bold text-sm text-primary flex items-center gap-1">
              <Sparkles className="size-4" />
              Expanding Sectors
            </h4>
            <p className="text-xs text-muted-foreground">Adding new Faisalabad housing societies weekly!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
