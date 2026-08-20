import { BellOff } from "lucide-react";

export function EmptyNotifications({ message }: { message: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-muted">
        <BellOff className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-4 text-sm font-semibold text-foreground">Nothing here yet</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
