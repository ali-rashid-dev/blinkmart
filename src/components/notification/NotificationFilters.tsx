import type { NotificationFilter } from "@/lib/notifications/types";

const options: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "orders", label: "Orders" },
  { value: "promotion", label: "Promotions" },
];

export function NotificationFilters({
  value,
  counts,
  onChange,
}: {
  value: NotificationFilter;
  counts: Record<NotificationFilter, number>;
  onChange: (next: NotificationFilter) => void;
}) {
  return (
    <div role="tablist" aria-label="Filter notifications" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
            <span className={`text-xs ${active ? "opacity-80" : "opacity-60"}`}>
              {counts[o.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
