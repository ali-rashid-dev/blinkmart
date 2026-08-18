"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { CartBadge } from "@/components/cart/CartBadge";

export const Navbar = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <div className="border-b border-border bg-background shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display text-xl font-bold text-foreground">
              BlinkMart
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Shop Products
            </Link>
          </div>

          <nav className="flex items-center space-x-3">
            <CartBadge />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Register
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
