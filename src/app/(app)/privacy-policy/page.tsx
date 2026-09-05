import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Shield, Eye, Database, Smartphone, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Kit&Co Grocery Delivery Faisalabad",
  description:
    "Learn how Kit&Co (Blinkmart) collects, protects, and handles customer data and delivery address information in Faisalabad.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-8">
      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Lock className="size-4" />
          <span>Data Protection &amp; Security</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Effective date: September 2026 • Kit&amp;Co (Blinkmart) Faisalabad Operations.
        </p>
      </div>

      {/* ── 2. Privacy Highlights Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Data Encryption</h3>
          <p className="text-xs text-muted-foreground">SSL encrypted transactions &amp; secure account storage.</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Eye className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">No Third-Party Sales</h3>
          <p className="text-xs text-muted-foreground">We never sell your personal information or contact list.</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserCheck className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">User Control</h3>
          <p className="text-xs text-muted-foreground">Update or delete your account profile at any time.</p>
        </div>
      </div>

      {/* ── 3. Policy Content Articles ──────────────────────────────────────── */}
      <article className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">1. Information We Collect</h2>
          <p>
            When you register an account, place a grocery order, or contact customer care, we collect information including:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Contact details (Full name, phone number, WhatsApp number, email address)</li>
            <li>Faisalabad delivery address details (Sector, building/house number, nearest landmark)</li>
            <li>Order history, saved carts, and preference settings</li>
            <li>Device &amp; usage information (IP address, browser type, cookies)</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to fulfill grocery orders in Faisalabad:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Dispatching drivers to your address during 7–10 PM evening delivery slots</li>
            <li>Sending automated SMS and WhatsApp delivery status updates</li>
            <li>Processing cash-on-delivery and online payments (JazzCash/EasyPaisa/Cards)</li>
            <li>Improving route optimization across Faisalabad sectors</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">3. Information Sharing &amp; Delivery Partners</h2>
          <p>
            We share relevant delivery details (recipient name, address, phone number) with our assigned delivery riders for the sole purpose of completing your order. We do not sell, rent, or trade your personal data to external advertisers.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">4. Data Security &amp; Retention</h2>
          <p>
            We implement industry-standard technical safeguards to protect your personal information against unauthorized access, loss, or alteration. Password credentials are securely hashed, and payment information is processed through PCI-compliant partner gateways.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground font-display">5. Contact Privacy Officers</h2>
          <p>
            If you have questions about our Privacy Policy or wish to request data correction or deletion, please email our team at <strong>privacy@kitandco.pk</strong> or reach our helpline at +92 300 1234567.
          </p>
        </section>
      </article>

      {/* ── 4. Return to Home ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 text-xs text-muted-foreground flex items-center justify-between gap-4">
        <span>Thank you for choosing Kit&amp;Co for your Faisalabad grocery needs.</span>
        <Link href="/" className="font-bold text-primary hover:underline">
          Return to Homepage →
        </Link>
      </div>
    </main>
  );
}
