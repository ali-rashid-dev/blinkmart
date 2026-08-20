"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  Truck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { formatDateTime, formatDeliveryDate } from "@/lib/orders/types";
import { STATUS_CONFIG } from "./admin-orders-config";

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => Promise<{
    success: boolean;
    data?: Order;
    error?: any;
  }>;
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
      const res = await onUpdateStatus(
        order.id,
        selectedStatus,
        selectedStatus === "cancelled" ? cancelReasonInput.trim() : undefined
      );

      if (res && res.success) {
        toast.success(`Order ${order.code} updated to ${STATUS_CONFIG[selectedStatus].label}`);
      } else if (res && res.error) {
        toast.error(res.error.message || "Failed to update order status.");
      }
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
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {item.unit}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        Rs {Math.round(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">Rs {Math.round(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>

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

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Order Timeline & Audit Logs
              </h4>

              <div className="space-y-3 pt-1">
                {order.timeline.map((evt, idx) => {
                  const EvtIcon = STATUS_CONFIG[evt.status]?.icon || CheckCircle2;
                  return (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${STATUS_CONFIG[evt.status]?.bg || "bg-muted"} ${STATUS_CONFIG[evt.status]?.text || "text-foreground"}`}
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
                <p>
                  {formatDeliveryDate(order.deliveryDate)} ({order.deliverySlot})
                </p>
                <p>
                  {order.address.house}, {order.address.street}
                </p>
                <p>
                  {order.address.area}, {order.address.city}
                </p>
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
