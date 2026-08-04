import type { ReactNode } from "react";
import { CircleAlert, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

function StatusRow({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "neutral";
  icon: ReactNode;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5">
      <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
          tone === "success" && "bg-success/12 text-success",
          tone === "warning" && "bg-destructive/10 text-destructive",
          tone === "neutral" && "bg-muted text-muted-foreground",
        )}
      >
        {value}
      </span>
    </li>
  );
}

export function AccountStatusCard() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg text-foreground">Account status</h2>
      <ul className="mt-2 divide-y divide-border">
        <StatusRow label="Email address" value="Verified" tone="success" icon={<ShieldCheck />} />
        <StatusRow label="Phone number" value="Unverified" tone="warning" icon={<CircleAlert />} />
        <StatusRow label="Role" value="Customer" icon={<UserRound />} />
        <StatusRow label="Account created" value="12 Mar 2024" icon={<Clock3 />} />
        <StatusRow label="Last updated" value="2 days ago" icon={<Clock3 />} />
      </ul>
    </section>
  );
}
