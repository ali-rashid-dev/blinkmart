import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Scale, Clock, Truck, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Kit&Co Grocery Delivery Faisalabad",
  description:
    "Read the terms and conditions for ordering groceries, cutoff times, delivery fee tiers, and refunds with Kit&Co in Faisalabad.",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-8">
      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <FileText className="size-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Last updated: September 2026 • Valid for Kit&amp;Co (Blinkmart) services in Faisalabad, Pakistan.
        </p>
      </div>

      {/* ── 2. Table of Contents ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground flex flex-col gap-2">
        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Table of Contents</span>
        <ol className="list-decimal list-inside space-y-1 font-medium text-foreground">
          <li>Acceptance of Terms</li>
          <li>Service Scope &amp; Faisalabad Deliveries</li>
          <li>Order Cutoff Times &amp; Delivery Windows</li>
          <li>Delivery Fee Structure &amp; Platform Fees</li>
          <li>Product Pricing &amp; Fresh Weight Variances</li>
          <li>Cancellations, Quality Guarantee &amp; Refunds</li>
          <li>Governing Law &amp; Jurisdiction</li>
        </ol>
      </div>

      {/* ── 3. Content Sections ────────────────────────────────────────────── */}
      <article className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Kit&amp;Co (Blinkmart) website, mobile application, or grocery delivery service, you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please refrain from placing orders through our service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">2. Service Scope &amp; Faisalabad Deliveries</h2>
          <p>
            Kit&amp;Co operates an evening grocery delivery service serving selected residential and commercial zones across Faisalabad, Pakistan. We reserve the right to restrict delivery to designated postal sectors (including Kohinoor City, D-Ground, Canal Road, People's Colony, Madina Town, Susan Road, and neighboring areas).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">3. Order Cutoff Times &amp; Delivery Windows</h2>
          <p>
            Standard orders placed before <strong>5:00 PM PKT</strong> qualify for same-day evening delivery between <strong>7:00 PM and 10:00 PM</strong>. Orders confirmed after 5:00 PM PKT will automatically be assigned to the next evening’s delivery window.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">4. Delivery Fee Structure &amp; Platform Fees</h2>
          <p>
            Delivery charges are calculated based on your total order value prior to taxes and discounts:
          </p>
          <div className="overflow-hidden rounded-xl border border-border bg-card my-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-foreground font-bold border-b border-border">
                <tr>
                  <th className="p-3">Order Value</th>
                  <th className="p-3">Delivery Fee</th>
                  <th className="p-3">Platform Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-3 font-semibold text-foreground">Rs. 0 – 999</td>
                  <td className="p-3">Rs. 100</td>
                  <td className="p-3">Rs. 20</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">Rs. 1,000 – 1,999</td>
                  <td className="p-3">Rs. 70</td>
                  <td className="p-3">Rs. 20</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">Rs. 2,000 – 2,999</td>
                  <td className="p-3">Rs. 40</td>
                  <td className="p-3">Rs. 20</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-3 font-bold text-foreground">Rs. 3,000+</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">FREE</td>
                  <td className="p-3">Rs. 20</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">5. Product Pricing &amp; Fresh Weight Variances</h2>
          <p>
            All prices listed are in Pakistani Rupees (PKR). Due to the nature of fresh fruits, vegetables, and meats, actual weight delivered may vary slightly by ±5%. You will only be billed for the actual weighed amount delivered.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">6. Cancellations, Quality Guarantee &amp; Refunds</h2>
          <p>
            Orders can be canceled free of charge prior to 5:00 PM PKT on the day of delivery. If an item delivered is damaged, spoiled, or missing, notify us within 24 hours for a full refund or store credit.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">7. Governing Law &amp; Jurisdiction</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any legal disputes arising out of the use of Kit&amp;Co services shall be subject to the exclusive jurisdiction of the courts in Faisalabad, Punjab.
          </p>
        </section>
      </article>

      {/* ── 4. Contact Footer Box ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 text-xs text-muted-foreground flex items-center justify-between gap-4">
        <span>Have questions about our terms? Contact our support team.</span>
        <Link href="/contact" className="font-bold text-primary hover:underline">
          Contact Us →
        </Link>
      </div>
    </main>
  );
}
