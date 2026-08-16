"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, EyeOff, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction,
  getBrandsAction,
  type BrandActionResult,
} from "./actions";
import type { BrandRecord } from "@/repositories/brand.repository";

type BrandFormValues = {
  name: string;
  origin: string;
};

type BrandDialogProps = {
  trigger: React.ReactNode;
  title: string;
  defaults?: BrandFormValues;
  onSave: (values: BrandFormValues) => Promise<BrandActionResult<BrandRecord>>;
};

function BrandDialog({
  trigger,
  title,
  defaults,
  onSave,
}: BrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaults?.name ?? "");
  const [origin, setOrigin] = useState(defaults?.origin ?? "");
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      setName(defaults?.name ?? "");
      setOrigin(defaults?.origin ?? "");
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedOrigin = origin.trim();

    if (!trimmedName) {
      toast.error("Brand name is required");
      return;
    }

    startTransition(async () => {
      const result = await onSave({
        name: trimmedName,
        origin: trimmedOrigin,
      });

      if (result.success) {
        setOpen(false);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">
              Brand name <span className="text-destructive">*</span>
            </Label>

            <Input
              id="brand-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter brand name"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-origin">Origin</Label>

            <Input
              id="brand-origin"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder="City, Country"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBrands = useCallback(async (searchQuery?: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const res = await getBrandsAction({ search: searchQuery ?? "", limit: 100 });
      if (requestId !== requestIdRef.current) return;

      if (res.success) {
        setBrands(res.data.items);
      } else {
        toast.error(res.error.message);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      toast.error((error as Error).message || "Unable to load brands.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void loadBrands(search);
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, loadBrands]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleCreate = async (values: BrandFormValues): Promise<BrandActionResult<BrandRecord>> => {
    const res = await createBrandAction({
      name: values.name,
      origin: values.origin.trim() ? values.origin : null,
      enabled: true,
    });

    if (res.success) {
      toast.success("Brand added");
      await loadBrands(search);
    }
    return res;
  };

  const handleUpdate = async (
    id: string,
    values: BrandFormValues
  ): Promise<BrandActionResult<BrandRecord>> => {
    const res = await updateBrandAction({
      id,
      name: values.name,
      origin: values.origin.trim() ? values.origin : null,
    });

    if (res.success) {
      toast.success("Brand updated");
      await loadBrands(search);
    }
    return res;
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteBrandAction(id);
      if (res.success) {
        toast.success(`Brand "${name}" deleted`);
        await loadBrands(search);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleToggleStatus = (brand: BrandRecord, enabled: boolean) => {
    const productCount = brand._count?.products ?? 0;

    startTransition(async () => {
      const res = await toggleBrandStatusAction(brand.id, enabled);
      if (res.success) {
        setBrands((prev) =>
          prev.map((b) => (b.id === brand.id ? { ...b, enabled } : b))
        );
        if (enabled) {
          toast.success(`${brand.name} enabled — products visible again`);
        } else {
          toast.success(`${brand.name} banned — ${productCount} products hidden`);
        }
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Producers and makers behind the products."
        actions={
          <BrandDialog
            title="Add brand"
            trigger={
              <Button className="rounded-lg">
                <Plus className="h-4 w-4" />
                Add brand
              </Button>
            }
            onSave={handleCreate}
          />
        }
      />

      <div className="paper-card mb-5 flex items-start gap-3 p-4">
        <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />

        <p className="text-sm text-muted-foreground">
          Disabling a brand hides every one of its products from customers.
          Products stay in the catalog and reappear the moment the brand is
          re-enabled.
        </p>
      </div>

      {/* Search Filter */}
      <div className="mb-5 flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands by name or origin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="paper-card py-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="paper-card py-12 text-center">
          <p className="text-sm text-muted-foreground">No brands found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => {
            const productCount = brand._count?.products ?? 0;

            return (
              <div key={brand.id} className="paper-card p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-secondary font-serif text-xl text-secondary-foreground">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-serif text-lg">
                        {brand.name}
                      </div>

                      {!brand.enabled && (
                        <Badge className="bg-alert text-alert-foreground hover:bg-alert">
                          Banned
                        </Badge>
                      )}
                    </div>

                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {brand.origin || "Origin not specified"}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {productCount}{" "}
                      {productCount === 1 ? "product" : "products"}

                      {!brand.enabled && productCount > 0
                        ? " · hidden from customers"
                        : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex gap-1">
                    <BrandDialog
                      title="Edit brand"
                      defaults={{
                        name: brand.name,
                        origin: brand.origin ?? "",
                      }}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground"
                          disabled={isPending}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      }
                      onSave={(values) => handleUpdate(brand.id, values)}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-alert hover:bg-alert/10 hover:text-alert"
                      disabled={isPending}
                      onClick={() => handleDelete(brand.id, brand.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>

                  <Switch
                    checked={brand.enabled}
                    disabled={isPending}
                    onCheckedChange={(enabled) =>
                      handleToggleStatus(brand, enabled)
                    }
                    aria-label={`Toggle brand status for ${brand.name}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}