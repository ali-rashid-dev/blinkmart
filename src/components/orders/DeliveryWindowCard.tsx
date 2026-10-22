import { CalendarClock, Info } from "lucide-react";
import {
  DELIVERY_TIMEFRAME,
  formatDeliveryDeadline,
  formatDeliveryDate,
} from "@/lib/orders/types";

export function DeliveryWindowCard({
  deliveryDate,
  deliverySlot,
  compact = false,
}: {
  deliveryDate: string;
  deliverySlot: string;
  compact?: boolean;
}) {
  const isRollingDeadline = deliverySlot === DELIVERY_TIMEFRAME.label;

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
            {isRollingDeadline
              ? `By ${formatDeliveryDeadline(deliveryDate)}`
              : `${formatDeliveryDate(deliveryDate)}, ${deliverySlot}`}
          </p>
          {!compact && (
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              {isRollingDeadline
                ? "Your order is due within 24 hours of placement."
                : "This order was scheduled for the delivery window shown above."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
