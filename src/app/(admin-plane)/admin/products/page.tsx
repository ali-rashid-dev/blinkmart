"use client";

import {
  useState,
  useRef,
  useEffect,
  useTransition,
  useCallback,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Pencil,
  Trash2,
  Plus,
  ImageIcon,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Boxes,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import {
  deleteProductAction,
  toggleProductStatusAction,
  getAdminProductsAction,
  getAdminProductStatsAction,
  type SerializedProduct,
} from "./actions";
import { getCategoriesAction } from "@/app/(admin-plane)/admin/categories/actions";
import { getBrandsAction } from "@/app/(admin-plane)/admin/brands/actions";
import type { CategoryRecord } from "@/repositories/category.repository";
import type { BrandRecord } from "@/repositories/brand.repository";
import { formatCurrency } from "@/lib/currency";

// ──────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────
//  Delete Confirmation Dialog
// ──────────────────────────────────────────────────────────
function DeleteConfirmDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  product: SerializedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Delete Product
          </DialogTitle>
          <DialogDescription className="pt-2 text-foreground">
            Are you sure you want to delete <strong>"{product.name}"</strong>? This product will be permanently removed from your store catalog.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Yes, Delete Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
//  Main Admin Products Page Component
// ──────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Query parameters
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const brandId = searchParams.get("brandId") ?? "";
  const rawStatus = searchParams.get("status");
  const status = rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "all";
  const rawPage = Number(searchParams.get("page") ?? "");
  const rawLimit = Number(searchParams.get("limit") ?? "");
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  // Local state
  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const [selectedDeleteProduct, setSelectedDeleteProduct] =
    useState<SerializedProduct | null>(null);

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // URL Helper
  function updateQuery(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page"); // Reset to page 1 on filter change
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function resetFilters() {
    setSearchInput("");
    router.push(pathname);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function setPageLimit(l: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(l));
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
      const [prodRes, statsRes, catRes, brandRes] = await Promise.all([
        getAdminProductsAction({ search, categoryId, brandId, status, page, limit }),
        getAdminProductStatsAction(),
        getCategoriesAction({ limit: 100 }),
        getBrandsAction({ limit: 100 }),
      ]);

      if (requestId !== requestIdRef.current) return;

      if (prodRes.success) {
        setProducts(prodRes.data.items);
        setTotalItems(prodRes.data.totalItems);
        setTotalPages(prodRes.data.totalPages);
      } else {
        toast.error(prodRes.error.message);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (catRes.success) setCategories(catRes.data.items);
      if (brandRes.success) setBrands(brandRes.data.items);

    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      toast.error((error as Error).message || "Failed to load admin products.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [search, categoryId, brandId, status, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mutations
  function handleToggleStatus(product: SerializedProduct, enabled: boolean) {
    startTransition(async () => {
      const res = await toggleProductStatusAction(product.id, enabled);
      if (res.success) {
        toast.success(
          enabled
            ? `Enabled "${product.name}"`
            : `Disabled "${product.name}"`
        );
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  }

  function handleDeleteConfirm() {
    if (!selectedDeleteProduct) return;
    const { id, name } = selectedDeleteProduct;

    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.success) {
        toast.success(`Product "${name}" deleted`);
        setSelectedDeleteProduct(null);
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  }

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateQuery({ search: searchInput });
  }

  const hasActiveFilters = Boolean(search || categoryId || brandId || status !== "all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products"
        description="Manage grocery catalog items, pricing, and visibility."
        actions={
          <Button className="rounded-lg shadow-sm" onClick={() => router.push("/admin/products/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        }
      />

      {/* Product Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Products</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            {loading ? "..." : stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            {loading ? "..." : stats.active}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Inactive</span>
            <XCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            {loading ? "..." : stats.inactive}
          </p>
        </div>

      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search product name, SKU, brand..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Category Filter */}
          <select
            aria-label="Filter by Category"
            value={categoryId}
            onChange={(e) => updateQuery({ categoryId: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            aria-label="Filter by Brand"
            value={brandId}
            onChange={(e) => updateQuery({ brandId: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter by Status"
            value={status}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Clear Filters button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Product Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">SKU</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Brand</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2" /> Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Boxes className="mx-auto mb-3 h-10 w-10 opacity-25" />
                    <p className="text-base font-semibold text-foreground">
                      {hasActiveFilters ? "No products match your search or filters." : "No products found"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      {hasActiveFilters
                        ? "Try clearing filters or searching for a different keyword."
                        : "Start adding products to your grocery catalog."}
                    </p>
                    {hasActiveFilters ? (
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => router.push("/admin/products/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const sku = prod.variants[0]?.sku ?? `SKU-${prod.id.slice(-6).toUpperCase()}`;
                  const lowestVariant = prod.variantsEnabled
                    ? prod.variants.filter((variant) => variant.isActive).sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))[0]
                    : undefined;
                  const listedPrice = lowestVariant?.salePrice ?? lowestVariant?.price ?? prod.salePrice ?? prod.price;
                  const listedOriginalPrice = lowestVariant?.price ?? prod.price;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Product Column: Image + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded-lg border border-border bg-accent overflow-hidden grid place-items-center">
                            {prod.imageUrl ? (
                              <Image
                                src={prod.imageUrl}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                              {prod.name}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden font-mono">
                              {sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {sku}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                        {prod.category ? (
                          <Badge variant="outline" className="font-normal text-xs">
                            {prod.category.name}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {prod.brand ? (
                          <span className="font-medium text-foreground">{prod.brand.name}</span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-foreground">
                        {prod.variantsEnabled && <span className="mr-1 text-[10px] text-muted-foreground">From</span>}
                        {Number(listedPrice) < Number(listedOriginalPrice) ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">{formatCurrency(Number(listedPrice))}</span>
                              <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0">
                                {Math.round(((Number(listedOriginalPrice) - Number(listedPrice)) / Number(listedOriginalPrice)) * 100)}% OFF
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(Number(listedOriginalPrice))}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold">{formatCurrency(Number(listedPrice))}</span>
                        )}
                      </td>

                      {/* Status Switch */}
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={prod.enabled}
                          disabled={isPending}
                          onCheckedChange={(val) => handleToggleStatus(prod, val)}
                          aria-label={`Toggle status for ${prod.name}`}
                        />
                      </td>

                      {/* Updated Date */}
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                        {new Date(prod.updatedAt).toLocaleDateString()}
                      </td>

                      {/* Actions Menu */}
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            aria-label={`Actions menu for ${prod.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-popover">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-xs">Product Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={() => router.push(`/admin/products/${prod.id}`)}>
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => router.push(`/admin/products/${prod.id}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleToggleStatus(prod, !prod.enabled)}>
                                {prod.enabled ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4 text-amber-500" /> Disable
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Enable
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setSelectedDeleteProduct(prod)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground pt-2">
          <p>
            Showing <span className="font-semibold text-foreground">{products.length}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> products (Page {page} of {totalPages})
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span>Per page:</span>
              <select
                aria-label="Items per page"
                value={limit}
                onChange={(e) => setPageLimit(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || isPending}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages || isPending}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        product={selectedDeleteProduct}
        open={Boolean(selectedDeleteProduct)}
        onOpenChange={(open) => !open && setSelectedDeleteProduct(null)}
        onConfirm={handleDeleteConfirm}
        isPending={isPending}
      />
    </div>
  );
}
