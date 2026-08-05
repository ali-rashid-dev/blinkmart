import type { ReactNode } from "react";
import { CircleAlert, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { accountStatusInfoSchema, type AccountStatusInfo } from "@/validations/profile";
import { cn } from "@/lib/utils";

export { accountStatusInfoSchema, type AccountStatusInfo };

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

function formatDate(value?: Date | string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(value?: Date | string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  return formatDate(value);
}

export function AccountStatusCard({ status }: { status?: AccountStatusInfo }) {
  const isEmailVerified = status?.emailVerified ?? true;
  const hasPhone = Boolean(status?.phone && status.phone.trim().length > 0);
  const roleDisplay = status?.role === "ADMIN" ? "Administrator" : status?.role ? "Customer" : "Customer";
  const createdAtDisplay = formatDate(status?.createdAt);
  const updatedAtDisplay = formatRelativeTime(status?.updatedAt);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg text-foreground">Account status</h2>
      <ul className="mt-2 divide-y divide-border">
        <StatusRow
          label="Email address"
          value={isEmailVerified ? "Verified" : "Unverified"}
          tone={isEmailVerified ? "success" : "warning"}
          icon={isEmailVerified ? <ShieldCheck /> : <CircleAlert />}
        />
        <StatusRow
          label="Phone number"
          value={hasPhone ? "Verified" : "Unverified"}
          tone={hasPhone ? "success" : "warning"}
          icon={hasPhone ? <ShieldCheck /> : <CircleAlert />}
        />
        <StatusRow label="Role" value={roleDisplay} tone="neutral" icon={<UserRound />} />
        <StatusRow label="Account created" value={createdAtDisplay} tone="neutral" icon={<Clock3 />} />
        <StatusRow label="Last updated" value={updatedAtDisplay} tone="neutral" icon={<Clock3 />} />
      </ul>
    </section>
  );
}
