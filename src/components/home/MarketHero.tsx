import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Moon, ShieldCheck, Truck } from "lucide-react";

export function MarketHero() {
  const trustPoints = [
    { Icon: ShieldCheck, label: "100% Quality Inspected Essentials" },
    { Icon: Moon, label: "7:00 PM – 10:00 PM Evening Slot" },
    { Icon: Truck, label: "Free delivery over Rs 3000" },
  ];

  return (
    <section
      aria-label="Quality groceries delivered daily in the evening window"
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-secondary text-secondary-foreground">
        <Image
          src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80"
          alt="Selection of pantry essentials and packaged groceries"
          fill
          priority
          className="object-cover opacity-35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/40"
        />

        <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/25 bg-secondary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <Moon aria-hidden="true" className="size-3.5 text-primary" />
              Evening Delivery Slot (7:00 PM – 10:00 PM)
            </span>

            <h1 className="mt-4 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Quality packaged groceries,{" "}
              <span className="block text-primary">delivered in your evening slot.</span>
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-secondary-foreground/80">
              Flour, pulses, cooking oils, spices, tea, snacks, and daily household essentials — delivered in our guaranteed evening slot.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-button transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore Market
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary-foreground/10"
              >
                Track Active Order
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-secondary-foreground/80">
                  <Icon aria-hidden="true" className="size-4 text-primary shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-end lg:flex">
            <dl className="ml-auto grid w-full max-w-xs gap-3">
              {[
                { k: "7:00 PM – 10:00 PM", v: "Fixed Evening Slot" },
                { k: "5:00 PM", v: "Order Cutoff Time" },
                { k: "100%", v: "Guaranteed Quality Essentials" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-secondary-foreground/15 bg-secondary-foreground/10 px-5 py-4 backdrop-blur-sm"
                >
                  <dt className="font-display text-2xl font-bold">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-[0.12em] text-secondary-foreground/70 mt-0.5">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
