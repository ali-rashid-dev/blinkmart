import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function CartHeader({ itemCount }: { itemCount: number }) {
  return (
    <header className="animate-rise">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/products" className="transition-colors hover:text-primary">
              Products
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="font-semibold text-foreground">
            Cart
          </li>
        </ol>
      </nav>

      <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
        Your Cart
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>
    </header>
  );
}
