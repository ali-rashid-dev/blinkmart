"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Megaphone, Send, ShoppingBasket, Loader2 } from "lucide-react";
import { toast } from "sonner";
// Switch removed: push controls are not persisted server-side
import {
  sendPromotionAction,
  getAdminOrderFeedAction,
  getAdminCampaignsAction,
} from "./actions";
import { formatRelative, KIND_LABEL } from "@/lib/notifications/types";
import type { AdminOrderNotificationRow, AdminCampaignRow } from "@/repositories/notification.repository";

type Tab = "promotional" | "orders";

const tabs: { value: Tab; label: string; icon: typeof Megaphone }[] = [
  { value: "promotional", label: "Promotional", icon: Megaphone },
  { value: "orders", label: "Orders", icon: ShoppingBasket },
];

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<Tab>("promotional");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "active" | "lapsed">("all");
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [orderFeed, setOrderFeed] = useState<AdminOrderNotificationRow[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaignRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const latestRequestRef = useRef(0);

  const fetchFeeds = async () => {
    const requestId = ++latestRequestRef.current;
    setLoadingData(true);
    setError(null);

    try {
      const [feedResult, campResult] = await Promise.allSettled([
        getAdminOrderFeedAction(),
        getAdminCampaignsAction(),
      ]);

      const feedRes =
        feedResult.status === "fulfilled"
          ? feedResult.value
          : { success: false as const, error: { message: feedResult.reason?.message ?? "Failed to load order feed" } };
      const campRes =
        campResult.status === "fulfilled"
          ? campResult.value
          : { success: false as const, error: { message: campResult.reason?.message ?? "Failed to load campaigns" } };

      let collectedError: string | null = null;

      if (requestId !== latestRequestRef.current) {
        return;
      }

      if (feedRes && feedRes.success) {
        setOrderFeed(feedRes.data);
      } else if (feedRes && !feedRes.success) {
        collectedError = feedRes.error.message;
      }

      if (campRes && campRes.success) {
        setCampaigns(campRes.data);
      } else if (campRes && !campRes.success) {
        collectedError = collectedError ? `${collectedError}; ${campRes.error.message}` : campRes.error.message;
      }

      if (collectedError) {
        setError(collectedError);
      }
    } catch (err: any) {
      if (requestId !== latestRequestRef.current) {
        return;
      }
      // Unexpected failure (e.g., network) — show a fallback message
      setError(err?.message ?? "Failed to load feeds");
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    void fetchFeeds();
  }, []);

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      toast.error("Please provide a headline");
      return;
    }
    if (!body.trim()) {
      toast.error("Please provide a message body");
      return;
    }

    startTransition(async () => {
      const res = await sendPromotionAction({
        headline,
        body,
        audience,
      });

      if (res.success) {
        toast.success("Campaign sent successfully!", {
          description: `Notification delivered to ${res.data.reach} customer${
            res.data.reach === 1 ? "" : "s"
          }.`,
        });
        setHeadline("");
        setBody("");
        void fetchFeeds();
      } else {
        toast.error("Failed to send campaign", { description: res.error.message });
      }
    });
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Compose promotional campaigns and watch order updates.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex items-center justify-between">
          <div>Failed to load notification feeds: {error}</div>
          <button
            onClick={() => void fetchFeeds()}
            disabled={loadingData}
            className="ml-4 inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      <div role="tablist" aria-label="Notification sections" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.value === tab;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setTab(t.value)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "promotional" && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={handleSendCampaign} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">New campaign</h2>
            <label className="mt-4 block text-sm font-semibold text-foreground" htmlFor="headline">
              Headline
            </label>
            <input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={48}
              placeholder="30% off seasonal fruit"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
            <label className="mt-4 block text-sm font-semibold text-foreground" htmlFor="body">
              Message
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={140}
              rows={3}
              placeholder="Fresh deals refreshed this morning — save on selected groceries."
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{body.length}/140</p>

            <label className="mt-2 block text-sm font-semibold text-foreground" htmlFor="audience">
              Audience
            </label>
            <select
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as "all" | "active" | "lapsed")}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="all">All customers</option>
              <option value="active">Ordered in last 30 days</option>
              <option value="lapsed">Lapsed customers</option>
            </select>

            <button
              type="submit"
              disabled={isPending}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {isPending ? "Sending..." : "Send campaign"}
            </button>
          </form>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Preview
              </p>
              <div className="mt-3 flex gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-muted-foreground"
                >
                  <Megaphone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {headline || "Your headline appears here"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {body || "Your promotional message appears here."}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Just now</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground">Recent campaigns</h3>
              {loadingData ? (
                <div className="mt-3 space-y-2">
                  <div className="h-14 w-full animate-pulse rounded-xl bg-muted/50" />
                </div>
              ) : campaigns.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No promotional campaigns sent yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {campaigns.map((c, i) => (
                    <li key={i} className="rounded-xl border border-border p-3">
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatRelative(c.sentAt.toString())} · {c.reach} reached
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Order notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatic messages sent as each basket moves through the delivery run.
          </p>

          {loadingData ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : orderFeed.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No order notifications generated yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {orderFeed.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {KIND_LABEL[o.kind]} · {o.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Sent to {o.userName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatRelative(o.createdAt.toString())}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Push controls removed: persistent server-side storage not available in this codebase */}
    </main>
  );
}
    
