import { Clock, ShieldCheck, Truck } from "lucide-react";

export function DeliverySlotBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-button">
            <Truck className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                <Clock className="size-3" />
                Delivery within 24 hours
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Order anytime
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              Your order is due within 24 hours of placing it.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground md:shrink-0">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          Fresh, quality-checked groceries
        </div>
      </div>
    </div>
  );
}
