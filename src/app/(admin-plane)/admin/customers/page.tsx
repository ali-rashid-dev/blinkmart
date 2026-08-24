"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Eye,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";
import {
  getCustomersAction,
  updateCustomerAction,
  banCustomerAction,
  unbanCustomerAction,
  getCustomerStatsAction,
} from "./actions";
import type {
  CustomerRecord,
  CustomerStats,
} from "@/repositories/customer.repository";

// ──────────────────────────────────────────────────────────
// Helpers & Formatters
// ──────────────────────────────────────────────────────────

import { formatCurrency } from "@/lib/currency";

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
// Customer Stats Component
// ──────────────────────────────────────────────────────────

function StatsGrid({ stats, loading }: { stats: CustomerStats | null; loading: boolean }) {
  const cards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Active Customers",
      value: stats?.activeCustomers ?? 0,
      icon: UserCheck,
      color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      title: "Banned Customers",
      value: stats?.bannedCustomers ?? 0,
      icon: UserX,
      color: "text-destructive bg-destructive/10",
    },
    {
      title: "New (30 Days)",
      value: stats?.newCustomers30Days ?? 0,
      icon: UserPlus,
      color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-organic border-border/80">
            <CardContent className="flex items-center justify-between">
              <div className="space-y-1 w-full h-full">
                <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </p>
                <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold font-serif">{card.value.toLocaleString()}</p>
                )}
              </div>
            
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────
// Edit Customer Dialog Component
// ──────────────────────────────────────────────────────────

