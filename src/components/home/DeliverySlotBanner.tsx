"use client";

import { useEffect, useState } from "react";
import { Clock, Moon, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getHomePageSettings, type HomePageSettings } from "@/lib/home/home-config";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function DeliverySlotBanner() {
  const [now, setNow] = useState<Date | null>(null);
  const [cfg, setCfg] = useState<HomePageSettings>(getHomePageSettings);

  useEffect(() => {
    setNow(new Date());
    setCfg(getHomePageSettings());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="w-full rounded-2xl border border-border/80 bg-card p-4 shadow-xs animate-pulse h-20" />
    );
  }

  const cutoffHour = cfg.cutoffHour ?? 17;
  const hours = now.getHours();
  const isBeforeCutoff = hours < cutoffHour;

  let remainingMs = 0;
  if (isBeforeCutoff) {
    const cutoff = new Date(now);
    cutoff.setHours(cutoffHour, 0, 0, 0);
    remainingMs = Math.max(0, cutoff.getTime() - now.getTime());
  }

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSecs = Math.floor((remainingMs % (1000 * 60)) / 1000);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-4 sm:p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Delivery Slot Info */}
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-button">
            <Moon className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                <Sparkles className="size-3" />
                Evening Slot: {cfg.deliverySlotLabel}
              </span>
              {isBeforeCutoff ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  Same-Day Delivery Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Next Window: Tomorrow Evening
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-semibold text-foreground">
              {isBeforeCutoff
                ? `Orders placed before ${cutoffHour > 12 ? cutoffHour - 12 : cutoffHour}:00 PM arrive in tonight's run.`
                : `${cutoffHour > 12 ? cutoffHour - 12 : cutoffHour}:00 PM cutoff reached. Orders scheduled for tomorrow evening.`}
            </p>
          </div>
        </div>

        {/* Right Side: Cutoff Timer */}
        {isBeforeCutoff ? (
          <div className="flex items-center gap-2 rounded-xl bg-card/80 border border-border px-3 py-2 shrink-0 self-start md:self-auto backdrop-blur-xs">
            <Clock className="size-4 text-primary shrink-0" />
            <div className="text-xs">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                {cutoffHour > 12 ? cutoffHour - 12 : cutoffHour}:00 PM Cutoff In
              </span>
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                {pad(remainingHours)}h {pad(remainingMins)}m {pad(remainingSecs)}s
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 border border-border px-3 py-2 shrink-0 self-start md:self-auto">
            <Truck className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">
              Order now for Tomorrow Evening
            </span>
          </div>
        )}
      </div>

      {/* Feature Badges */}
      <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <span>Handpicked Quality Inspected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck className="size-3.5 text-primary shrink-0" />
          <span>Free Delivery &gt; Rs {cfg.freeDeliveryThreshold}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <Moon className="size-3.5 text-primary shrink-0" />
          <span>Guaranteed {cfg.deliverySlotLabel} Window</span>
        </div>
      </div>
    </div>
  );
}
