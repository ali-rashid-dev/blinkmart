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
  { label: "Flour & Grains",      href: "/products?category=flour-grains",     icon: Leaf },
  { label: "Pulses & Lentils",    href: "/products?category=pulses-lentils",   icon: Package },
  { label: "Cooking Oils & Ghee", href: "/products?category=cooking-oils-ghee",icon: Sandwich },
  { label: "Spices & Seasonings", href: "/products?category=spices-seasonings",icon: Sparkles },
  { label: "Tea & Beverages",     href: "/products?category=tea-coffee-beverages", icon: Milk },
  { label: "Biscuits & Snacks",   href: "/products?category=biscuits-snacks",  icon: Sparkles },
  { label: "Personal Care",       href: "/products?category=personal-care",    icon: User },
  { label: "Home Cleaning",       href: "/products?category=home-cleaning",    icon: Home },
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
