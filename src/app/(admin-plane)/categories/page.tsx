"use client";

import { useState, useRef } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Upload,
} from "lucide-react";

import { useAdmin } from "@/lib/admin-store";
import { toast } from "sonner";

function CategoryDialog({
  trigger,
  title,
  defaultName = "",
  defaultImage = null,
  onSave,
}: {
  trigger: React.ReactNode;
  title: string;
  defaultName?: string;
  defaultImage?: string | null;
  onSave: (name: string, image: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [image, setImage] = useState<string | null>(defaultImage);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setImage(String(e.target?.result ?? ""));
    };

    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (value) {
          setName(defaultName);
          setImage(defaultImage);
        }
      }}
    >
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category Name</Label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pantry Staples"
            />
          </div>

          <div className="space-y-2">
            <Label>Category Image</Label>

            <div className="flex gap-3 items-center">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg border bg-accent">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Image URL"
                  value={image ?? ""}
                  onChange={(e) =>
                    setImage(e.target.value || null)
                  }
                />

                <input
                  ref={fileRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFile(e.target.files?.[0] ?? null)
                  }
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              if (!name.trim()) return;

              onSave(name.trim(), image);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAdmin();

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your catalog."
        actions={
          <CategoryDialog
            title="Add Category"
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            }
            onSave={(name, image) => {
              addCategory({
                name,
                image,
                enabled: true,
              });

              toast.success("Category added");
            }}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => {
          const count = products.filter(
            (p) => p.categoryId === category.id
          ).length;

          return (
            <div
              key={category.id}
              className="paper-card p-5"
            >
              <div className="flex gap-4">
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg border bg-accent">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold">
                      {category.name}
                    </h3>

                    {!category.enabled && (
                      <Badge>Disabled</Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {count} products
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex gap-2">
                  <CategoryDialog
                    title="Edit Category"
                    defaultName={category.name}
                    defaultImage={category.image}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    }
                    onSave={(name, image) => {
                      updateCategory(category.id, {
                        name,
                        image,
                      });

                      toast.success("Updated");
                    }}
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      deleteCategory(category.id);
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>

                <Switch
                  checked={category.enabled}
                  onCheckedChange={(value) => {
                    updateCategory(category.id, {
                      enabled: value,
                    });

                    toast.success(
                      value
                        ? "Enabled"
                        : "Disabled"
                    );
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}