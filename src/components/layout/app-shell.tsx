"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Tag, Store, Package, Boxes, ShoppingBag, Truck,
  BarChart3, Bell, Menu, Search, LogOut, KeyRound, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/brands", label: "Brands", icon: Store },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/deliveries", label: "Deliveries", icon: Truck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1 px-3 pb-4", collapsed && "px-2")}>
      {nav.map((item) => {
        const active = (item.href as string) === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        const Icon = item.icon;
        const link = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center px-2",
            )}
            aria-label={collapsed ? item.label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={item.href} delayDuration={200}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          link
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 px-5 py-5", collapsed && "justify-center px-3")}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-organic">
        <span className="font-serif text-lg font-semibold">H</span>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="font-serif text-lg leading-none">Harvest</div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Admin Panel</div>
        </div>
      )}
    </Link>
  );
}

function AccountCard({ collapsed, signOut }: { collapsed?: boolean; signOut: () => void }) {
  const { data: session } = authClient.useSession();
  const email = session?.user?.email || "admin@example.com";
  const name = session?.user?.name || "Admin";
  const initial = name ? name.charAt(0).toUpperCase() : "A";

  if (collapsed) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-organic">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground grid place-items-center font-serif text-sm">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{name}</div>
          <div className="text-xs text-muted-foreground truncate">{email}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-1">
        <Button variant="ghost" size="sm" className="justify-start h-8 px-2 text-alert hover:text-alert hover:bg-alert/10" onClick={signOut}>
          <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pending = 0;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex w-full">
        <aside
          className={cn(
            "hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <Brand collapsed={collapsed} />
          <div className="mt-2 overflow-y-auto flex-1">
            <NavList collapsed={collapsed} />
          </div>
          <div className="mt-auto p-4">
            <AccountCard collapsed={collapsed} signOut={handleSignOut} />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 backdrop-blur px-4 md:px-6 h-16 print:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar overflow-y-auto">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <NavList onNavigate={() => setOpen(false)} />
                {/* <div className="p-4"><AccountCard signOut={handleSignOut} /></div> */}
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>

          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
