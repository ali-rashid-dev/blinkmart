import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBasket } from "lucide-react";

export function HomeBanner() {
  return (
    <section
      aria-labelledby="home-banner-title"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8"
    >
      <div
        className="relative isolate min-h-[390px] overflow-hidden rounded-[2rem] sm:min-h-[420px]"
        style={{
          background:
            "linear-gradient(120deg, #203b32 0%, #2d4a3e 36%, #4d8066 72%, #8bb99a 100%)",
          border: "1px solid rgba(45,74,62,0.45)",
          boxShadow: "0 24px 60px -34px rgba(34,59,49,0.65)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
        >
          <span
            className="font-display text-[clamp(5rem,15vw,13rem)] font-black leading-none tracking-[-0.06em] whitespace-nowrap"
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.14)",
            }}
          >
            kitcomart
          </span>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(32,59,50,0.42) 0%, rgba(32,59,50,0.08) 52%, transparent 78%)",
          }}
        />

        <div
          className="relative flex min-h-[390px] items-center px-6 py-10 sm:min-h-[420px] sm:px-10 lg:px-12"
        >
          <div className="relative z-10 flex max-w-[560px] flex-col items-start gap-6 sm:gap-7">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px]"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.24)",
                color: "#fff",
              }}
            >
              <span className="size-2 rounded-full bg-[#E17C4E] shadow-[0_0_0_3px_rgba(225,124,78,0.18)]" />
              faisalabad Pakistan
            </span>

            <h1
              id="home-banner-title"
              className="max-w-full font-display text-[clamp(2.75rem,4.2vw,3.8rem)] font-black leading-[0.96] tracking-[-0.055em] text-white"
            >
              Ghar Ka Har
              <br />
              <span style={{ color: "#b9dfc5" }}>Zaroori Saaman.</span>
            </h1>

            <p className="max-w-[360px] text-sm leading-relaxed text-white/80 sm:text-base">
              From pantry staples to household essentials — shop everything your home needs.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                id="hero-cta-primary"
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2D4A3E]"
                style={{
                  background: "#D96C3F",
                  boxShadow: "0 8px 22px -8px rgba(217,108,63,0.75)",
                }}
              >
                Shop Now
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/products"
                id="hero-cta-secondary"
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-4 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Browse All
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[43%] z-[2] w-[36%] max-w-[430px]"
          >
            <Image
              src="/hero-modle.png"
              alt=""
              width={1306}
              height={1205}
              priority
              sizes="(max-width: 1280px) 36vw, 430px"
              className="block h-auto w-full object-contain object-bottom"
              style={{
                mixBlendMode: "multiply",
              }}
            />
          </div>

          <div className="absolute right-5 top-1/2 z-[4] hidden -translate-y-1/2 sm:block lg:right-8">
            <div
              className="w-40 overflow-hidden rounded-2xl sm:w-44"
              style={{
                background: "rgba(255,255,255,0.97)",
                border: "1px solid rgba(255,255,255,0.72)",
                boxShadow: "0 20px 50px -18px rgba(24,48,39,0.55)",
              }}
            >
              <div
                className="flex h-24 items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 50% 25%, #fff 0%, #e7f2e9 75%, #d7eadc 100%)",
                }}
              >
                <ShoppingBasket
                  aria-hidden="true"
                  className="size-11"
                  style={{ color: "#2D4A3E" }}
                />
              </div>

              <div className="px-3.5 py-3.5">
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: "#2B2420" }}
                >
                  Grocery Essentials
                </p>
                <p
                  className="mt-1 text-[11px] leading-snug"
                  style={{ color: "#7A6F63" }}
                >
                  Rice, Oil, Tea &amp; more
                </p>

                <Link
                  href="/products"
                  id="hero-card-link"
                  className="mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C3F]"
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
      </div>
    </section>
  );
}
