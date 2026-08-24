"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV } from "./constants";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 lg:hidden",
        "border-t border-border bg-background/95 backdrop-blur-md",
        "flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      )}
    >
      {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname?.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors min-w-0",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "size-8 flex items-center justify-center rounded-xl transition-all",
                isActive && "bg-primary/10"
              )}
            >
              <Icon
                className={cn("size-5")}
                strokeWidth={isActive ? 2 : 1.6}
              />
            </span>
            <span
              className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
