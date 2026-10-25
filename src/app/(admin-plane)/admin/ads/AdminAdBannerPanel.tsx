"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Megaphone,
  Power,
  Trash2,
  ExternalLink,
  Upload,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import {
  adminCreateAdBanner,
  adminToggleAdBanner,
  adminDeleteAdBanner,
} from "./ad-banner-actions";
import type { AdBannerRecord } from "@/repositories/ad-banner.repository";

// ──────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────
function formatDateLocal(date: Date): string {
  // yyyy-MM-ddTHH:mm for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function getBannerStatus(
  banner: AdBannerRecord
): "active" | "scheduled" | "expired" | "disabled" {
  const now = new Date();
  if (!banner.isEnabled) return "disabled";
  if (banner.endDate < now) return "expired";
  if (banner.startDate > now) return "scheduled";
  return "active";
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  },
  expired: {
    label: "Expired",
    icon: AlertTriangle,
    className:
      "bg-muted text-muted-foreground border border-border",
  },
  disabled: {
    label: "Disabled",
    icon: XCircle,
    className:
      "bg-destructive/10 text-destructive border border-destructive/20",
  },
} as const;

// ──────────────────────────────────────────────────────────
//  Banner Card
// ──────────────────────────────────────────────────────────
function BannerCard({
  banner,
  onToggle,
  onDelete,
}: {
  banner: AdBannerRecord;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const status = getBannerStatus(banner);
  const { label, icon: StatusIcon, className: statusClass } = STATUS_CONFIG[status];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
      {/* Preview Image */}
      <div className="relative aspect-[16/5] w-full bg-muted overflow-hidden">
        <Image
          src={banner.imageUrl}
          alt={banner.altText}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 700px"
        />
        {/* Status Badge overlay */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
        >
          <StatusIcon className="size-3" aria-hidden="true" />
          {label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong className="text-foreground">Start:</strong>{" "}
              {banner.startDate.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              <strong className="text-foreground">End:</strong>{" "}
              {banner.endDate.toLocaleString()}
            </span>
          </div>
        </div>

        {banner.altText && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Alt text: </span>
            {banner.altText}
          </p>
        )}

        {banner.linkUrl && (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="size-3" aria-hidden="true" />
            {banner.linkUrl}
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {/* Toggle */}
          <button
            type="button"
            aria-label={banner.isEnabled ? "Disable banner" : "Enable banner"}
            onClick={() => onToggle(banner.id, !banner.isEnabled)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              banner.isEnabled
                ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Power className="size-3.5" aria-hidden="true" />
            {banner.isEnabled ? "Enabled" : "Disabled"}
          </button>

          {/* Delete */}
          <button
            type="button"
            aria-label="Delete banner"
            onClick={() => onDelete(banner.id)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
//  Upload Form
// ──────────────────────────────────────────────────────────
function UploadBannerForm({
  onCreated,
}: {
  onCreated: (banner: AdBannerRecord) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const defaultStart = formatDateLocal(now);
  const defaultEnd = formatDateLocal(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

  const [form, setForm] = useState({
    altText: "Advertisement",
    linkUrl: "",
    isEnabled: false,
    startDate: defaultStart,
    endDate: defaultEnd,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { startUpload, isUploading } = useUploadThing("bannerImageUploader", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
      if (url) {
        setUploadedUrl(url);
        toast.success("Image uploaded successfully.");
      }
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadedUrl(null);
    startUpload([file]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!uploadedUrl) {
      setErrors({ imageUrl: "Please upload a banner image first." });
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (isNaN(startDate.getTime())) {
      setErrors({ startDate: "Invalid start date." });
      return;
    }
    if (isNaN(endDate.getTime())) {
      setErrors({ endDate: "Invalid end date." });
      return;
    }
    if (endDate <= startDate) {
      setErrors({ endDate: "End date must be after start date." });
      return;
    }

    startTransition(async () => {
      const result = await adminCreateAdBanner({
        imageUrl: uploadedUrl,
        altText: form.altText || "Advertisement",
        linkUrl: form.linkUrl || null,
        isEnabled: form.isEnabled,
        startDate,
        endDate,
      });

      if (!result.success) {
        if (result.error.details) {
          setErrors(result.error.details);
        }
        toast.error(result.error.message);
        return;
      }

      toast.success("Ad banner created successfully.");
      onCreated(result.data);

      // Reset form
      setPreview(null);
      setUploadedUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setForm({
        altText: "Advertisement",
        linkUrl: "",
        isEnabled: false,
        startDate: defaultStart,
        endDate: defaultEnd,
      });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5"
    >
      <h3 className="text-sm font-bold text-foreground">Upload New Ad Banner</h3>

      {/* Image upload area */}
      <div>
        <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
          Banner Image <span className="text-destructive">*</span>
        </label>

        {preview ? (
          <div className="relative aspect-[16/5] w-full rounded-xl overflow-hidden bg-muted border border-border mb-2">
            <Image src={preview} alt="Banner preview" fill className="object-cover" />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <div className="text-xs font-semibold text-foreground animate-pulse">
                  Uploading…
                </div>
              </div>
            )}
            {uploadedUrl && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                <CheckCircle2 className="size-3" aria-hidden="true" /> Uploaded
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[16/5] rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            <Upload className="size-6" aria-hidden="true" />
            <span className="text-xs font-semibold">Click to upload banner image</span>
            <span className="text-[10px]">PNG, JPG, WebP — max 4 MB</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          id="banner-image-input"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />

        {preview && (
          <button
            type="button"
            className="mt-1.5 text-xs text-primary underline"
            onClick={() => fileInputRef.current?.click()}
          >
            Change image
          </button>
        )}
        {errors.imageUrl && (
          <p className="mt-1 text-xs text-destructive">{errors.imageUrl}</p>
        )}
      </div>

      {/* Alt text */}
      <div>
        <label
          htmlFor="banner-alt-text"
          className="block text-xs font-semibold uppercase text-muted-foreground mb-1"
        >
          Alt Text
        </label>
        <input
          id="banner-alt-text"
          type="text"
          value={form.altText}
          onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
          placeholder="Advertisement"
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Link URL */}
      <div>
        <label
          htmlFor="banner-link-url"
          className="block text-xs font-semibold uppercase text-muted-foreground mb-1"
        >
          Link URL <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="banner-link-url"
          type="url"
          value={form.linkUrl}
          onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
          placeholder="https://example.com/promo"
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
        />
        {errors.linkUrl && (
          <p className="mt-1 text-xs text-destructive">{errors.linkUrl}</p>
        )}
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="banner-start-date"
            className="block text-xs font-semibold uppercase text-muted-foreground mb-1"
          >
            Start Date <span className="text-destructive">*</span>
          </label>
          <input
            id="banner-start-date"
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-destructive">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="banner-end-date"
            className="block text-xs font-semibold uppercase text-muted-foreground mb-1"
          >
            End Date <span className="text-destructive">*</span>
          </label>
          <input
            id="banner-end-date"
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-destructive">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.isEnabled}
          id="banner-enabled-toggle"
          onClick={() => setForm((f) => ({ ...f, isEnabled: !f.isEnabled }))}
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            form.isEnabled ? "bg-emerald-600" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              form.isEnabled ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </button>
        <label
          htmlFor="banner-enabled-toggle"
          className="text-sm font-semibold text-foreground cursor-pointer select-none"
        >
          Enable immediately after upload
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending || isUploading || !uploadedUrl}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-button transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isPending ? "Saving…" : "Save Banner"}
      </button>
    </form>
  );
}

// ──────────────────────────────────────────────────────────
//  Main Panel
// ──────────────────────────────────────────────────────────
interface AdminAdBannerPanelProps {
  initialBanners: AdBannerRecord[];
}

export function AdminAdBannerPanel({ initialBanners }: AdminAdBannerPanelProps) {
  const [banners, setBanners] = useState<AdBannerRecord[]>(initialBanners);
  const [isPending, startTransition] = useTransition();

  function handleCreated(banner: AdBannerRecord) {
    setBanners((prev) => [banner, ...prev]);
  }

  function handleToggle(id: string, isEnabled: boolean) {
    startTransition(async () => {
      const result = await adminToggleAdBanner({ id, isEnabled });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isEnabled } : b))
      );
      toast.success(isEnabled ? "Banner enabled." : "Banner disabled.");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await adminDeleteAdBanner(id);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner deleted.");
    });
  }

  return (
    <div
      id="ad-banner-panel"
      className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Megaphone className="size-5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Advertisement Banner
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload and schedule banners shown separately from the hero. Up to three
            active banners appear at the top, middle, and end of the homepage.
          </p>
        </div>
      </div>

      {/* Active banner status callout */}
      {(() => {
        const now = new Date();
        const activeBanners = banners.filter(
          (b) => b.isEnabled && b.startDate <= now && b.endDate >= now
        );
        if (activeBanners.length > 0) {
          return (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {Math.min(activeBanners.length, 3)} of 3 ad placements are currently live.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeBanners.length > 3
                    ? "The three newest active banners are shown."
                    : "Newest active banner appears at the top; the next two appear mid-page and at the end."}
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-start gap-3 rounded-xl bg-muted/40 border border-border px-4 py-3">
            <Megaphone className="size-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              No ad banners are active. The homepage hero displays independently.
            </p>
          </div>
        );
      })()}

      {/* Upload form */}
      <UploadBannerForm onCreated={handleCreated} />

      {/* Existing banners */}
      {banners.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            All Banners ({banners.length})
          </h3>
          <div className="space-y-4" aria-busy={isPending}>
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
