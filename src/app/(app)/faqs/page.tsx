"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Truck,
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  Phone,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "delivery" | "payment" | "quality" | "orders";
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "delivery",
    question: "What is the cutoff time for same-day grocery delivery in Faisalabad?",
    answer: "Our daily order cutoff is 5:00 PM PKT. Orders placed before 5:00 PM are delivered between 7:00 PM and 10:00 PM on the same evening. Orders placed after 5:00 PM will be delivered during the following evening's 7–10 PM slot.",
  },
  {
    category: "delivery",
    question: "Which areas in Faisalabad do you cover?",
    answer: "We cover all major residential and commercial sectors in Faisalabad including Kohinoor City, D-Ground, Canal Road, People's Colony #1 & #2, Madina Town, Susan Road, Officers Colony, Eden Gardens, Saeed Colony, Civil Lines, and Gulberg.",
  },
  {
    category: "payment",
    question: "What are your delivery fee tiers and platform fees?",
    answer: "Our delivery fee structure is based on your total order value:\n• Rs. 0 – 999: Rs. 100 delivery fee\n• Rs. 1,000 – 1,999: Rs. 70 delivery fee\n• Rs. 2,000 – 2,999: Rs. 40 delivery fee\n• Rs. 3,000+: FREE delivery\n\nA nominal platform fee of Rs. 20 applies to all orders.",
  },
  {
    category: "payment",
    question: "What payment methods are accepted?",
    answer: "We accept Cash on Delivery (COD), JazzCash, EasyPaisa, and major debit/credit cards (Visa & Mastercard) at checkout or upon arrival.",
  },
  {
    category: "quality",
    question: "How do you ensure fresh produce quality in Faisalabad's weather?",
    answer: "We source fresh fruits, vegetables, and dairy directly from Punjab farms every morning. Deliveries are packed in temperature-controlled insulated containers to protect fresh items against heat during transit.",
  },
  {
    category: "quality",
    question: "What if an item in my order is damaged or missing?",
    answer: "We offer an instant refund or replacement guarantee. If any item fails to meet your quality expectations, inform your rider upon delivery or contact our helpline at +92 300 1234567 within 24 hours.",
  },
  {
    category: "orders",
    question: "Can I modify or cancel my order after placing it?",
    answer: "You can modify or cancel your order anytime before our 5:00 PM cutoff via your account dashboard under 'My Orders' or by contacting our WhatsApp support.",
  },
  {
    category: "orders",
    question: "Do you offer weekly or monthly recurring grocery stock-ups?",
    answer: "Yes! You can easily repeat past orders with a single click from your profile or schedule recurring weekly staple boxes for milk, eggs, bread, and monthly bulk pantry items like flour, rice, and oil.",
  },
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-10">
      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
          <HelpCircle className="size-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          How Can We Help You Today?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Everything you need to know about grocery delivery in Faisalabad, cutoff times, pricing fee tiers, and freshness guarantees.
        </p>
      </div>

      {/* ── 2. Search Bar & Category Filter Tabs ───────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl mx-auto w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. delivery fee, cutoff, refund, Faisalabad)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-2xl border border-input bg-card pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Questions
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("delivery")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === "delivery"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="size-3.5" />
            <span>Delivery &amp; Coverage</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("payment")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === "payment"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="size-3.5" />
            <span>Fees &amp; Payments</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("quality")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === "quality"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>Quality &amp; Freshness</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("orders")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === "orders"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="size-3.5" />
            <span>Orders &amp; Returns</span>
          </button>
        </div>
      </div>

      {/* ── 3. FAQ Accordion List ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-border bg-card p-6 text-muted-foreground">
            <p className="text-sm font-semibold">No questions matched your search query.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-2 text-xs text-primary underline"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-xs sm:text-sm font-bold text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 text-primary shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/40 bg-accent/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── 4. Unanswered Questions CTA ────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-accent/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Phone className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Still have questions?</h3>
            <p className="text-xs text-muted-foreground">Our Faisalabad support team is available from 8 AM to 11 PM daily.</p>
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors shrink-0"
        >
          Contact Support
        </Link>
      </div>
    </main>
  );
}
