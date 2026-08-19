import { CalendarClock, Info } from "lucide-react";
import { DELIVERY_WINDOW, formatDeliveryDate } from "@/lib/orders/types";

export function DeliveryWindowCard({
  deliveryDate,
  compact = false,
}: {
  deliveryDate: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-secondary/25 bg-secondary/5 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-secondary shadow-soft">
          <CalendarClock aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Delivery time
          </p>
          <p className="mt-1 font-display text-lg leading-snug text-foreground">
            {formatDeliveryDate(deliveryDate)}, {DELIVERY_WINDOW.label}
          </p>
          {!compact && (
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Every BlinkMart basket is delivered in one fixed evening window. Orders placed after
              5:00 PM move to the next day&apos;s run.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
