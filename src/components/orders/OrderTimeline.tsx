import { Check, X } from "lucide-react";
import {
  LIFECYCLE,
  STATUS_HINT,
  STATUS_LABEL,
  formatDateTime,
  type Order,
} from "@/lib/orders/types";

export function OrderTimeline({ order }: { order: Order }) {
  const cancelled = order.status === "cancelled";
  const reached = new Map(order.timeline.map((e) => [e.status, e.at]));
  const currentIndex = cancelled ? -1 : LIFECYCLE.indexOf(order.status);

  const steps = cancelled
    ? [...LIFECYCLE.filter((s) => reached.has(s)), "cancelled" as const]
    : LIFECYCLE;

  return (
    <ol aria-label="Order progress" className="relative space-y-5">
      {steps.map((status, i) => {
        const at = reached.get(status);
        const done = Boolean(at);
        const isCurrent = !cancelled && i === currentIndex;
        const isCancelStep = status === "cancelled";
        return (
          <li key={status} className="relative flex gap-4 pl-1">
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[18px] top-9 h-[calc(100%+4px)] w-px ${
                  done ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border transition-colors ${
                isCancelStep
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : done
                    ? "border-primary/30 bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              {isCancelStep ? (
                <X className="size-4" />
              ) : done ? (
                <Check className="size-4" />
              ) : (
                <span className="size-2 rounded-full bg-current" />
              )}
            </span>
            <div className="min-w-0 pb-1">
              <p
                className={`text-sm font-semibold ${
                  done || isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {STATUS_LABEL[status]}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
                    Now
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {at ? formatDateTime(at) : STATUS_HINT[status]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
