import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, ShieldCheck, ShoppingBasket, Truck } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
//  Kitcomart — FreshMart-style Campaign Hero
//  Layout: giant headline text sits behind the centred model image.
//  The model PNG (/public/hero-modle.png) has a white background that blends
//  away on the cream/green hero background via mix-blend-mode: multiply.
// ─────────────────────────────────────────────────────────────────────────────

export function HomeBanner() {
  return (
    <section
      aria-label="Kitcomart — Your Home Essentials, Online"
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8"
    >
      {/* ── Campaign Container ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[1.75rem]"
        style={{
          background: "linear-gradient(160deg, #2D4A3E 0%, #3a6352 35%, #4d8066 60%, #6fa882 80%, #a8d4b8 100%)",
          border: "1.5px solid rgba(45,74,62,0.5)",
          minHeight: "340px",
        }}
      >
        {/* ── Giant background headline ────────────────────────────────── */}
        {/*  Sits at z-0, behind everything. Mimics FreshMart's wordmark.  */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <span
            className="font-display font-black leading-none tracking-tight whitespace-nowrap"
            style={{
              fontSize: "clamp(5rem, 18vw, 16rem)",
              color: "transparent",
              WebkitTextStroke: "2px rgba(255,255,255,0.18)",
              letterSpacing: "-0.04em",
            }}
          >
            kitcomart
          </span>
        </div>

        {/* Subtle vignette so text on left is legible */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 8% 50%, rgba(45,74,62,0.72) 0%, rgba(45,74,62,0.18) 60%, transparent 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Main content layer ───────────────────────────────────────── */}
        <div
          className="relative flex h-full items-stretch"
          style={{ zIndex: 2, minHeight: "340px" }}
        >
          {/* ── LEFT: Supporting copy + CTA ──────────────────────────── */}
          <div className="flex flex-col justify-center gap-4 px-6 py-8 sm:px-10 lg:max-w-[340px] xl:max-w-[380px]">
            {/* Badge */}
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
              }}
            >
              <span className="size-1.5 rounded-full bg-[#D96C3F]" />
              Faisalabad &amp; beyond
            </span>

            {/* Copy */}
            <p
              className="max-w-[220px] text-sm leading-relaxed sm:text-base"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              From pantry staples to household essentials — shop everything your home needs.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                id="hero-cta-primary"
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  background: "#D96C3F",
                  boxShadow: "0 6px 20px -6px rgba(217,108,63,0.55)",
                }}
              >
                Shop Now
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              {/* Toggle-style secondary (mimics FreshMart's toggle pill) */}
              <Link
                href="/products"
                id="hero-cta-secondary"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Browse All
              </Link>
            </div>

            {/* Trust pills */}
            <ul className="flex flex-col gap-2 mt-1">
              {[
                { Icon: ShieldCheck, text: "Quality-inspected essentials" },
                { Icon: Clock,       text: "Orders within 24 hours" },
                { Icon: Truck,       text: "Free delivery on orders of Rs. 3,000 or more" },
              ].map(({ Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 text-[11px] font-medium"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" style={{ color: "#a8d4b8" }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ── CENTRE: Hero model — sits on top of the wordmark ─────── */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full"
            style={{ maxWidth: "min(480px, 52%)", zIndex: 3 }}
          >
            <Image
              src="/hero-modle.png"
              alt="Kitcomart shopper holding a box full of packaged grocery essentials — rice, cooking oil, tea, and household items"
              width={1100}
              height={1280}
              priority
              quality={95}
              className="h-auto w-full object-contain object-bottom"
              style={{
                mixBlendMode: "multiply",
                maxHeight: "360px",
                display: "block",
              }}
            />
          </div>

          {/* ── RIGHT: Floating product card ──────────────────────────── */}
          <div className="ml-auto flex items-center pr-5 sm:pr-8" style={{ zIndex: 4 }}>
            <div
              className="animate-hero-card w-40 overflow-hidden rounded-2xl sm:w-44"
              style={{
                background: "rgba(255,255,255,0.97)",
                border: "1px solid rgba(45,74,62,0.1)",
                boxShadow: "0 16px 48px -10px rgba(45,74,62,0.28), 0 4px 12px -4px rgba(0,0,0,0.08)",
              }}
            >
              {/* Card image area */}
              <div
                className="flex h-24 items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f0f7f1 0%, #e0f0e8 100%)" }}
              >
                <ShoppingBasket
                  aria-hidden="true"
                  className="size-10"
                  style={{ color: "#2D4A3E" }}
                />
              </div>

              {/* Card body */}
              <div className="px-3 py-3">
                <p
                  className="text-[11px] font-bold leading-tight"
                  style={{ color: "#2B2420" }}
                >
                  Grocery Essentials
                </p>
                <p
                  className="mt-0.5 text-[10px] leading-snug"
                  style={{ color: "#7A6F63" }}
                >
                  Rice, Oil, Tea &amp; more
                </p>

                <Link
                  href="/products"
                  id="hero-card-link"
                  className="mt-2.5 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D96C3F]"
                  style={{
                    background: "#D96C3F",
                    color: "#fff",
                  }}
                >
                  Shop now
                  <ArrowRight aria-hidden="true" className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom headline strip (mobile) ───────────────────────────── */}
        {/* On small screens the giant wordmark is too large; show a smaller strip */}
        <div
          className="relative px-6 pb-5 pt-2 sm:hidden"
          style={{ zIndex: 5 }}
        >
          <h2
            className="font-display font-black leading-none tracking-[-0.03em] text-white/90"
            style={{ fontSize: "clamp(2.4rem, 12vw, 3.2rem)" }}
          >
            Ghar Ka Har<br />
            <span style={{ color: "#a8d4b8" }}>Zaroori Saaman.</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
