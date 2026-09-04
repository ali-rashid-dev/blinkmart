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
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  DollarSign,
  Calendar,
  X,
} from "lucide-react";

import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductStatusAction,
  getAdminProductsAction,
  getAdminProductStatsAction,
  type ProductActionResult,
  type SerializedProduct,
} from "./actions";
import { getCategoriesAction } from "@/app/(admin-plane)/admin/categories/actions";
import { getBrandsAction } from "@/app/(admin-plane)/admin/brands/actions";

import type { ProductWithBrandAndCategory } from "@/repositories/product.repository";
import type { CategoryRecord } from "@/repositories/category.repository";
import type { BrandRecord } from "@/repositories/brand.repository";
import { slugify } from "@/validations/product";
import { getSupportedImageSrc } from "@/lib/image";
import { UploadButton } from "@/lib/uploadthing";

// ──────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────
type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  enabled: boolean;
  brandId: string;
  categoryId: string;
};

// ──────────────────────────────────────────────────────────
//  Product Form Dialog (Add / Edit)
// ──────────────────────────────────────────────────────────
function ProductFormDialog({
  trigger,
  title,
  defaultValues,
  categories,
  brands,
  onSave,
  isPending,
}: {
  trigger?: React.ReactNode;
  title: string;
  defaultValues?: Partial<ProductFormValues>;
  categories: CategoryRecord[];
  brands: BrandRecord[];
  onSave: (values: ProductFormValues) => Promise<ProductActionResult<SerializedProduct>>;
  isPending?: boolean;
}) {
  // When no trigger is provided, open immediately on mount (controlled by parent's conditional render)
  const [open, setOpen] = useState(!trigger);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      imageUrl: defaultValues?.imageUrl ?? "",
      enabled: defaultValues?.enabled ?? true,
      brandId: defaultValues?.brandId ?? "",
      categoryId: defaultValues?.categoryId ?? "",
    },
  });

  const nameValue = watch("name");
  const enabledValue = watch("enabled");
  const imageUrlValue = watch("imageUrl");
  const imageSrc = getSupportedImageSrc(imageUrlValue);
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!slugManuallyEdited && !defaultValues?.slug && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugManuallyEdited, defaultValues?.slug, setValue]);

  function onOpenChange(val: boolean) {
    setOpen(val);
    if (val) {
      setSlugManuallyEdited(false);
      reset({
        name: defaultValues?.name ?? "",
        slug: defaultValues?.slug ?? "",
        description: defaultValues?.description ?? "",
        price: defaultValues?.price ?? 0,
        imageUrl: defaultValues?.imageUrl ?? "",
        enabled: defaultValues?.enabled ?? true,
        brandId: defaultValues?.brandId ?? "",
        categoryId: defaultValues?.categoryId ?? "",
      });
    }
  }

  async function onSubmit(values: ProductFormValues) {
    if (!values.name.trim()) return;

    const result = await onSave({
      ...values,
      price: Number(values.price),
      brandId: values.brandId || "",
      categoryId: values.categoryId || "",
    });

    if (result.success) {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-none bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          <DialogDescription>
            Fill in the details below to save your product catalog item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Section 1: Basic Information */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="prod-name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prod-name"
                  {...register("name", {
                    required: "Product name is required",
                    minLength: { value: 2, message: "At least 2 characters" },
                  })}
                  placeholder="Organic Honey Crispy Apples"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Slug / SKU identifier */}
              <div className="space-y-1.5">
                <Label htmlFor="prod-slug">URL Slug / Identifier</Label>
                <Input
                  id="prod-slug"
                  {...register("slug")}
                  placeholder="organic-honey-crispy-apples"
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setValue("slug", slugify(e.target.value));
                  }}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="prod-category">Category</Label>
                <select
                  id="prod-category"
                  {...register("categoryId")}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="prod-brand">Brand</Label>
                <select
                  id="prod-brand"
                  {...register("brandId")}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {!b.enabled ? "(Banned)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="prod-desc">Description</Label>
                <textarea
                  id="prod-desc"
                  rows={3}
                  {...register("description")}
                  placeholder="Freshly harvested organic apples packed with sweet flavor and natural crispiness..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-price">
                  Price (Rs) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    Rs
                  </span>
                  <Input
                    id="prod-price"
                    type="number"
                    step="1"
                    min="1"
                    className="pl-9"
                    {...register("price", {
                      required: "Price is required",
                      min: { value: 1, message: "Price must be greater than Rs 0" },
                      setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                    })}
                    placeholder="4999"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Product Image */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" /> Media & Images
            </h3>

            <div className="space-y-2">
              <Label htmlFor="prod-image">Product Image URL</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="h-24 w-24 shrink-0 rounded-xl border border-border bg-accent grid place-items-center overflow-hidden relative group">
                  {imageSrc && failedImageSrc !== imageSrc ? (
                    <>
                      <Image
                        src={imageSrc}
                        alt="Product preview"
                        fill
                        className="object-cover"
                        onError={() => setFailedImageSrc(imageSrc)}
                      />
                      <button
                        type="button"
                        onClick={() => setValue("imageUrl", "")}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <span className="text-[10px] text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <Input
                    id="prod-image"
                    {...register("imageUrl")}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <div className="pt-1">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        const url = res?.[0]?.ufsUrl || res?.[0]?.url;
                        if (url) {
                          setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true });
                          setFailedImageSrc(null);
                          toast.success("Product image uploaded!");
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an image file or provide a public URL. Image preview updates automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Visibility & Status */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Product Status</p>
              <p className="text-xs text-muted-foreground">
                Active products are visible to customers on BlinkMart store.
              </p>
            </div>
            <Switch
              checked={enabledValue}
              onCheckedChange={(v) => setValue("enabled", v)}
              aria-label="Toggle active product status"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending || isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isSubmitting}>
              {(isPending || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
//  Product Details Inspection Dialog
// ──────────────────────────────────────────────────────────
function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  product: SerializedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: SerializedProduct) => void;
  onToggleStatus: (product: SerializedProduct, enabled: boolean) => void;
  onDelete: (product: SerializedProduct) => void;
}) {
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);

  if (!product) return null;

  const sku = `SKU-${product.id.slice(-6).toUpperCase()}`;
  const imageSrc = getSupportedImageSrc(product.imageUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant={product.enabled ? "default" : "secondary"}>
              {product.enabled ? "Active" : "Inactive"}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">{sku}</span>
          </div>
          <DialogTitle className="font-serif text-2xl mt-1">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Image & Main stats */}
          <div className="flex gap-4 items-start">
            <div className="relative h-28 w-28 shrink-0 rounded-xl border border-border bg-accent overflow-hidden grid place-items-center">
              {imageSrc && failedImageSrc !== imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setFailedImageSrc(imageSrc)}
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Price
                </span>
                <p className="font-serif text-2xl font-bold text-foreground">
                  Rs {Math.round(Number(product.price))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Category</span>
                  <span className="font-medium truncate block">
                    {product.category?.name || "Uncategorized"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Brand</span>
                  <span className="font-medium truncate block">
                    {product.brand?.name || "Generic"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Description
            </span>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || "No product description provided."}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="h-3.5 w-3.5" />
              <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between pt-2 border-t border-border">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onDelete(product);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(product, !product.enabled)}
            >
              {product.enabled ? "Disable" : "Enable"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit Product
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

  // Dialog & Modal targets
  const [selectedInspectProduct, setSelectedInspectProduct] =
    useState<SerializedProduct | null>(null);
  const [selectedEditProduct, setSelectedEditProduct] =
    useState<SerializedProduct | null>(null);
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

      if (catRes.success) {
        setCategories(catRes.data.items);
      }

      if (brandRes.success) {
        setBrands(brandRes.data.items);
      }
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
  async function handleCreateProduct(values: ProductFormValues) {
    const res = await createProductAction({
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || null,
      price: values.price,
      imageUrl: values.imageUrl || null,
      enabled: values.enabled,
      brandId: values.brandId || null,
      categoryId: values.categoryId || null,
    });

    if (res.success) {
      toast.success(`Product "${res.data.name}" created successfully`);
      loadData();
    } else {
      toast.error(res.error.message);
    }

    return res;
  }

  async function handleUpdateProduct(
    id: string,
    values: ProductFormValues
  ): Promise<ProductActionResult<SerializedProduct>> {
    const res = await updateProductAction({
      id,
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || null,
      price: values.price,
      imageUrl: values.imageUrl || null,
      enabled: values.enabled,
      brandId: values.brandId || null,
      categoryId: values.categoryId || null,
    });

    if (res.success) {
      toast.success(`Product "${res.data.name}" updated successfully`);
      setSelectedEditProduct(null);
      loadData();
    } else {
      toast.error(res.error.message);
    }

    return res;
  }

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
          <ProductFormDialog
            title="Add New Product"
            categories={categories}
            brands={brands}
            isPending={isPending}
            trigger={
              <Button className="rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            }
            onSave={handleCreateProduct}
          />
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
                      <ProductFormDialog
                        title="Add New Product"
                        categories={categories}
                        brands={brands}
                        isPending={isPending}
                        trigger={
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                          </Button>
                        }
                        onSave={handleCreateProduct}
                      />
                    )}
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const sku = `SKU-${prod.id.slice(-6).toUpperCase()}`;

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
                      <td className="px-4 py-3 font-semibold text-foreground">
                        Rs {Math.round(Number(prod.price))}
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

                              <DropdownMenuItem onClick={() => setSelectedInspectProduct(prod)}>
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => setSelectedEditProduct(prod)}>
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

      {/* Inspect Product Modal */}
      <ProductDetailsDialog
        product={selectedInspectProduct}
        open={Boolean(selectedInspectProduct)}
        onOpenChange={(open) => !open && setSelectedInspectProduct(null)}
        onEdit={(prod) => setSelectedEditProduct(prod)}
        onToggleStatus={(prod, val) => handleToggleStatus(prod, val)}
        onDelete={(prod) => setSelectedDeleteProduct(prod)}
      />

      {/* Edit Product Dialog */}
      {selectedEditProduct && (
        <ProductFormDialog
          title="Edit Product"
          categories={categories}
          brands={brands}
          isPending={isPending}
          defaultValues={{
            name: selectedEditProduct.name,
            slug: selectedEditProduct.slug,
            description: selectedEditProduct.description ?? "",
            price: Number(selectedEditProduct.price),
            imageUrl: selectedEditProduct.imageUrl ?? "",
            enabled: selectedEditProduct.enabled,
            brandId: selectedEditProduct.brandId ?? "",
            categoryId: selectedEditProduct.categoryId ?? "",
          }}
          onSave={(values) => handleUpdateProduct(selectedEditProduct.id, values)}
        />
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
