import { Loader2 } from "lucide-react";

export function SubmitButton({
  loading,
  disabled,
  children,
}: {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold tracking-wide text-primary-foreground shadow-button transition-all duration-200 hover:brightness-[1.06] hover:-translate-y-0.5 active:translate-y-0 active:brightness-95 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
