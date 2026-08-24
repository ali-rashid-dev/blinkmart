import {
  Home,
  ShoppingBag,
  Package,
  User,
  Leaf,
  Milk,
  Apple,
  Sandwich,
  Beef,
  IceCream,
  Sparkles,
  Truck,
  Phone,
} from "lucide-react";

// ─── Shared session type ──────────────────────────────────────────────────────

export type NavSession = {
  user?: { name?: string | null; email?: string | null; image?: string | null };
} | null;

// ─── Grocery categories ───────────────────────────────────────────────────────

export const CATEGORIES = [
  { label: "Fresh Produce", href: "/products?category=produce", icon: Leaf },
  { label: "Dairy & Eggs",  href: "/products?category=dairy",   icon: Milk },
  { label: "Fruits",        href: "/products?category=fruits",  icon: Apple },
  { label: "Bakery",        href: "/products?category=bakery",  icon: Sandwich },
  { label: "Meat & Fish",   href: "/products?category=meat",    icon: Beef },
  { label: "Frozen",        href: "/products?category=frozen",  icon: IceCream },
  { label: "Snacks",        href: "/products?category=snacks",  icon: Sparkles },
] as const;

// ─── Desktop top-strip quick links ───────────────────────────────────────────

export const QUICK_LINKS = [
  { label: "Track Order", href: "/orders",  icon: Truck },
  { label: "Contact Us",  href: "/contact", icon: Phone },
] as const;

// ─── Mobile bottom nav tabs ───────────────────────────────────────────────────

export const MOBILE_NAV = [
  { label: "Home",    href: "/",        icon: Home },
  { label: "Shop",    href: "/products",icon: ShoppingBag },
  { label: "Orders",  href: "/orders",  icon: Package },
  { label: "Account", href: "/profile", icon: User },
] as const;
