"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ShoppingBag,
  DollarSign,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  RefreshCw,
  MapPin,
  User,
  Phone,
  AlertTriangle,
  ArrowRight,
  Printer,
  Loader2,
  Package,
  X,
  FileText,
} from "lucide-react";

import {
  getAdminOrdersAction,
  getAdminOrderStatsAction,
  updateAdminOrderStatusAction,
} from "./actions";

import type { Order, OrderStatus } from "@/lib/orders/types";
import type { AdminOrderStats } from "@/repositories/order.repository";
import { formatDateTime, formatDeliveryDate } from "@/lib/orders/types";

// Status configuration map for styling and UI
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  placed: {
    label: "Placed",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
    icon: CheckCircle2,
  },
  packed: {
    label: "Packed",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    icon: PackageCheck,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    icon: XCircle,
  },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "packed",
  packed: "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  placed: "Confirm Order",
  confirmed: "Mark Packed",
  packed: "Dispatch Order",
  out_for_delivery: "Mark Delivered",
};

const DB_STATUS_MAP: Record<OrderStatus, "PLACED" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"> = {
  placed: "PLACED",
  confirmed: "CONFIRMED",
  packed: "PACKED",
  out_for_delivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

// ──────────────────────────────────────────────────────────
// Order Details Inspection & Management Modal
// ──────────────────────────────────────────────────────────
function OrderDetailsModal({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => Promise<void>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("placed");
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setCancelReasonInput(order.cancelReason || "");
      setShowCancelPrompt(order.status === "cancelled");
    }
  }, [order]);

  if (!order) return null;

  const StatusIcon = STATUS_CONFIG[order.status].icon;

  async function handleStatusSave() {
    if (!order) return;
    if (selectedStatus === "cancelled" && !cancelReasonInput.trim()) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateStatus(
        order.id,
        selectedStatus,
        selectedStatus === "cancelled" ? cancelReasonInput.trim() : undefined
      );
      toast.success(`Order ${order.code} updated to ${STATUS_CONFIG[selectedStatus].label}`);
    } catch {
      // Error handled by parent
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card scrollbar-none">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                    {order.code}
                  </span>
                  <Badge
                    variant="outline"
                    className={`${STATUS_CONFIG[order.status].bg} ${STATUS_CONFIG[order.status].text} ${STATUS_CONFIG[order.status].border} px-2.5 py-0.5 font-medium flex items-center gap-1.5`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {STATUS_CONFIG[order.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Placed on {formatDateTime(order.placedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrintSlip(true)}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Packing Slip
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Transition Control */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" /> Update Order Lifecycle Status
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Advance the order through processing or cancel if necessary.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      const next = e.target.value as OrderStatus;
                      setSelectedStatus(next);
                      setShowCancelPrompt(next === "cancelled");
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <Button
                    size="sm"
                    onClick={handleStatusSave}
                    disabled={isUpdating || selectedStatus === order.status}
                    className="gap-1.5"
                  >
                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Update Status
                  </Button>
                </div>
              </div>

              {showCancelPrompt && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-xs font-medium text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Cancellation Reason
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    placeholder="Enter reason for order cancellation..."
                    className="w-full rounded-md border border-destructive/40 bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                  />
                </div>
              )}
            </div>

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Customer Details
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-foreground">{order.address.fullName}</div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>{order.address.phone}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Shipping Address & Slot
                </h4>

                <div className="space-y-1.5 text-xs text-foreground">
                  <p className="font-medium">
                    {order.address.house}, {order.address.street}
                  </p>
                  <p className="text-muted-foreground">
                    {order.address.area}, {order.address.city} - {order.address.postal}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-primary font-medium text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDeliveryDate(order.deliveryDate)} ({order.deliverySlot})
                    </span>
                  </div>

                  {order.address.notes && (
                    <div className="mt-2 text-xs bg-muted/40 p-2 rounded-md italic text-muted-foreground">
                      "{order.address.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/40 px-4 py-2.5 border-b border-border font-medium text-xs text-muted-foreground flex justify-between">
                <span>Order Items ({order.items.length})</span>
                <span>Unit Price & Subtotal</span>
              </div>

              <div className="divide-y divide-border">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-lg border border-border bg-accent overflow-hidden grid place-items-center">
                        {item.image && item.image.startsWith("http") ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {item.unit}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        Rs {Math.round(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rs {Math.round(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Summary */}
              <div className="bg-muted/20 p-4 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal</span>
                  <span>Rs {Math.round(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? "FREE" : `Rs ${order.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                  <span>Total Order Amount</span>
                  <span className="text-primary font-serif">Rs {Math.round(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Order Timeline & Audit Logs
              </h4>

              <div className="space-y-3 pt-1">
                {order.timeline.map((evt, idx) => {
                  const EvtIcon = STATUS_CONFIG[evt.status]?.icon || Clock;
                  return (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${STATUS_CONFIG[evt.status]?.bg || "bg-muted"
                          } ${STATUS_CONFIG[evt.status]?.text || "text-foreground"}`}
                      >
                        <EvtIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <span className="font-semibold text-foreground capitalize">
                          {STATUS_CONFIG[evt.status]?.label || evt.status}
                        </span>
                        <p className="text-muted-foreground">{formatDateTime(evt.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable Invoice / Packing Slip Modal */}
      <Dialog open={showPrintSlip} onOpenChange={setShowPrintSlip}>
        <DialogContent className="max-w-2xl bg-white text-black p-8 printable-slip">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-gray-300 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">BlinkMart</h2>
                <p className="text-xs text-gray-500">Order Delivery & Packing Slip</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold">{order.code}</p>
                <p className="text-xs text-gray-500">Date: {formatDateTime(order.placedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-300 pb-4">
              <div>
                <p className="font-bold text-gray-700 uppercase">Customer Information</p>
                <p className="font-semibold">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className="font-bold text-gray-700 uppercase">Delivery Window & Address</p>
                <p>{formatDeliveryDate(order.deliveryDate)} ({order.deliverySlot})</p>
                <p>{order.address.house}, {order.address.street}</p>
                <p>{order.address.area}, {order.address.city}</p>
              </div>
            </div>

            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 font-bold">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{item.name}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">Rs {Math.round(item.price)}</td>
                      <td className="py-2 text-right">Rs {Math.round(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-300 pt-3 text-xs space-y-1 text-right">
              <p>Subtotal: Rs {Math.round(order.subtotal)}</p>
              <p>Delivery: {order.deliveryFee === 0 ? "FREE" : `Rs ${order.deliveryFee}`}</p>
              <p className="text-sm font-bold text-gray-900 pt-1">Total: Rs {Math.round(order.total)}</p>
            </div>

            <div className="pt-6 text-center text-[10px] text-gray-500 border-t border-gray-200">
              Thank you for ordering with BlinkMart. If you have questions, please contact customer support.
            </div>

            <div className="no-print flex justify-end gap-2 pt-2">
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1.5" /> Print Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Cancellation Dialog Prompt
// ──────────────────────────────────────────────────────────
function CancellationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Cancel Order
          </DialogTitle>
          <DialogDescription className="pt-2 text-foreground text-xs">
            Please provide a cancellation reason for the customer's record.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Customer requested cancellation due to incorrect delivery address."
            className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Please provide a reason.");
                return;
              }
              onConfirm(reason.trim());
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
// Main Admin Orders Page Component
// ──────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State parameters
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status") ?? "all";
  const deliveryDateParam = searchParams.get("deliveryDate") ?? "";
  const rawPage = Number(searchParams.get("page") ?? "");
  const rawLimit = Number(searchParams.get("limit") ?? "");

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  // Local component states
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(search);
  const [selectedInspectOrder, setSelectedInspectOrder] = useState<Order | null>(null);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // URL Helper updates
  function updateQuery(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  // Load Data
  const requestIdRef = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const [ordersRes, statsRes] = await Promise.all([
        getAdminOrdersAction({
          search,
          status: statusParam,
          deliveryDate: deliveryDateParam,
          page,
          limit,
        }),
        getAdminOrderStatsAction(),
      ]);

      if (requestId !== requestIdRef.current) return;

      if (ordersRes.success) {
        setOrders(ordersRes.data.items);
        setTotalItems(ordersRes.data.totalItems);
        setTotalPages(ordersRes.data.totalPages);
      } else {
        toast.error(ordersRes.error.message);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      toast.error((error as Error).message || "Failed to load admin orders.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [search, statusParam, deliveryDateParam, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Status transitions handler
  async function handleUpdateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    cancelReason?: string
  ) {
    const dbStatus = DB_STATUS_MAP[newStatus];
    const res = await updateAdminOrderStatusAction({
      orderId,
      status: dbStatus,
      cancelReason: cancelReason || null,
    });

    if (res.success) {
      toast.success(`Order status updated to ${STATUS_CONFIG[newStatus].label}`);
      setSelectedInspectOrder(res.data);
      loadData();
    } else {
      toast.error(res.error.message);
    }
  }

  // Next Step Transition shortcut
  function handleAdvanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    startTransition(async () => {
      await handleUpdateOrderStatus(order.id, next);
    });
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Admin Orders"
        description="Monitor, manage, and process customer grocery orders and delivery runs."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold font-serif text-foreground">
                {stats ? stats.totalOrders : "..."}
              </h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats ? `${stats.todayOrdersCount} placed today` : ""}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold font-serif text-foreground">
                Rs {stats ? Math.round(stats.totalRevenue).toLocaleString() : "..."}
              </h3>
              <p className="text-xs text-muted-foreground">Non-cancelled orders</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Dispatch
              </p>
              <h3 className="text-2xl font-bold font-serif text-foreground">
                {stats
                  ? stats.placedCount + stats.confirmedCount + stats.packedCount
                  : "..."}
              </h3>
              <p className="text-xs text-amber-600 font-medium">
                {stats ? `${stats.placedCount} new placed` : ""}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <PackageCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Out & Delivered
              </p>
              <h3 className="text-2xl font-bold font-serif text-foreground">
                {stats ? stats.outForDeliveryCount + stats.deliveredCount : "..."}
              </h3>
              <p className="text-xs text-purple-600 font-medium">
                {stats ? `${stats.outForDeliveryCount} in transit` : ""}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "all", label: "All Orders", count: stats?.totalOrders },
            { key: "placed", label: "Placed", count: stats?.placedCount },
            { key: "confirmed", label: "Confirmed", count: stats?.confirmedCount },
            { key: "packed", label: "Packed", count: stats?.packedCount },
            { key: "out_for_delivery", label: "Out for Delivery", count: stats?.outForDeliveryCount },
            { key: "delivered", label: "Delivered", count: stats?.deliveredCount },
            { key: "cancelled", label: "Cancelled", count: stats?.cancelledCount },
          ].map((tab) => {
            const active = statusParam === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => updateQuery({ status: tab.key === "all" ? "" : tab.key })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Date Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              updateQuery({ search: e.target.value });
            }}
            placeholder="Search by code (e.g. ORD-123), customer name, phone, city..."
            className="pl-9 text-xs"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                updateQuery({ search: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Delivery Date Filter */}
          <div className="relative">
            <Input
              type="date"
              value={deliveryDateParam}
              onChange={(e) => updateQuery({ deliveryDate: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          {deliveryDateParam && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateQuery({ deliveryDate: "" })}
              className="text-xs h-9"
            >
              Clear Date
            </Button>
          )}

          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => updateQuery({ limit: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm font-medium">Loading orders data...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-3">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/60" />
            <h3 className="text-base font-semibold text-foreground">No orders found</h3>
            <p className="text-xs max-w-sm mx-auto">
              There are no orders matching your current search terms or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Code</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Delivery Run</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const StatusIcon = STATUS_CONFIG[order.status].icon;
                  const nextStatus = NEXT_STATUS[order.status];
                  const nextLabel = NEXT_STATUS_LABEL[order.status];

                  return (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      {/* Order Code */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono font-bold text-foreground text-sm block">
                          {order.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {formatDateTime(order.placedAt)}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4 align-top max-w-[200px]">
                        <p className="font-semibold text-foreground truncate">
                          {order.address.fullName}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{order.address.phone}</span>
                        </p>
                        <p className="text-muted-foreground truncate text-[11px] mt-0.5">
                          {order.address.area}, {order.address.city}
                        </p>
                      </td>

                      {/* Delivery Run */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-medium text-foreground block">
                          {formatDeliveryDate(order.deliveryDate)}
                        </span>
                        <span className="text-muted-foreground text-[11px] block mt-0.5">
                          {order.deliverySlot}
                        </span>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3 px-4 align-top max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-accent overflow-hidden"
                              >
                                {item.image && item.image.startsWith("http") ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-3.5 w-3.5 m-1.5 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {order.items[0]?.name || "Items"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {order.items.length} item{order.items.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 align-top text-right font-semibold text-foreground font-serif text-sm">
                        Rs {Math.round(order.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 align-top text-center">
                        <Badge
                          variant="outline"
                          className={`${STATUS_CONFIG[order.status].bg} ${STATUS_CONFIG[order.status].text} ${STATUS_CONFIG[order.status].border} px-2.5 py-0.5 font-medium inline-flex items-center gap-1.5`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {STATUS_CONFIG[order.status].label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right space-x-1">
                        {nextStatus && nextLabel && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdvanceStatus(order)}
                            disabled={isPending}
                            className="h-8 text-[11px] gap-1 px-2 py-0 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <span>{nextLabel}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedInspectOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>

                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => setSelectedCancelOrder(order)}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{orders.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> orders
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuery({ page: String(page - 1) })}
                disabled={page <= 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="font-medium text-foreground">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuery({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect & Update Modal */}
      <OrderDetailsModal
        order={selectedInspectOrder}
        open={Boolean(selectedInspectOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedInspectOrder(null);
        }}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      {/* Cancellation Modal */}
      <CancellationDialog
        open={Boolean(selectedCancelOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedCancelOrder(null);
        }}
        onConfirm={async (reason) => {
          if (!selectedCancelOrder) return;
          await handleUpdateOrderStatus(selectedCancelOrder.id, "cancelled", reason);
          setSelectedCancelOrder(null);
        }}
        isPending={isPending}
      />
    </div>
  );
}
