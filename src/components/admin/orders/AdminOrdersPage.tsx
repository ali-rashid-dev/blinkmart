"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingBag,
  PackageCheck,
  Truck,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Phone,
  ArrowRight,
  Loader2,
  Package,
  X,
  Wallet,
} from "lucide-react";

import {
  getAdminOrdersAction,
  getAdminOrderStatsAction,
  updateAdminOrderStatusAction,
} from "@/app/(admin-plane)/admin/orders/actions";

import type { Order, OrderStatus } from "@/lib/orders/types";
import { formatDateTime, formatDeliveryDate } from "@/lib/orders/types";
import type { AdminOrderStats } from "@/repositories/order.repository";
import { CancellationDialog } from "@/components/admin/orders/CancellationDialog";
import {
  STATUS_CONFIG,
  NEXT_STATUS,
  NEXT_STATUS_LABEL,
  DB_STATUS_MAP,
  sanitizeOrderUpdateError,
} from "@/components/admin/orders/admin-orders-config";

export function AdminOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status") ?? "all";
  const deliveryDateParam = searchParams.get("deliveryDate") ?? "";
  const rawPage = Number(searchParams.get("page") ?? "");
  const rawLimit = Number(searchParams.get("limit") ?? "");

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(search);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const searchDebounceRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, []);

  function updateQuery(updates: Record<string, string>, method: "push" | "replace" = "push") {
    const params = new URLSearchParams(searchParams.toString());
    const isPageUpdate = Object.prototype.hasOwnProperty.call(updates, "page");
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (!isPageUpdate) params.delete("page");
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (method === "replace") router.replace(url);
    else router.push(url);
  }

  const requestIdRef = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const [ordersRes, statsRes] = await Promise.all([
        getAdminOrdersAction({
          search: search.trim() ? search.trim() : undefined,
          status: statusParam === "all" || !statusParam.trim() ? undefined : statusParam.trim(),
          deliveryDate: deliveryDateParam.trim() ? deliveryDateParam.trim() : undefined,
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
      } else {
        toast.error(statsRes.error.message || "Failed to load order statistics.");
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

  async function handleUpdateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    cancelReason?: string
  ): Promise<{ success: boolean; data?: Order; error?: any }> {
    const dbStatus = DB_STATUS_MAP[newStatus];
    const res = await updateAdminOrderStatusAction({
      orderId,
      status: dbStatus,
      cancelReason: cancelReason || null,
    });

    if (res.success) {
      const updatedOrder = res.data;

      setOrders((prevOrders) => {
        if (statusParam && statusParam !== "all" && statusParam.toLowerCase() !== newStatus.toLowerCase()) {
          void loadData();
          return prevOrders.filter((o) => o.id !== orderId);
        }
        return prevOrders.map((o) => (o.id === orderId ? updatedOrder : o));
      });

      const statsRes = await getAdminOrderStatsAction();
      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        toast.error(statsRes.error.message || "Failed to refresh order stats.");
      }

      return { success: true, data: updatedOrder };
    }

    return {
      success: false,
      error: {
        ...res.error,
        message: sanitizeOrderUpdateError(res.error),
      },
    };
  }

  function handleAdvanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    startTransition(async () => {
      const res = await handleUpdateOrderStatus(order.id, next);

      if (res.success) {
        toast.success(`Order ${order.code} updated to ${STATUS_CONFIG[next].label}`);
      } else {
        toast.error(sanitizeOrderUpdateError(res.error));
      }
    });
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Admin Orders"
        description="Monitor, manage, and process customer grocery orders and delivery runs."
        actions={
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            key: "open_orders",
            label: "OPEN ORDERS",
            value: stats ? (stats.placedCount + stats.confirmedCount).toLocaleString() : "...",
            icon: Clock,
            statusTarget: "placed",
            isActive: statusParam === "placed" || statusParam === "confirmed",
          },
          {
            key: "to_pack",
            label: "TO PACK",
            value: stats ? stats.packedCount.toLocaleString() : "...",
            icon: PackageCheck,
            statusTarget: "packed",
            isActive: statusParam === "packed",
          },
          {
            key: "out_for_delivery",
            label: "OUT FOR DELIVERY",
            value: stats ? stats.outForDeliveryCount.toLocaleString() : "...",
            icon: Truck,
            statusTarget: "out_for_delivery",
            isActive: statusParam === "out_for_delivery",
          },
          {
            key: "cancelled",
            label: "CANCELLED",
            value: stats ? stats.cancelledCount.toLocaleString() : "...",
            icon: XCircle,
            statusTarget: "cancelled",
            isActive: statusParam === "cancelled",
          },
          {
            key: "revenue",
            label: "REVENUE",
            value: stats ? `Rs ${Math.round(stats.totalRevenue).toLocaleString()}` : "...",
            icon: Wallet,
            statusTarget: "delivered",
            isActive: statusParam === "delivered",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              aria-pressed={item.isActive}
              onClick={() => updateQuery({ status: item.statusTarget })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  updateQuery({ status: item.statusTarget });
                }
              }}
              className={`flex items-center gap-3 rounded-2xl border bg-card/90 px-4 py-3.5 shadow-xs transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                item.isActive
                  ? "border-primary ring-1 ring-primary/40 bg-primary/5 dark:bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-accent/40"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-foreground/80 shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase truncate">
                  {item.label}
                </p>
                <p className="font-serif text-lg font-bold tracking-tight text-foreground truncate mt-0.5">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

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
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${active
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${active
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => {
              const v = e.target.value;
              setSearchInput(v);
              if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
              // @ts-ignore
              searchDebounceRef.current = window.setTimeout(() => updateQuery({ search: v }, "replace"), 350);
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
          <div className="relative">
            <Input
              type="date"
              value={deliveryDateParam}
              onChange={(e) => updateQuery({ deliveryDate: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          {deliveryDateParam && (
            <Button variant="ghost" size="sm" onClick={() => updateQuery({ deliveryDate: "" })} className="text-xs h-9">
              Clear Date
            </Button>
          )}

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
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono font-bold text-foreground text-sm block">
                          {order.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {formatDateTime(order.placedAt)}
                        </span>
                      </td>

                      <td className="py-3 px-4 align-top max-w-[200px]">
                        <p className="font-semibold text-foreground truncate">{order.address.fullName}</p>
                        <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{order.address.phone}</span>
                        </p>
                        <p className="text-muted-foreground truncate text-[11px] mt-0.5">
                          {order.address.area}, {order.address.city}
                        </p>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <span className="font-medium text-foreground block">
                          {formatDeliveryDate(order.deliveryDate)}
                        </span>
                        <span className="text-muted-foreground text-[11px] block mt-0.5">
                          {order.deliverySlot}
                        </span>
                      </td>

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

                      <td className="py-3 px-4 align-top text-right font-semibold text-foreground font-serif text-sm">
                        Rs {Math.round(order.total)}
                      </td>

                      <td className="py-3 px-4 align-top text-center">
                        <Badge
                          variant="outline"
                          className={`${STATUS_CONFIG[order.status].bg} ${STATUS_CONFIG[order.status].text} ${STATUS_CONFIG[order.status].border} px-2.5 py-0.5 font-medium inline-flex items-center gap-1.5`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {STATUS_CONFIG[order.status].label}
                        </Badge>
                      </td>

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
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
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
                            </DropdownMenuGroup>
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



      <CancellationDialog
        open={Boolean(selectedCancelOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedCancelOrder(null);
        }}
        onConfirm={(reason) => {
          if (!selectedCancelOrder) return;
          startTransition(async () => {
            const res = await handleUpdateOrderStatus(selectedCancelOrder.id, "cancelled", reason);
            if (res.success) {
              toast.success(`Order ${selectedCancelOrder.code} cancelled`);
            } else {
              toast.error(sanitizeOrderUpdateError(res.error));
            }
            setSelectedCancelOrder(null);
          });
        }}
        isPending={isPending}
      />
    </div>
  );
}
