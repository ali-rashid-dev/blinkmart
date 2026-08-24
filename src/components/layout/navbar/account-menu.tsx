"use client";

import Link from "next/link";
import {
  ChevronDown,
  User,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { notificationsStore } from "@/lib/notifications/store";
import type { NavSession } from "./constants";
import { UserAvatar } from "./user-avatar";

interface AccountMenuProps {
  session: NavSession;
}

const ACCOUNT_LINKS = [
  { label: "Profile",      href: "/profile",           icon: User },
  { label: "Orders",       href: "/orders",            icon: ShoppingBag },
] as const;

export function AccountMenu({ session }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const name      = session?.user?.name  ?? null;
  const email     = session?.user?.email ?? null;
  const image     = session?.user?.image ?? null;
  const isLoggedIn = !!session?.user;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          try { notificationsStore.reset(); } catch (_) { /* best-effort */ }
          router.push("/login");
        },
      },
    });
  };

  // ── Guest state ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Authenticated state ─────────────────────────────────────────────────────
  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "flex items-center rounded-full border transition-all duration-200",
          open
            ? "border-primary/40 bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/30 hover:bg-accent"
        )}
      >
        <UserAvatar image={image} name={name} email={email} className="size-9" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-56 rounded-xl border border-border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
          )}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <UserAvatar image={image} name={name} email={email} className="size-10 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {name ?? "My Account"}
              </p>
              {email && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {email}
                </p>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="p-1.5">
            {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon className="size-4 text-muted-foreground shrink-0" strokeWidth={1.7} />
                {label}
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <div className="border-t border-border p-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
