"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/notifications/store";

export function NotificationBadge({ className }: { className?: string }) {
  const { unread } = useNotifications();

  return (
    <Link
      href="/notification"
      aria-label={`Notifications, ${unread} unread`}
      className={`relative inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary ${className ?? ""}`}
    >
      <Bell className="size-5" aria-hidden="true" />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground animate-in zoom-in-50"
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
