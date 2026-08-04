"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Check } from "lucide-react";
import { SummaryCard, type ProfileUser } from "@/components/profile/SummaryCard";
import { AccountStatusCard } from "@/components/profile/AccountStatusCard";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";
import { DeliveryAddressSection } from "@/components/profile/DeliveryAddressSection";
import { EditActions } from "@/components/profile/EditActions";
import {
  getCompletion,
  getPhoneError,
  getPostalError,
  initialProfileForm,
  type ProfileForm,
} from "@/components/profile/profileForm";

const user: ProfileUser = {
  name: "Ayesha Rahman",
  email: "ayesha.rahman@gmail.com",
  memberSince: "March 2024",
  tier: "Verified Customer",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(initialProfileForm);
  const [savedForm, setSavedForm] = useState<ProfileForm>(initialProfileForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  const phoneError = getPhoneError(form.phone);
  const postalError = getPostalError(form.postal);
  const completion = useMemo(() => getCompletion(form), [form]);

  const dirty = (Object.keys(form) as (keyof ProfileForm)[]).some((k) => form[k] !== savedForm[k]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing || phoneError || postalError) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setSavedForm(form);
      setEditing(false);
    }, 900);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 size-96 rounded-full bg-accent/60 blur-3xl animate-soft-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-0 size-96 rounded-full bg-secondary/10 blur-3xl animate-soft-float"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-14 2xl:max-w-7xl">
        <header className="animate-rise">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your account
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            Profile &amp; delivery details
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Keep your details fresh so every basket arrives at the right doorstep, on time.
          </p>
        </header>

        <div className="mt-8 grid animate-rise gap-6 lg:mt-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start xl:gap-8">
          <div className="space-y-6 lg:sticky lg:top-8">
            <SummaryCard user={user} completion={completion} />
            <AccountStatusCard />
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <PersonalInfoSection
              form={form}
              editing={editing}
              phoneError={phoneError}
              set={set}
              onEdit={() => {
                setEditing(true);
                setSaved(false);
              }}
            />

            <DeliveryAddressSection
              form={form}
              editing={editing}
              postalError={postalError}
              set={set}
            />

            {saved && !editing && (
              <p className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
                <Check className="size-4 shrink-0" />
                Your profile has been updated.
              </p>
            )}

            {editing && dirty && (
              <EditActions
                saving={saving}
                hasErrors={!!(phoneError || postalError)}
                onReset={() => {
                  setForm(savedForm);
                  setSaved(false);
                  setEditing(false);
                }}
              />
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
