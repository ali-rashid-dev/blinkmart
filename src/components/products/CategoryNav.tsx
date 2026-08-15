"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type NavCategory = { id: string; label: string; emoji?: string };

const GAP = 8; // px, matches gap-2

export function CategoryNav({
  categories,
  selectedId,
  onSelect,
  className,
}: {
  categories: NavCategory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);
  const [measured, setMeasured] = useState(false);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const available = container.clientWidth;
    const widths = Array.from(measure.children).map(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    const moreWidth = moreRef.current?.getBoundingClientRect().width ?? 96;

    let used = 0;
    let count = 0;
    for (let i = 0; i < widths.length; i++) {
      const next = used + (i === 0 ? 0 : GAP) + widths[i]!;
      const isLast = i === widths.length - 1;
      const needsMore = !isLast;
      const budget = needsMore ? available - (GAP + moreWidth) : available;
      if (next <= budget) {
        used = next;
        count = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(1, count));
    setMeasured(true);
  }, []);

  useLayoutEffect(() => {
    recalculate();
  }, [recalculate, categories]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalculate);
    });
    ro.observe(container);
    if (measureRef.current) ro.observe(measureRef.current);
    window.addEventListener("resize", recalculate);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", recalculate);
    };
  }, [recalculate]);

  const visible = categories.slice(0, visibleCount);
  const hidden = categories.slice(visibleCount);
  const hiddenHasSelected = hidden.some((c) => c.id === selectedId);

  const pill = (active: boolean) =>
    cn(
      "inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm transition-colors duration-200",
      active
        ? "bg-primary font-bold text-primary-foreground"
        : "bg-transparent font-medium text-foreground hover:bg-accent/70 hover:text-primary",
    );

  return (
    <div className={cn("relative w-full", className)}>
      {/* hidden measuring row — never visible, used for width calculation */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 flex h-0 w-full flex-nowrap gap-2 overflow-hidden opacity-0"
      >
        {categories.map((c) => (
          <span key={c.id} className={pill(true)}>
            {c.emoji ? <span aria-hidden="true">{c.emoji}</span> : null}
            {c.label}
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        role="tablist"
        aria-label="Product categories"
        className={cn(
          "flex w-full flex-nowrap items-center gap-2 overflow-hidden",
          measured ? "opacity-100" : "opacity-0",
        )}
      >
        {visible.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={selectedId === c.id}
            onClick={() => onSelect?.(c.id)}
            className={pill(selectedId === c.id)}
          >
            {c.emoji ? <span aria-hidden="true">{c.emoji}</span> : null}
            {c.label}
          </button>
        ))}

        <div ref={moreRef} className={cn("shrink-0", hidden.length === 0 && "hidden")}>
          <DropdownMenu>
            <DropdownMenuTrigger className={pill(hiddenHasSelected)}>
              More
              <ChevronDown aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="max-h-[400px] w-[min(22rem,90vw)] overflow-y-auto rounded-2xl p-2"
            >
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {hidden.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onSelect={() => onSelect?.(c.id)}
                    className={cn(
                      "min-h-11 cursor-pointer gap-2 rounded-xl px-3 text-sm",
                      selectedId === c.id && "bg-primary font-bold text-primary-foreground",
                    )}
                  >
                    {c.emoji ? <span aria-hidden="true">{c.emoji}</span> : null}
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
