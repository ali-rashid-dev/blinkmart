"use client";

import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { EmptyNotifications } from "@/components/notification/EmptyNotifications";
import { NotificationFilters } from "@/components/notification/NotificationFilters";
import { NotificationItem } from "@/components/notification/NotificationItem";
import { notificationsStore, useNotifications } from "@/lib/notifications/store";
import { matchesFilter, type NotificationFilter } from "@/lib/notifications/types";

export default function NotificationsPage() {
  const { list, unread, loading, error, refresh } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const counts = useMemo(
    () => ({
      all: list.length,
      unread,
      orders: list.filter((n) => n.kind !== "promotion").length,
      promotion: list.filter((n) => n.kind === "promotion").length,
    }),
    [list, unread]
  );

  const rows = list.filter((n) => matchesFilter(n, filter));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread update${unread > 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => notificationsStore.markAllRead()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted active:scale-[0.98]"
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6">
        <NotificationFilters value={filter} counts={counts} onChange={setFilter} />
      </div>

      {loading && list.length === 0 ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex items-center justify-between">
              <div>Failed to load notification feed: {error}</div>
              <button
                onClick={() => refresh()}
                className="ml-4 inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground"
              >
                Retry
              </button>
            </div>
          )}

          {list.length === 0 ? (
            <EmptyNotifications message="Order updates and promotions will appear here as soon as they arrive." />
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No notifications match the selected filter. Try clearing the filter to view all notifications.
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={notificationsStore.markRead}
                  onDismiss={notificationsStore.remove}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
