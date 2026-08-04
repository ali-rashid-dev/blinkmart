import type { ChangeEvent } from "react";
import { Home, MapPin } from "lucide-react";
import { ProfileField } from "@/components/profile/ProfileField";
import { getAddressLines, type ProfileForm } from "@/components/profile/profileForm";

type Props = {
  form: ProfileForm;
  editing: boolean;
  postalError: string;
  set: (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) => void;
};

export function DeliveryAddressSection({ form, editing, postalError, set }: Props) {
  const addressLines = getAddressLines(form);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="truncate font-display text-xl text-foreground">Delivery address</h2>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <MapPin className="size-3.5" />
          Default
        </span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ProfileField
          label="Street"
          placeholder="e.g. Main Boulevard"
          value={form.street}
          onChange={set("street")}
          disabled={!editing}
          autoComplete="address-line2"
        />
        <ProfileField
          label="Area / colony / society"
          placeholder="e.g. DHA Phase 6"
          value={form.area}
          onChange={set("area")}
          disabled={!editing}
          hint="Helps us pick the nearest store"
        />
        <ProfileField
          label="City"
          placeholder="e.g. Lahore"
          value={form.city}
          onChange={set("city")}
          disabled={!editing}
          autoComplete="address-level2"
        />
        <ProfileField
          label="Postal code"
          placeholder="54792"
          value={form.postal}
          onChange={set("postal")}
          disabled={!editing}
          error={postalError}
          inputMode="numeric"
          autoComplete="postal-code"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-muted/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Address preview
        </p>
        {addressLines.length > 0 ? (
          <div className="mt-3 flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-soft">
              <Home className="size-4" />
            </span>
            <address className="min-w-0 not-italic text-[15px] leading-relaxed text-foreground">
              {addressLines.map((line) => (
                <span key={line} className="block truncate">
                  {line}
                </span>
              ))}
            </address>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-border">
              <MapPin className="size-4" />
            </span>
            No delivery address saved yet.
          </div>
        )}
      </div>
    </section>
  );
}
