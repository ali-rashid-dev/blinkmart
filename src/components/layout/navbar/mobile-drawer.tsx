"use client";

import Link from "next/link";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { QUICK_LINKS } from "./constants";
import type { NavSession } from "./constants";
import { useNavbarCategories } from "./use-navbar-categories";

interface MobileDrawerProps {
  session: NavSession;
  onLogout: () => void;
}

const ACCOUNT_LINKS = [
  { label: "Profile",   href: "/profile",      icon: User },
  { label: "Orders",    href: "/orders",        icon: ShoppingBag },
  { label: "Notifications",href: "/notification",  icon: Bell },
] as const;

export function MobileDrawer({ session, onLogout }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const { categories } = useNavbarCategories();

  const name      = session?.user?.name  ?? null;
  const email     = session?.user?.email ?? null;
  const initial   = name  ? name.charAt(0).toUpperCase()
                  : email ? email.charAt(0).toUpperCase()
                  : "G";
  const isLoggedIn = !!session?.user;

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Hamburger trigger */}
      <SheetTrigger
        render={
          <button
            aria-label="Open menu"
            className="size-10 flex items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0 flex flex-col overflow-y-auto">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* ── Drawer header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <Link href="/" onClick={close} className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-foreground">
                BlinkMart
              </span>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
                Fresh &amp; Fast
              </p>
            </div>
          </Link>
        </div>

        {/* ── Logged-in user card ─────────────────────────────────────── */}
        {isLoggedIn && (
          <div className="px-4 py-3 border-b border-border bg-muted/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-semibold text-sm shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {name ?? "My Account"}
                </p>
                {email && (
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="px-4 py-3 flex-1 overflow-y-auto">

          {/* Categories */}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
            Shop by Category
          </p>
          <nav className="flex flex-col gap-0.5">
            {categories.map(({ id, label, emoji, href }) => (
              <Link
                key={id}
                href={href}
                onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="size-8 rounded-lg bg-primary/10 grid place-items-center shrink-0 text-base">
                  {emoji}
                </div>
                <span className="truncate">{label}</span>
              </Link>
            ))}
            <Link
              href="/products"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors mt-1"
            >
              <div className="size-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                <ShoppingBag className="size-4 text-primary" />
              </div>
              All Products
            </Link>
          </nav>

          {/* Quick links */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
              Quick Links
            </p>
            <nav className="flex flex-col gap-0.5">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.7} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account section */}
          {isLoggedIn ? (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                Account
              </p>
              <nav className="flex flex-col gap-0.5">
                {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.7} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={close}
                className="flex items-center justify-center py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={close}
                className="flex items-center justify-center py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-button"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* ── Sign-out footer ─────────────────────────────────────────── */}
        {isLoggedIn && (
          <div className="px-4 py-3 border-t border-border shrink-0">
            <button
              onClick={() => { close(); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-4 shrink-0" />
              Sign Out
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