function EditCustomerModal({
  customer,
  open,
  onOpenChange,
  onSaved,
}: {
  customer: CustomerRecord | null;
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

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

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
        toast.success("Customer information updated successfully");
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
          {/* Identity Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={role} onValueChange={(val) => { if (val) setRole(val as "USER" | "ADMIN"); }}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER (Customer)</SelectItem>
                  <SelectItem value="ADMIN">ADMIN (Administrator)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="pt-2 space-y-3">
            <div className="text-sm font-semibold border-b border-border pb-1">
              Shipping Address
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-houseNo">House / Apt No.</Label>
                <Input
                  id="edit-houseNo"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-street">Street Address</Label>
                <Input
                  id="edit-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-area">Area / District</Label>
                <Input
                  id="edit-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Downtown"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-postalCode">Postal Code</Label>
                <Input
                  id="edit-postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
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
// Ban Customer Dialog Component
// ──────────────────────────────────────────────────────────

function BanCustomerModal({
  customer,
  open,
  onOpenChange,
  onBanned,
}: {
  customer: CustomerRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBanned: () => void;
}) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  const handleBan = () => {
    if (!customer) return;

    startTransition(async () => {
      const res = await banCustomerAction({
        id: customer.id,
        banReason: reason.trim(),
      });

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
              <p className="text-[11px] text-muted-foreground text-right">
                {reason.length}/500 characters
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
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
// Unban Customer Dialog Component
// ──────────────────────────────────────────────────────────

function UnbanCustomerModal({
  customer,
  open,
  onOpenChange,
  onUnbanned,
}: {
  customer: CustomerRecord | null;
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
          <DialogDescription>
            Restore customer login and order privileges on BlinkMart.
          </DialogDescription>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
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
// Main Admin Customers Page Component
// ──────────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tableLoading, setTableLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(""); // debounced value used for queries
  const [searchInput, setSearchInput] = useState(""); // immediate input value
  const [role, setRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "totalSpent" | "ordersCount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;


  const [editCustomer, setEditCustomer] = useState<CustomerRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [banCustomer, setBanCustomer] = useState<CustomerRecord | null>(null);
  const [isBanOpen, setIsBanOpen] = useState(false);

  const [unbanCustomer, setUnbanCustomer] = useState<CustomerRecord | null>(null);
  const [isUnbanOpen, setIsUnbanOpen] = useState(false);

  // Load stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await getCustomerStatsAction();
    if (res.success) {
      setStats(res.data);
    }
    setStatsLoading(false);
  }, []);

  // Load customer table data
  const fetchCustomers = useCallback(async () => {
    setTableLoading(true);
    const res = await getCustomersAction({
      search,
      role,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    if (res.success) {
      setCustomers(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      // Clamp current page to the returned totalPages to avoid invalid pages
      if (page > res.data.totalPages) {
        setPage(Math.max(1, res.data.totalPages));
      }
    } else {
      toast.error(res.error.message);
    }
    setTableLoading(false);
  }, [search, role, status, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounce the immediate search input into the `search` value used by fetchCustomers
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const handleRefresh = () => {
    fetchStats();
    fetchCustomers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setRole("ALL");
    setStatus("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const isFiltered = search !== "" || role !== "ALL" || status !== "ALL" || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <PageHeader
          title="Customers"
          description="Manage customer accounts, view profiles, update information, and manage access restrictions."
          actions={
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={tableLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${tableLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        {/* Stats Grid */}
        <StatsGrid stats={stats} loading={statsLoading} />

        {/* Toolbar & Filters */}
        <Card className="shadow-organic border-border/80">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, or phone..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}
                  className="pl-9"
                />
                {searchInput && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Select */}
              <div className="w-full md:w-44">
                <Select
                  value={status}
                  onValueChange={(val) => {
                    if (val) setStatus(val as "ALL" | "ACTIVE" | "BANNED");
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="BANNED">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Select */}
              <div className="w-full md:w-40">
                <Select
                  value={role}
                  onValueChange={(val) => {
                    if (val) setRole(val as "ALL" | "USER" | "ADMIN");
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="USER">Customer (USER)</SelectItem>
                    <SelectItem value="ADMIN">Admin (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By Select */}
              <div className="w-full md:w-48">
                <Select
                  value={sortBy}
                  onValueChange={(val) => {
                    if (val) setSortBy(val as "createdAt" | "name" | "totalSpent" | "ordersCount");
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Joined Date</SelectItem>
                    <SelectItem value="name">Customer Name</SelectItem>
                    <SelectItem value="totalSpent">Total Spent</SelectItem>
                    <SelectItem value="ordersCount">Total Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>

              {/* Reset Filters */}
              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs">
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Data Table */}
        <Card className="shadow-organic border-border/80 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[280px]">Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders & Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                      <div className="space-y-2">
                        <Users className="h-8 w-8 mx-auto opacity-40" />
                        <p>No customer accounts found matching your criteria.</p>
                        {isFiltered && (
                          <Button variant="link" size="sm" onClick={handleResetFilters}>
                            Clear search & filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                      {/* Customer Identity */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-serif text-sm font-semibold shrink-0">
                            {getInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-sm">
                        {c.profile?.phone ? (
                          <span className="font-mono text-xs">{c.profile.phone}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>
                        <Badge variant={c.role === "ADMIN" ? "default" : "secondary"} className="text-[11px]">
                          {c.role}
                        </Badge>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {c.banned ? (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit cursor-help text-[11px]">
                                <ShieldAlert className="h-3 w-3" /> Banned
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <p className="font-medium">Reason:</p>
                              <p className="opacity-90">{c.banReason || "No reason given"}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 bg-emerald-500/10 text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            Active
                          </Badge>
                        )}
                      </TableCell>

                      {/* Orders & Spent */}
                      <TableCell className="text-sm">
                        <div>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(c.totalSpent)}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {c.ordersCount} order{c.ordersCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Customer Details */}
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/customers/${c.id}`)}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">View Customer</TooltipContent>
                          </Tooltip>

                          {/* Edit Customer */}
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditCustomer(c);
                                  setIsEditOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Edit Customer</TooltipContent>
                          </Tooltip>

                          {/* Ban / Unban Customer */}
                          {c.banned ? (
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                  onClick={() => {
                                    setUnbanCustomer(c);
                                    setIsUnbanOpen(true);
                                  }}
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Unban Customer</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setBanCustomer(c);
                                    setIsBanOpen(true);
                                  }}
                                >
                                  <ShieldAlert className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Ban Customer</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/60 text-sm">
              <div className="text-xs text-muted-foreground">
                Showing {Math.min((page - 1) * limit + 1, total)} to{" "}
                {Math.min(page * limit, total)} of {total} customers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || tableLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-xs font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || tableLoading}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>


        {/* Edit Customer Dialog */}
        <EditCustomerModal
          customer={editCustomer}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSaved={handleRefresh}
        />

        {/* Ban Customer Dialog */}
        <BanCustomerModal
          customer={banCustomer}
          open={isBanOpen}
          onOpenChange={setIsBanOpen}
          onBanned={handleRefresh}
        />

        {/* Unban Customer Dialog */}
        <UnbanCustomerModal
          customer={unbanCustomer}
          open={isUnbanOpen}
          onOpenChange={setIsUnbanOpen}
          onUnbanned={handleRefresh}
        />
      </div>
    </TooltipProvider>
  );
}
