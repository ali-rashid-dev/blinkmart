import Image from "next/image";
import type { ReactNode } from "react";

export function AuthLayout({
  children,
  quote,
}: {
  children: ReactNode;
  quote: { headline: string; body: string };
}) {
  return (
    <main className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* soft organic background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-accent/70 blur-3xl animate-soft-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 size-96 rounded-full bg-secondary/10 blur-3xl animate-soft-float"
      />

      {/* Left: artwork */}
      <section className="sticky top-0 hidden h-screen w-[46%] shrink-0 p-4 lg:block xl:w-1/2">
        <div className="relative h-full overflow-hidden rounded-[28px] border border-border">
          <Image
            src="/grocery-illustration.jpg"
            alt="Illustration of a woven basket and paper bag filled with fresh produce, herbs and olive branches"
            width={1024}
            height={1536}
            className="size-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/90 via-secondary/45 to-transparent p-10 pt-28">
            <p className="max-w-md font-display text-3xl leading-snug text-secondary-foreground">
              {quote.headline}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-secondary-foreground/75">
              {quote.body}
            </p>
          </div>
        </div>
      </section>

      {/* Right: card */}
      <section className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[26rem] animate-rise">{children}</div>
      </section>
    </main>
  );
}

export function Brandmark() {
  return (
    <div className="mb-8 flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <path
            d="M12 21c0-6 3-10 8-11-1 6-3.5 9-8 11Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path d="M12 21C10 14 7 11 3 9c1 6 3.5 10 9 12Z" fill="currentColor" opacity="0.55" />
          <path d="M12 21V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-lg tracking-tight text-foreground">Verdant Market</span>
    </div>
  );
}
