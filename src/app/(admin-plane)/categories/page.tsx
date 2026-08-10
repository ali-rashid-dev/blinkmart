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
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Pencil,
  Trash2,
  Plus,
  ImageIcon,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryStatusAction,
  getCategoriesAction,
  type CategoryActionResult,
} from "./actions";
import type { CategoryRecord } from "@/repositories/category.repository";
import { slugify } from "@/validations/category";

// ──────────────────────────────────────────────────────────
//  Category Form Dialog
// ──────────────────────────────────────────────────────────
type CategoryFormValues = {
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

function CategoryFormDialog({
  trigger,
  title,
  defaultValues,
  onSave,
  isPending,
}: {
  trigger: React.ReactNode;
  title: string;
  defaultValues?: Partial<CategoryFormValues>;
  onSave: (values: CategoryFormValues) => Promise<CategoryActionResult<CategoryRecord>>;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<CategoryFormValues>({
      defaultValues: {
        name: defaultValues?.name ?? "",
        slug: defaultValues?.slug ?? "",
        imageUrl: defaultValues?.imageUrl ?? "",
        sortOrder: defaultValues?.sortOrder ?? 0,
        isActive: defaultValues?.isActive ?? true,
      },
    });

  const nameValue = watch("name");
  const isActiveValue = watch("isActive");

  // Auto-generate slug from name unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && !defaultValues?.slug) {
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
        imageUrl: defaultValues?.imageUrl ?? "",
        sortOrder: defaultValues?.sortOrder ?? 0,
        isActive: defaultValues?.isActive ?? true,
      });
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    if (!values.name.trim()) return;

    const result = await onSave(values);

    if (result.success) {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category Name <span className="text-destructive">*</span></Label>
            <Input
              id="cat-name"
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "At least 2 characters" } })}
              placeholder="Fruits & Vegetables"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              {...register("slug")}
              placeholder="fruits-vegetables"
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-image">Image URL</Label>
            <div className="flex gap-2 items-start">
              <div className="h-10 w-10 shrink-0 rounded-md border bg-accent grid place-items-center overflow-hidden">
                {watch("imageUrl") ? (
                  <img
                    src={watch("imageUrl")}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  id="cat-image"
                  {...register("imageUrl")}
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-sort">Sort Order</Label>
            <Input
              id="cat-sort"
              type="number"
              min={0}
              {...register("sortOrder", {
                setValueAs: (value) => (value === "" ? 0 : Number(value)),
              })}
              placeholder="0"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Visible to customers</p>
            </div>
            <Switch
              checked={isActiveValue}
              aria-label="Toggle category active status"
              onCheckedChange={(v) => setValue("isActive", v)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending || isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────
//  Main Page
// ──────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Query state from URL
  const search = searchParams.get("search") ?? "";
  const validStatuses = ["all", "active", "inactive"] as const;
  const validSortBy = ["name-asc", "name-desc", "created-desc", "created-asc", "sort-order"] as const;
  const rawStatus = searchParams.get("status");
  const rawSortBy = searchParams.get("sortBy");
  const rawPage = Number(searchParams.get("page") ?? "");
  const status = validStatuses.includes(rawStatus as typeof validStatuses[number])
    ? (rawStatus as typeof validStatuses[number])
    : "all";
  const sortBy = validSortBy.includes(rawSortBy as typeof validSortBy[number])
    ? (rawSortBy as typeof validSortBy[number])
    : "sort-order";
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 10;

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // ── Helpers ───────────────────────────────────────────
  function updateQuery(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page"); // reset to page 1 on filter change
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  // ── Load ──────────────────────────────────────────────
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const result = await getCategoriesAction({ search, status, sortBy, page, limit });
      if (requestId !== requestIdRef.current) return;
      if (!mountedRef.current) return;

      if (result.success) {
        setCategories(result.data.items);
        setTotalItems(result.data.totalItems);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current || !mountedRef.current) return;
      toast.error((error as Error).message || "Unable to load categories.");
    } finally {
      if (requestId !== requestIdRef.current || !mountedRef.current) return;
      setLoading(false);
    }
  }, [search, status, sortBy, page, limit]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ── Mutations ─────────────────────────────────────────
  async function handleCreate(values: CategoryFormValues) {
    const result = await createCategoryAction({
      name: values.name,
      slug: values.slug || undefined,
      imageUrl: values.imageUrl || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    });

    if (result.success) {
      toast.success("Category created");
      router.refresh();
    } else {
      toast.error(result.error.message);
    }

    return result;
  }

  async function handleUpdate(id: string, values: CategoryFormValues) {
    const result = await updateCategoryAction({
      id,
      name: values.name,
      slug: values.slug || undefined,
      imageUrl: values.imageUrl || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    });

    if (result.success) {
      toast.success("Category updated");
      router.refresh();
    } else {
      toast.error(result.error.message);
    }

    return result;
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        toast.success("Category deleted");
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleToggle(id: string, newValue: boolean) {
    startTransition(async () => {
      const result = await toggleCategoryStatusAction(id, newValue);
      if (result.success) {
        toast.success(newValue ? "Category enabled" : "Category disabled");
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  // ── Search form ───────────────────────────────────────
  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateQuery({ search: searchInput });
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Categories"
        description={`${totalItems} categor${totalItems === 1 ? "y" : "ies"} total`}
        actions={
          <CategoryFormDialog
            title="Add Category"
            isPending={isPending}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            }
            onSave={handleCreate}
          />
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or slug…"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>

        {/* Status filter */}
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => updateQuery({ status: s })}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {/* Sort */}
        <select
          aria-label="Sort categories"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={sortBy}
          onChange={(e) => updateQuery({ sortBy: e.target.value })}
        >
          <option value="sort-order">Sort Order</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="created-desc">Newest</option>
          <option value="created-asc">Oldest</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Slug</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Order</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
                  Loading…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted-foreground">
                  <ImageIcon className="mx-auto mb-3 h-10 w-10 opacity-25" />
                  <p className="text-sm">No categories found.</p>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {/* Name + image */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg border bg-accent grid place-items-center overflow-hidden">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                    {cat.slug}
                  </td>

                  {/* Sort order */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">
                    {cat.sortOrder}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={cat.isActive}
                      aria-label={`Toggle active status for ${cat.name}`}
                      disabled={isPending}
                      onCheckedChange={(v) => handleToggle(cat.id, v)}
                    />
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CategoryFormDialog
                        title="Edit Category"
                        isPending={isPending}
                        defaultValues={{
                          name: cat.name,
                          slug: cat.slug,
                          imageUrl: cat.imageUrl ?? "",
                          sortOrder: cat.sortOrder,
                          isActive: cat.isActive,
                        }}
                        trigger={
                          <Button size="sm" variant="ghost" disabled={isPending} aria-label={`Edit ${cat.name} category`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        onSave={(values) => handleUpdate(cat.id, values)}
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        aria-label={`Delete ${cat.name} category`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {page} of {totalPages} · {totalItems} total
          </p>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || isPending}
              aria-label="Previous page"
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isPending}
              aria-label="Next page"
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}