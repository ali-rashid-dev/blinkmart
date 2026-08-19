import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/types";

const style: Record<OrderStatus, string> = {
  placed: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-secondary/10 text-secondary border-secondary/20",
  packed: "bg-secondary/10 text-secondary border-secondary/20",
  out_for_delivery: "bg-primary/10 text-primary border-primary/25",
  delivered: "bg-success/10 text-success border-success/25",
  cancelled: "bg-destructive/10 text-destructive border-destructive/25",
};

const icon: Record<OrderStatus, typeof Clock> = {
  placed: Clock,
  confirmed: CheckCircle2,
  packed: PackageCheck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const Icon = icon[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style[status]}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}
