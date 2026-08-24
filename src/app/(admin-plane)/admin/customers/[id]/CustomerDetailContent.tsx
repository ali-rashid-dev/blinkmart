"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Phone,
  MapPin,
  ShoppingBag,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Pencil,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCustomerDetailsAction,
  updateCustomerAction,
  banCustomerAction,
  unbanCustomerAction,
} from "../actions";
import type {
  CustomerDetails,
  CustomerRecord,
} from "@/repositories/customer.repository";

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ──────────────────────────────────────────────────────────
// Edit Customer Dialog
// ──────────────────────────────────────────────────────────

function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSaved,
}: {
  customer: CustomerDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [phone, setPhone] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (customer && open) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setRole(customer.role || "USER");
      setPhone(customer.profile?.phone || "");
      setHouseNo(customer.profile?.houseNo || "");
      setStreet(customer.profile?.street || "");
      setArea(customer.profile?.area || "");
      setCity(customer.profile?.city || "");
      setPostalCode(customer.profile?.postalCode || "");
    }
  }, [customer, open]);

  const handleSave = () => {
    if (!customer) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!email.trim()) { toast.error("Email is required"); return; }

    startTransition(async () => {
      const res = await updateCustomerAction({
        id: customer.id,
        name: name.trim(),
        email: email.trim(),
        role,
        phone: phone.trim() || null,
        houseNo: houseNo.trim() || null,
        street: street.trim() || null,
        area: area.trim() || null,
        city: city.trim() || null,
        postalCode: postalCode.trim() || null,
      });
      if (res.success) {
        toast.success("Customer updated successfully");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Edit Customer Profile</DialogTitle>
          <DialogDescription>
            Update customer identity, access permissions, and shipping address details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={role} onValueChange={(val) => { if (val) setRole(val as "USER" | "ADMIN"); }}>
                <SelectTrigger id="edit-role"><SelectValue placeholder="Select Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER (Customer)</SelectItem>
                  <SelectItem value="ADMIN">ADMIN (Administrator)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0199" />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="text-sm font-semibold border-b border-border pb-1">Shipping Address</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-houseNo">House / Apt No.</Label>
                <Input id="edit-houseNo" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="Apt 4B" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-street">Street Address</Label>
                <Input id="edit-street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-area">Area / District</Label>
                <Input id="edit-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Downtown" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postalCode">Postal Code</Label>
                <Input id="edit-postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="10001" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
// Ban Customer Dialog
// ──────────────────────────────────────────────────────────

function BanCustomerDialog({
  customer,
  open,
  onOpenChange,
  onBanned,
}: {
  customer: CustomerDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBanned: () => void;
}) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => { if (open) setReason(""); }, [open]);

  const handleBan = () => {
    if (!customer) return;
    startTransition(async () => {
      const res = await banCustomerAction({ id: customer.id, banReason: reason.trim() });
      if (res.success) {
        toast.success(`Customer "${customer.name}" has been banned`);
        onOpenChange(false);
        onBanned();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-destructive/40">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" /> Ban Customer Account
          </DialogTitle>
          <DialogDescription>
            This action will restrict customer access to BlinkMart and log out all active sessions.
          </DialogDescription>
        </DialogHeader>

        {customer && (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm space-y-1">
              <p className="font-semibold text-destructive">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason for Ban (Optional)</Label>
              <Textarea
                id="ban-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Violation of terms of service, repeated fake orders..."
                rows={3}
                maxLength={500}
              />
              <p className="text-[11px] text-muted-foreground text-right">{reason.length}/500 characters</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleBan} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
// Unban Customer Dialog
// ──────────────────────────────────────────────────────────

function UnbanCustomerDialog({
  customer,
  open,
  onOpenChange,
  onUnbanned,
}: {
  customer: CustomerDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnbanned: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleUnban = () => {
    if (!customer) return;
    startTransition(async () => {
      const res = await unbanCustomerAction(customer.id);
      if (res.success) {
        toast.success(`Customer "${customer.name}" access has been restored`);
        onOpenChange(false);
        onUnbanned();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" /> Unban Customer Account
          </DialogTitle>
          <DialogDescription>Restore customer login and order privileges on BlinkMart.</DialogDescription>
        </DialogHeader>

        {customer && (
          <div className="space-y-3 py-2 text-sm">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <p className="font-semibold">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
            {customer.banReason && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                <span className="font-medium">Previous Ban Reason:</span> {customer.banReason}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
            onClick={handleUnban}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Unban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
// Main Customer Detail Content
// ──────────────────────────────────────────────────────────

export function CustomerDetailContent({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isUnbanOpen, setIsUnbanOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    const res = await getCustomerDetailsAction(customerId);
    if (res.success) {
      setDetails(res.data);
    } else {
      toast.error(res.error.message);
      router.push("/admin/customers");
    }
    setLoading(false);
  }, [customerId, router]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/customers")}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>
      </div>

      {loading || !details ? (
        /* ── Loading Skeleton ── */
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* ── Profile Hero Card ── */}
          <Card className="border-border/80 shadow-organic">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center font-serif text-2xl font-bold shrink-0">
                  {getInitials(details.name)}
                </div>

                {/* Info */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-semibold font-serif">{details.name}</h1>
                    <Badge variant={details.role === "ADMIN" ? "default" : "secondary"}>
                      {details.role}
                    </Badge>
                    {details.banned ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Banned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 bg-emerald-500/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {details.email}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Member since {formatDate(details.createdAt)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  {details.banned ? (
                    <Button
                      size="sm"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setIsUnbanOpen(true)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Unban
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setIsBanOpen(true)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Ban
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Ban Notification Banner ── */}
          {details.banned && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Customer Account Banned
              </div>
              <p className="text-xs opacity-90">
                <span className="font-medium">Reason:</span> {details.banReason || "No reason specified"}
              </p>
              <p className="text-[11px] opacity-75">
                Banned on: {formatDateTime(details.bannedAt)}
              </p>
            </div>
          )}

          {/* ── Tabs ── */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview &amp; Address</TabsTrigger>
              <TabsTrigger value="orders">
                Order History ({details.ordersCount})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Lifetime Activity */}
                <Card className="border-border/60">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Lifetime Activity
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Orders</div>
                        <div className="text-2xl font-bold font-serif">{details.ordersCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Spent</div>
                        <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(details.totalSpent)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Details */}
                <Card className="border-border/60">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Contact Details
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">Phone Number</span>
                        <span className="font-medium">{details.profile?.phone || "Not provided"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Email Address</span>
                        <span className="font-medium">{details.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Address */}
              <Card className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Default Shipping Address
                  </div>
                  {details.profile && (details.profile.houseNo || details.profile.street || details.profile.city) ? (
                    <div className="text-sm space-y-1 bg-muted/30 p-3 rounded-lg border border-border/40">
                      <p className="font-medium">
                        {[details.profile.houseNo, details.profile.street].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-muted-foreground">
                        {[details.profile.area, details.profile.city, details.profile.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-2">
                      No address provided by customer.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="pt-4">
              {details.recentOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <ShoppingBag className="h-10 w-10 mx-auto opacity-40" />
                  <p className="text-sm">No orders placed by this customer yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {details.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-border/60 bg-card space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                        <div className="font-semibold flex items-center gap-2">
                          <span>Order #{order.code}</span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(order.total)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Date: {formatDate(order.createdAt)}</span>
                        <span>{order.items.length} item(s)</span>
                      </div>

                      <div className="text-xs text-muted-foreground border-t border-border/40 pt-2 flex flex-wrap gap-1">
                        {order.items.map((item) => (
                          <span
                            key={item.id}
                            className="bg-muted px-2 py-0.5 rounded border border-border/50"
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ── Dialogs ── */}
      <EditCustomerDialog
        customer={details}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaved={fetchDetails}
      />
      <BanCustomerDialog
        customer={details}
        open={isBanOpen}
        onOpenChange={setIsBanOpen}
        onBanned={fetchDetails}
      />
      <UnbanCustomerDialog
        customer={details}
        open={isUnbanOpen}
        onOpenChange={setIsUnbanOpen}
        onUnbanned={fetchDetails}
      />
    </div>
  );
}
