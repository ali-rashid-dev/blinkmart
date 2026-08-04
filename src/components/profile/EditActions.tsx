import { CircleAlert, Loader2, RotateCcw } from "lucide-react";

type Props = {
  saving: boolean;
  hasErrors: boolean;
  onReset: () => void;
};

export function EditActions({ saving, hasErrors, onReset }: Props) {
  return (
    <section className="animate-rise rounded-3xl border border-border bg-card p-6 shadow-card sm:p-7">
      {hasErrors && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          Please fix the highlighted fields before saving.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="text-sm text-muted-foreground">Changes apply to future orders only.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onReset}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-muted active:translate-y-px"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold tracking-wide text-primary-foreground shadow-button transition-all duration-200 hover:-translate-y-0.5 hover:brightness-[1.06] active:translate-y-0 active:brightness-95 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Update profile
          </button>
        </div>
      </div>
    </section>
  );
}
