"use client";

import Link from "next/link";
import { ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { notificationsStore } from "@/lib/notifications/store";
import { CartBadge } from "@/components/cart/CartBadge";
import { NotificationBadge } from "@/components/notification/NotificationBadge";
import { Logo } from "@/components/ui/logo";

import { CATEGORIES, QUICK_LINKS } from "./constants";
import { SearchBar } from "./search-bar";
import { CategoryDropdown } from "./category-dropdown";
import { AccountMenu } from "./account-menu";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useNavbarCategories } from "./use-navbar-categories";

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { categories } = useNavbarCategories();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          try { notificationsStore.reset(); } catch (_) { /* best-effort */ }
          router.push("/login");
        },
      },
    });
  };

  return (
    <>
      {/* ── Desktop top strip ────────────────────────────────────────── */}
      <div className="hidden lg:block border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 flex items-center justify-between h-9 text-xs">
          <span className="flex items-center gap-1.5">
            <Truck className="size-3.5" />
            Free delivery on orders of Rs. 3,000 or more
          </span>
          <div className="flex items-center gap-4">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────────────── */}
      <header
        id="main-navbar"
        className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-xs"
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-3 h-16">
            {/* Mobile Drawer & Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 shrink-0">
              <Logo href="/" variant="full" size="sm" priority />
            </div>

            {/* Desktop Logo */}
            <div className="hidden lg:flex items-center shrink-0">
              <Logo href="/" variant="full" size="md" priority />
            </div>

            {/* Desktop categories */}
            <div className="hidden lg:flex ml-2">
              <CategoryDropdown categories={categories} />
            </div>

            {/* Search bar */}
            <div className="flex-1 min-w-0 mx-2 lg:mx-4">
              <SearchBar className="max-w-2xl mx-auto lg:mx-0" />
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notifications — visible on all screens */}
              <NotificationBadge />

              {/* Cart */}
              <CartBadge />

              {/* Account — desktop only */}
              <div className="hidden lg:block ml-1">
                <AccountMenu session={session} />
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile: fixed bottom nav */}
      <MobileBottomNav />
    </>
  );
}
