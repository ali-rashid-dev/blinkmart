import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  MapPin,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Kit&Co Grocery Delivery Faisalabad",
  description:
    "Learn about Kit&Co (Blinkmart), Faisalabad's leading evening grocery delivery service specializing in fresh produce, daily essentials, and bulk pantry stock-ups.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-12">
      {/* ── 1. Hero Header Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/40 p-8 sm:p-12 border border-border/80 shadow-soft">
        <div className="relative z-10 max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary w-fit">
            <Sparkles className="size-3.5" />
            <span>Faisalabad's Evening Grocery Specialists</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Reinventing How Faisalabad Shops for Daily Groceries
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Kit&amp;Co was built with a simple promise: fresh, farm-quality produce and pantry staples delivered directly to your doorstep in Faisalabad when you are actually home—during guaranteed 7:00 PM to 10:00 PM evening slots.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all hover:scale-[1.01]"
            >
              <ShoppingBag className="size-4" />
              Start Shopping
            </Link>
            <Link
              href="/delivery-information"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs sm:text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Explore Delivery Hubs
            </Link>
          </div>
        </div>

        {/* Decorative subtle element */}
        <div className="absolute -right-12 -bottom-12 size-64 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      </section>

      {/* ── 2. Our Core Pillars ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Why Faisalabad Families Rely on Kit&amp;Co
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We focus on four unyielding operational standards that set us apart from traditional supermarkets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col gap-3 shadow-xs hover:border-primary/40 transition-colors">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Guaranteed Evening Slot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Order before 5:00 PM and relax. Your groceries arrive between 7:00 PM – 10:00 PM without midday delay or traffic hassle.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col gap-3 shadow-xs hover:border-primary/40 transition-colors">
            <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">100% Freshness Guarantee</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fruits, vegetables, and meats sourced fresh every morning. If an item doesn't meet your quality standard, notify us within 24 hours for a full refund or store credit.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col gap-3 shadow-xs hover:border-primary/40 transition-colors">
            <div className="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Truck className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Faisalabad Local Reach</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dedicated cold-chain fulfillment centers strategically situated near Canal Road and Kohinoor City for rapid sector dispatch.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col gap-3 shadow-xs hover:border-primary/40 transition-colors">
            <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HeartHandshake className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Transparent Fee Tiers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Low delivery fees starting at Rs. 40, and completely FREE delivery on all grocery orders totaling Rs. 3,000 and above.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Impact Stats Counters ───────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="flex flex-col gap-1 p-2">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary">50,000+</span>
            <span className="text-xs font-medium text-muted-foreground">Orders Delivered</span>
          </div>

          <div className="flex flex-col gap-1 p-2">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary">99.4%</span>
            <span className="text-xs font-medium text-muted-foreground">On-Time Slot Delivery</span>
          </div>

          <div className="flex flex-col gap-1 p-2">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary">15+</span>
            <span className="text-xs font-medium text-muted-foreground">Faisalabad Sectors</span>
          </div>

          <div className="flex flex-col gap-1 p-2">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary">100%</span>
            <span className="text-xs font-medium text-muted-foreground">Quality Guarantee</span>
          </div>
        </div>
      </section>

      {/* ── 4. Our Story Section ───────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Our Journey</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            From Local Punjab Farms to Your Kitchen Table
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Founded with the goal of modernizing Faisalabad's food distribution, Kit&amp;Co connects Punjab’s finest farmers and trusted consumer goods manufacturers directly with households.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            By operating a centralized warehouse model with evening delivery runs, we eliminate supermarket markups, maintain strict temperature control, and give working families their evenings back.
          </p>

          <ul className="space-y-2 pt-2 text-xs font-semibold text-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>Direct farmer sourcing for spinach, tomatoes, potatoes &amp; seasonal fruits</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>Insulated temperature-controlled delivery boxes</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-500 shrink-0" />
              <span>Dedicated WhatsApp helpline and responsive support team in Faisalabad</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-accent/30 p-8 flex flex-col gap-6">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            Serving All Key Faisalabad Communities
          </h3>
          <p className="text-xs text-muted-foreground">
            Our daily evening fleets operate across:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-foreground">
            <span className="rounded-xl bg-card p-3 border border-border">Kohinoor City</span>
            <span className="rounded-xl bg-card p-3 border border-border">D-Ground</span>
            <span className="rounded-xl bg-card p-3 border border-border">Canal Road</span>
            <span className="rounded-xl bg-card p-3 border border-border">People's Colony #1 &amp; #2</span>
            <span className="rounded-xl bg-card p-3 border border-border">Madina Town</span>
            <span className="rounded-xl bg-card p-3 border border-border">Susan Road</span>
            <span className="rounded-xl bg-card p-3 border border-border">Eden Gardens</span>
            <span className="rounded-xl bg-card p-3 border border-border">Officers Colony</span>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-between text-xs font-bold text-primary hover:underline pt-2"
          >
            <span>Have questions about coverage in your area?</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
