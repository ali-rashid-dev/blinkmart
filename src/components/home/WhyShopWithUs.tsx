import { Leaf, Truck, ShieldCheck, MousePointerClick } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const benefits = [
  { icon: Leaf, title: "Fresh Quality", text: "Carefully selected products." },
  { icon: Truck, title: "Fast Delivery", text: "Get your groceries delivered quickly." },
  { icon: ShieldCheck, title: "Secure Payments", text: "Safe and reliable checkout." },
  { icon: MousePointerClick, title: "Easy Shopping", text: "Simple shopping from start to finish." },
];

export function WhyShopWithUs() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeader title="Why shop with us?" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <b.icon className="size-5" />
            </span>
            <h3 className="mt-3 font-display text-base text-foreground">{b.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
