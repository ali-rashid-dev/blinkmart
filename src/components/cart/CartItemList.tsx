import { CartItem } from "./CartItem";
import type { PendingKind } from "@/lib/cart/store";
import type { CartLine } from "@/lib/cart/types";

export function CartItemList({
  lines,
  pending,
}: {
  lines: CartLine[];
  pending: Record<string, PendingKind>;
}) {
  return (
    <ul aria-label="Cart items" className="space-y-3">
      {lines.map((line) => (
        <CartItem
          key={line.id}
          line={line}
          {...(pending[line.productId] ? { pending: pending[line.productId] } : {})}
        />
      ))}
    </ul>
  );
}
