"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Lock,
  AlertCircle,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
      }

      setSubscribed(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while subscribing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      {/* ── Top Trust Badges Bar ────────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-muted/40 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">7–10 PM Evening Slot</h4>
                <p className="text-xs text-muted-foreground">Guaranteed delivery after cutoff at 5 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Faisalabad-Wide Delivery</h4>
                <p className="text-xs text-muted-foreground">Serving Kohinoor, D-Ground, Canal Rd &amp; more</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Farm Fresh Quality</h4>
                <p className="text-xs text-muted-foreground">Handpicked produce &amp; strict hygiene</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Transparent Fee Tiers</h4>
                <p className="text-xs text-muted-foreground">Free delivery on orders Rs. 3,000+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Brand & About (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-soft">
                <ShoppingBag className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-tight text-foreground">
                  Kit&amp;Co
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Grocery Delivery Faisalabad
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-muted-foreground pr-2">
              Faisalabad’s premier evening grocery delivery service. We bring fresh farm produce, dairy boxes, and bulk pantry stock-ups directly to your doorstep during guaranteed 7:00 PM – 10:00 PM evening slots.
            </p>

            {/* Helpline Details */}
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span>Canal Road Hub, Near Kohinoor City, Faisalabad</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>+92 300 1234567 (8:00 AM – 11:00 PM Daily)</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>support@kitandco.pk</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-primary">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/delivery-information" className="transition-colors hover:text-primary flex items-center gap-1">
                  <span>Delivery Info</span>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">Faisalabad</span>
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="transition-colors hover:text-primary">
                  FAQs &amp; Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Legal (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-muted-foreground">
              <li>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="transition-colors hover:text-primary">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-primary">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="transition-colors hover:text-primary">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Faisalabad Sectors & Newsletter (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Faisalabad Delivery Sectors
              </h3>
              <p className="text-[11px] text-muted-foreground mb-2.5">
                Active coverage hubs: Kohinoor City, D-Ground, Canal Road, People’s Colony #1 &amp; #2, Madina Town, Susan Road, Officers Colony &amp; Eden Gardens.
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Get Weekly Deals &amp; Fresh Arrivals
              </h3>
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/30 p-3 text-xs text-success font-medium">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Thank you! You are now subscribed to Faisalabad grocery updates.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {error && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label htmlFor="newsletter-email" className="sr-only">
                        Email address for newsletter
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                    >
                      <span>{loading ? "..." : "Subscribe"}</span>
                      {!loading && <Send className="size-3" />}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Fee Summary & Payment Strip ────────────────────────────────────────── */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-foreground">Delivery Rates:</span>
            <span>Rs. 0–999: <strong className="text-foreground">Rs. 100</strong></span>
            <span>•</span>
            <span>Rs. 1,000–1,999: <strong className="text-foreground">Rs. 70</strong></span>
            <span>•</span>
            <span>Rs. 2,000–2,999: <strong className="text-foreground">Rs. 40</strong></span>
            <span>•</span>
            <span>Rs. 3,000+: <strong className="text-primary font-bold">FREE</strong></span>
            <span>(Platform fee: Rs. 20)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium">Accepted Payments:</span>
            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-foreground">
              <span className="rounded-md bg-accent px-2 py-1 border border-border">COD</span>
              <span className="rounded-md bg-accent px-2 py-1 border border-border">JazzCash</span>
              <span className="rounded-md bg-accent px-2 py-1 border border-border">EasyPaisa</span>
              <span className="rounded-md bg-accent px-2 py-1 border border-border">Cards</span>
            </div>
          </div>
        </div>

        {/* ── Copyright Line ─────────────────────────────────────────────────── */}
        <div className="mt-6 border-t border-border/50 pt-6 text-center text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Kit&amp;Co (Blinkmart). All rights reserved.</p>
          <p>Targeting Grocery Delivery in Faisalabad, Punjab, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
