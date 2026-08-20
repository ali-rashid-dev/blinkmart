import { BadgePercent, CheckCircle2, PackageCheck, ShoppingBag, Truck, X, XCircle, CheckCheck } from "lucide-react";
import {
  KIND_LABEL,
  KIND_STYLE,
  formatRelative,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications/types";

const icon: Record<NotificationKind, typeof CheckCircle2> = {
  placed: ShoppingBag,
  confirmed: CheckCircle2,
  packed: PackageCheck,
  out_for_delivery: Truck,
  delivered: CheckCheck,
  cancelled: XCircle,
  promotion: BadgePercent,
};

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const Icon = icon[notification.kind];
  return (
    <li
      className={`group relative flex gap-4 rounded-2xl border p-4 transition-colors ${
        notification.read ? "border-border bg-card" : "border-primary/20 bg-primary/[0.04]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid size-10 shrink-0 place-items-center rounded-full border ${KIND_STYLE[notification.kind]}`}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${KIND_STYLE[notification.kind]}`}
          >
            {KIND_LABEL[notification.kind]}
          </span>
          {!notification.read && (
            <span aria-label="Unread" className="size-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{notification.body}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <time>{formatRelative(notification.at)}</time>
          {!notification.read && (
            <button
              type="button"
              onClick={() => onRead(notification.id)}
              className="font-semibold text-primary transition-colors hover:underline"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label={`Dismiss ${notification.title}`}
        onClick={() => onDismiss(notification.id)}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}
