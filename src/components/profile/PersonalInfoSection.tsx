import type { ChangeEvent } from "react";
import { Pencil } from "lucide-react";
import { ProfileField } from "@/components/profile/ProfileField";
import type { ProfileForm } from "@/components/profile/profileForm";

type Props = {
  form: ProfileForm;
  editing: boolean;
  phoneError: string;
  onEdit: () => void;
  set: (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) => void;
};

export function PersonalInfoSection({ form, editing, phoneError, onEdit, set }: Props) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl text-foreground">Personal information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is how we address you and reach you about orders.
          </p>
        </div>
        {editing ? (
          <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Editing
          </span>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-muted active:translate-y-px"
          >
            <Pencil className="size-4" />
            Edit profile
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ProfileField
          label="Full name"
          placeholder="e.g. Ayesha Rahman"
          value={form.fullName}
          onChange={set("fullName")}
          disabled={!editing}
          success={editing && form.fullName.trim().length > 2 ? "Looks good" : undefined}
          autoComplete="name"
        />
        <ProfileField
          label="Email address"
          value={form.email}
          readOnly
          disabled
          tooltip="Your email is linked to your Google sign-in and can't be changed here."
          hint="Linked to your Google account"
          adornment={
            <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-semibold text-success">
              Verified
            </span>
          }
        />
        <ProfileField
          label="Phone number"
          placeholder="+92 3XX XXXXXXX"
          value={form.phone}
          onChange={set("phone")}
          disabled={!editing}
          error={phoneError}
          hint={phoneError ? undefined : "Used by riders for delivery updates"}
          inputMode="tel"
          autoComplete="tel"
        />
        <ProfileField
          label="House / Flat no."
          placeholder="e.g. 25-B"
          value={form.house}
          onChange={set("house")}
          disabled={!editing}
          autoComplete="address-line1"
        />
      </div>
    </section>
  );
}
