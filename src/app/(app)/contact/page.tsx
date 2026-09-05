"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Building,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate client-side
    if (!formData.name || !formData.message) {
      setError("Name and message are required");
      return;
    }

    if (!formData.email && !formData.phone) {
      setError("Please provide either an email address or phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit contact form");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "Order Inquiry", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-10">
      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary w-fit">
          <MessageSquare className="size-3.5" />
          <span>Faisalabad Support Center</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Get in Touch with Our Team
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Need help with an ongoing evening order in Faisalabad, product feedback, or partnership queries? We're available 7 days a week.
        </p>
      </div>

      {/* ── 2. Contact Info Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2.5 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Phone className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Helpline &amp; WhatsApp</h3>
          <p className="text-xs font-medium text-foreground">+92 300 1234567</p>
          <p className="text-[11px] text-muted-foreground">Available for instant order status &amp; updates</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2.5 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Mail className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Email Support</h3>
          <p className="text-xs font-medium text-foreground">support@kitandco.pk</p>
          <p className="text-[11px] text-muted-foreground">Responses within 2 to 4 working hours</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2.5 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MapPin className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Fulfillment Hub</h3>
          <p className="text-xs font-medium text-foreground">Canal Road, Faisalabad</p>
          <p className="text-[11px] text-muted-foreground">Near Kohinoor City Hub, Punjab, PK</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col gap-2.5 shadow-xs">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Clock className="size-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Operating Hours</h3>
          <p className="text-xs font-medium text-foreground">8:00 AM – 11:00 PM Daily</p>
          <p className="text-[11px] text-muted-foreground">Daily cutoff for delivery: 5:00 PM</p>
        </div>
      </div>

      {/* ── 3. Main Form & FAQ Quick Section ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <h2 className="font-display text-xl font-bold text-foreground">
            Send Us a Message
          </h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 p-8 rounded-2xl bg-success/10 border border-success/30">
              <div className="size-12 rounded-full bg-success/20 text-success flex items-center justify-center">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">Message Received!</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Thank you, <strong>{formData.name}</strong>. Our Faisalabad support representative will review your query and reach out via email or phone shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", phone: "", subject: "Order Inquiry", message: "" });
                }}
                className="mt-2 text-xs font-semibold text-primary underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-destructive shrink-0" />
                    <p className="text-xs font-semibold text-destructive">{error}</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-foreground">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Ali Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-foreground">
                    Phone / WhatsApp Number (or email required)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="0300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-foreground">
                    Email Address (or phone number required)
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="ali@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-bold text-foreground">
                    Inquiry Topic
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="Order Inquiry">Order Inquiry / Delivery Status</option>
                    <option value="Quality Concern">Product Quality / Item Issue</option>
                    <option value="Refund Request">Refund / Payment Query</option>
                    <option value="Faisalabad Coverage">Delivery Sector Coverage</option>
                    <option value="Supplier/Vendor">Supplier / Vendor Partner</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-foreground">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Describe your issue, order ID, or general question..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>{loading ? "Sending..." : "Send Message"}</span>
                {!loading && <Send className="size-4" />}
              </button>
            </>
          )}
        </div>

        {/* Quick Info & FAQs Link (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-accent/30 p-6 sm:p-8 flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              Looking for Immediate Answers?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check out our FAQs section for instant details on Faisalabad delivery cutoff times, refund rules, accepted payment options, and fee tiers.
            </p>

            <Link
              href="/faqs"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors w-fit"
            >
              Browse FAQs
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Building className="size-5 text-primary" />
              Faisalabad Headquarters
            </h3>
            <div className="text-xs text-muted-foreground flex flex-col gap-2">
              <p className="font-medium text-foreground">Kit&amp;Co (Blinkmart) Operations Center</p>
              <p>Canal Road Commercial Belt, Faisalabad, Punjab</p>
              <p className="pt-2 text-[11px]">Note: Deliveries are dispatched directly from our temperature-controlled hubs to maintain farm freshness.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
