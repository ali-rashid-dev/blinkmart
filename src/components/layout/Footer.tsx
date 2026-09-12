"use client";

import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Lock,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      {/* ── Top Trust Badges Bar ────────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-muted/40 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Clock className="size-5 shrink-0 text-primary" />
              <div>
                <h4 className="text-xs font-bold text-foreground">7–10 PM Evening Slot</h4>
                <p className="text-[11px] text-muted-foreground">Cutoff at 5 PM daily</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Truck className="size-5 shrink-0 text-primary" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Faisalabad Coverage</h4>
                <p className="text-[11px] text-muted-foreground">Delivering across main hubs</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 shrink-0 text-primary" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Farm Fresh Quality</h4>
                <p className="text-[11px] text-muted-foreground">Handpicked daily produce</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Lock className="size-5 shrink-0 text-primary" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Free Delivery</h4>
                <p className="text-[11px] text-muted-foreground">On orders Rs. 3,000+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand & Brief Slogan */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                <ShoppingBag className="size-4.5" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Kit&amp;Co
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Faisalabad’s premier evening grocery delivery service. Fresh farm produce &amp; essentials delivered to your doorstep.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/delivery-information" className="hover:text-primary transition-colors">
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-primary transition-colors">
                  FAQs &amp; Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Customer Support
            </h3>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hub Info */}
          <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-0.5">
              Contact &amp; Hub
            </h3>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span>Canal Road Hub, Faisalabad</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              <span>+92 300 1234567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              <span>support@kitandco.pk</span>
            </div>
          </div>
        </div>

        {/* ── Copyright Line ─────────────────────────────────────────────────── */}
        <div className="mt-6 border-t border-border/50 pt-6 text-center text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Kit&amp;Co. All rights reserved.</p>
          <p>Targeting Grocery Delivery in Faisalabad, Punjab, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
