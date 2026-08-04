import { BadgeCheck, CalendarDays, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileUser = {
  name: string;
  email: string;
  avatarUrl?: string;
  memberSince: string;
  tier: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Avatar({ user, size = "lg" }: { user: ProfileUser; size?: "lg" | "sm" }) {
  const dim = size === "lg" ? "size-24 text-2xl" : "size-11 text-sm";
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-accent font-display font-semibold text-accent-foreground shadow-soft",
        dim,
      )}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={`${user.name} profile photo`}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials(user.name)}</span>
      )}
      {!user.avatarUrl && <span className="sr-only">{user.name}</span>}
    </div>
  );
}

export function SummaryCard({
  user,
  completion,
}: {
  user: ProfileUser;
  completion: { percent: number; done: string[]; remaining: string[] };
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card sm:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-accent/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 size-48 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-5 text-primary/25"
      >
        <Sparkles className="size-5" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <Avatar user={user} />
        <h2 className="mt-4 font-display text-2xl leading-tight text-foreground">{user.name}</h2>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="size-3.5 shrink-0" />
          <span className="truncate">{user.email}</span>
        </p>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <BadgeCheck className="size-3.5" />
          {user.tier}
        </span>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Member since {user.memberSince}
        </p>
      </div>

      <div className="relative mt-6 border-t border-border pt-5">
        <CompletionBlock completion={completion} />
      </div>
    </section>
  );
}

export function CompletionBlock({
  completion,
}: {
  completion: { percent: number; done: string[]; remaining: string[] };
}) {
  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h3 className="truncate text-sm font-semibold text-foreground">Profile completion</h3>
        <span className="shrink-0 text-sm font-bold text-primary">{completion.percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={completion.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
        className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${completion.percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2 text-left">
        {completion.done.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <ShieldCheck className="size-3" />
            </span>
            <span className="truncate">{item}</span>
          </li>
        ))}
        {completion.remaining.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-4 shrink-0 rounded-full border border-dashed border-border" />
            <span className="truncate">{item} · pending</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
