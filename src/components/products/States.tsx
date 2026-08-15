import { PackageOpen, RotateCcw, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-rise flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-accent text-accent-foreground">
        <PackageOpen className="size-9" />
      </div>
      <h2 className="mt-5 font-display text-xl text-foreground">No products found</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The shelf is empty for these filters. Try widening your price range or clearing a category.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform hover:scale-[1.02]"
      >
        <RotateCcw className="size-4" />
        Reset filters
      </button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="animate-rise flex flex-col items-center rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <div className="grid size-20 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-9" />
      </div>
      <h2 className="mt-5 font-display text-xl text-foreground">The shelf didn't load</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Something went wrong while fetching today's stock. Give it another go.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)]"
      >
        <RotateCcw className="size-4" />
        Retry
      </button>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24 rounded-lg" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-3xl border border-border bg-card p-3">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaginationSkeleton() {
  return <Skeleton className="h-16 w-full rounded-2xl" />;
}
