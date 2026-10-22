"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@/lib/uploadthing";
import type { BrandRecord } from "@/repositories/brand.repository";
import type { CategoryRecord } from "@/repositories/category.repository";
import { slugify } from "@/validations/product";
import { getBrandsAction } from "@/app/(admin-plane)/admin/brands/actions";
import { getCategoriesAction } from "@/app/(admin-plane)/admin/categories/actions";
import {
  createProductAction,
  getAdminProductAction,
  updateProductAction,
  type SerializedProduct,
} from "../actions";

const variantAttributeFields = [
  ["weight", "Weight"],
  ["volume", "Volume"],
  ["color", "Color"],
  ["size", "Size"],
  ["flavor", "Flavor"],
  ["packaging", "Packaging"],
] as const;

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  imageUrl: string;
  enabled: boolean;
  brandId: string;
  categoryId: string;
  variantsEnabled: boolean;
  variants: {
    id?: string;
    sku: string;
    weight: string;
    volume: string;
    color: string;
    size: string;
    flavor: string;
    packaging: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
  }[];
};

export function ProductFormPage({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(productId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 1,
      salePrice: null,
      imageUrl: "",
      enabled: true,
      brandId: "",
      categoryId: "",
      variantsEnabled: false,
      variants: [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const nameField = register("name", { required: "Product name is required", minLength: 2 });
  const variantsEnabled = useWatch({ control, name: "variantsEnabled" });
  const variantsEnabledField = register("variantsEnabled");

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      try {
        const [categoryResult, brandResult, productResult] = await Promise.all([
          getCategoriesAction({ limit: 100 }),
          getBrandsAction({ limit: 100 }),
          productId ? getAdminProductAction(productId) : Promise.resolve(null),
        ]);
        if (!active) return;
        if (!categoryResult.success) throw new Error(categoryResult.error.message);
        if (!brandResult.success) throw new Error(brandResult.error.message);
        setCategories(categoryResult.data.items);
        setBrands(brandResult.data.items);
        if (productResult) {
          if (!productResult.success) throw new Error(productResult.error.message);
          reset(toFormValues(productResult.data));
        }
      } catch (error) {
        console.error("Failed to load product form options:", error);
        const message = error instanceof Error ? error.message : "Failed to load product form.";
        setLoadError(message);
        toast.error(message);
      } finally {
        if (active) {
          setLoadingOptions(false);
          setLoadingProduct(false);
        }
      }
    }
    loadOptions();
    return () => {
      active = false;
    };
  }, [productId, reset]);

  async function onSubmit(values: ProductFormValues) {
    const input = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || null,
      price: Number(values.price),
      salePrice: values.salePrice === null || values.salePrice === 0 ? null : Number(values.salePrice),
      imageUrl: values.imageUrl || null,
      enabled: values.enabled,
      brandId: values.brandId || null,
      categoryId: values.categoryId || null,
      variantsEnabled: values.variantsEnabled,
      variants: values.variantsEnabled
        ? values.variants.map((variant) => ({
            ...(variant.id ? { id: variant.id } : {}),
            sku: variant.sku,
            attributes: Object.fromEntries(
              variantAttributeFields.flatMap(([key, label]) => {
                const value = variant[key].trim();
                return value ? [[label, value]] : [];
              })
            ),
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null,
            stockQuantity: Number(variant.stockQuantity),
            imageUrl: variant.imageUrl || null,
            isActive: variant.isActive,
          }))
        : [],
    };
    const result = productId
      ? await updateProductAction({ ...input, id: productId })
      : await createProductAction(input);

    if (!result.success) {
      toast.error(result.error.message);
      if (result.error.details) toast.error(Object.values(result.error.details).join(" · "));
      return;
    }

    toast.success(`Product "${result.data.name}" ${productId ? "updated" : "created"} successfully`);
    router.push(productId ? `/admin/products/${productId}` : "/admin/products");
    router.refresh();
  }

  if (loadingProduct) {
    return <div className="py-16 text-center text-muted-foreground">Loading product...</div>;
  }
  if (productId && loadError) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Unable to edit product" description={loadError} />
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="mr-2 size-4" /> Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={productId ? "Edit Product" : "Add Product"}
        description={productId ? "Update product details and purchase options." : "Add a product and optionally define purchasable variants."}
        actions={
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 size-4" /> Back to Products
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product-name">Product name *</Label>
            <Input
              id="product-name"
              {...nameField}
              onChange={(event) => {
                nameField.onChange(event);
                if (!slugManuallyEdited) setValue("slug", slugify(event.target.value));
              }}
              placeholder="Organic Honey"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-slug">URL slug</Label>
            <Input
              id="product-slug"
              {...register("slug")}
              onChange={(event) => {
                setSlugManuallyEdited(true);
                setValue("slug", slugify(event.target.value));
              }}
              placeholder="organic-honey"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <select
              id="product-category"
              {...register("categoryId")}
              disabled={loadingOptions}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-brand">Brand</Label>
            <select
              id="product-brand"
              {...register("brandId")}
              disabled={loadingOptions}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product-description">Description</Label>
            <textarea
              id="product-description"
              rows={3}
              {...register("description")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Product details"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product-image">Image URL</Label>
            <Input id="product-image" type="url" {...register("imageUrl")} placeholder="https://..." />
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(result) => {
                const url = result?.[0]?.ufsUrl || result?.[0]?.url;
                if (url) {
                  setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true });
                  toast.success("Product image uploaded.");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Pricing and purchase options</h2>
              <p className="text-sm text-muted-foreground">Add a base price or set prices for product variants.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...variantsEnabledField}
                onChange={(event) => {
                  variantsEnabledField.onChange(event);
                  setValue("variantsEnabled", event.target.checked);
                  if (event.target.checked && fields.length === 0) {
                    append({
                      sku: "",
                      weight: "",
                      volume: "",
                      color: "",
                      size: "",
                      flavor: "",
                      packaging: "",
                      price: 1,
                      salePrice: null,
                      stockQuantity: 0,
                      imageUrl: "",
                      isActive: true,
                    });
                  }
                }}
                className="size-4 accent-primary"
              />
              Product has variants
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">Base price (Rs) *</Label>
              <Input id="product-price" type="number" min="1" step="0.01" {...register("price", { valueAsNumber: true, min: 1 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sale-price">Sale price (Rs)</Label>
              <Input
                id="product-sale-price"
                type="number"
                min="0"
                step="0.01"
                {...register("salePrice", { setValueAs: (value) => value === "" ? null : Number(value) })}
              />
            </div>
          </div>

          {variantsEnabled && (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor={`variant-sku-${index}`}>SKU *</Label>
                    <Input id={`variant-sku-${index}`} {...register(`variants.${index}.sku`, { required: true })} placeholder="SKU-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`variant-price-${index}`}>Price (Rs) *</Label>
                    <Input id={`variant-price-${index}`} type="number" min="1" step="0.01" {...register(`variants.${index}.price`, { valueAsNumber: true, min: 1 })} />
                  </div>
                  {variantAttributeFields.map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`variant-${key}-${index}`}>{label}</Label>
                      <Input id={`variant-${key}-${index}`} {...register(`variants.${index}.${key}`)} placeholder={label} />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label htmlFor={`variant-stock-${index}`}>Stock *</Label>
                    <Input id={`variant-stock-${index}`} type="number" min="0" step="1" {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true, min: 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`variant-sale-${index}`}>Sale price (Rs)</Label>
                    <Input id={`variant-sale-${index}`} type="number" min="0" step="0.01" {...register(`variants.${index}.salePrice`, { setValueAs: (value) => value === "" ? null : Number(value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`variant-image-${index}`}>Variant image URL</Label>
                    <Input id={`variant-image-${index}`} type="url" {...register(`variants.${index}.imageUrl`)} placeholder="Optional" />
                  </div>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <input type="checkbox" {...register(`variants.${index}.isActive`)} className="size-4 accent-primary" />
                    Active
                  </label>
                  <div className="flex items-end justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} aria-label={`Remove variant ${index + 1}`}>
                      <Trash2 className="mr-2 size-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({
                  sku: "",
                  weight: "",
                  volume: "",
                  color: "",
                  size: "",
                  flavor: "",
                  packaging: "",
                  price: 1,
                  salePrice: null,
                  stockQuantity: 0,
                  imageUrl: "",
                  isActive: true,
                })}
              >
                <Plus className="mr-2 size-4" /> Add variant
              </Button>
            </div>
          )}
        </section>

        <section className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <div>
            <h2 className="font-medium">Product status</h2>
            <p className="text-sm text-muted-foreground">Active products are visible to customers.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("enabled")} className="size-4 accent-primary" />
            Active
          </label>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loadingOptions}>
            {isSubmitting ? (productId ? "Saving..." : "Creating...") : (productId ? "Save changes" : "Create product")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function toFormValues(product: SerializedProduct): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: product.price,
    salePrice: product.salePrice,
    imageUrl: product.imageUrl ?? "",
    enabled: product.enabled,
    brandId: product.brandId ?? "",
    categoryId: product.categoryId ?? "",
    variantsEnabled: product.variantsEnabled,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      weight: getVariantAttribute(variant.attributes, "weight"),
      volume: getVariantAttribute(variant.attributes, "volume"),
      color: getVariantAttribute(variant.attributes, "color"),
      size: getVariantAttribute(variant.attributes, "size"),
      flavor: getVariantAttribute(variant.attributes, "flavor"),
      packaging: getVariantAttribute(variant.attributes, "packaging"),
      price: variant.price,
      salePrice: variant.salePrice,
      stockQuantity: variant.stockQuantity,
      imageUrl: variant.imageUrl ?? "",
      isActive: variant.isActive,
    })),
  };
}

function getVariantAttribute(attributes: Record<string, string>, name: string): string {
  const entry = Object.entries(attributes).find(([key]) => key.toLowerCase() === name);
  return entry?.[1] ?? "";
}
