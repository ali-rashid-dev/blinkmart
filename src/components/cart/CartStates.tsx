import { RotateCcw, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="animate-rise mx-auto flex max-w-md flex-col items-center rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <div className="grid size-20 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-9" aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-display text-xl text-foreground">Unable to load your cart</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Something went wrong while loading your cart.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)]"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <Skeleton className="size-20 shrink-0 rounded-2xl sm:size-24" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-2/5 rounded" />
              <Skeleton className="h-3 w-1/5 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex items-center justify-between gap-3 pt-1">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
