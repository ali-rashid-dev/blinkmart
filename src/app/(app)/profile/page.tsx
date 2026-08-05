"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { getProfile, updateProfile } from "@/app/(app)/profile/actions";
import { SummaryCard, type ProfileUser } from "@/components/profile/SummaryCard";
import { AccountStatusCard, type AccountStatusInfo } from "@/components/profile/AccountStatusCard";
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
import type { ProfileData } from "@/services/profile.service";

function buildFormFromProfile(profile: ProfileData): ProfileForm {
  return {
    fullName: profile.name,
    email: profile.email,
    phone: profile.phone ?? "",
    house: profile.houseNo ?? "",
    street: profile.street ?? "",
    area: profile.area ?? "",
    city: profile.city ?? "",
    postal: profile.postalCode ?? "",
  };
}

function formatMemberSince(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(value));
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(initialProfileForm);
  const [savedForm, setSavedForm] = useState<ProfileForm>(initialProfileForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatusInfo | null>(null);
  const [profileUser, setProfileUser] = useState<ProfileUser>({
    name: "",
    email: "",
    memberSince: "",
    tier: "Verified Customer",
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const result = await getProfile();

        if (!active) return;

        if (result.success) {
          const nextForm = buildFormFromProfile(result.data);
          setForm(nextForm);
          setSavedForm(nextForm);
          setProfileUser({
            name: result.data.name,
            email: result.data.email,
            avatarUrl: result.data.image ?? undefined,
            memberSince: formatMemberSince(result.data.memberSince),
            tier: result.data.role === "ADMIN" ? "Administrator" : "Verified Customer",
          });
          setAccountStatus({
            emailVerified: result.data.emailVerified,
            phone: result.data.phone,
            role: result.data.role,
            createdAt: result.data.memberSince,
            updatedAt: result.data.updatedAt,
          });
        } else {
          setError(result.error.message);
        }
      } catch {
        if (!active) return;
        setError("Unable to load your profile right now.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const set = (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  const phoneError = getPhoneError(form.phone);
  const postalError = getPostalError(form.postal);
  const completion = useMemo(() => getCompletion(form), [form]);

  const dirty = (Object.keys(form) as (keyof ProfileForm)[]).some((k) => form[k] !== savedForm[k]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || phoneError || postalError) return;

    setSaving(true);
    setError(null);

    try {
      const result = await updateProfile({
        name: form.fullName.trim(),
        phone: form.phone.replace(/\s+/g, "") || undefined,
        houseNo: form.house.trim() || undefined,
        street: form.street.trim() || undefined,
        area: form.area.trim() || undefined,
        city: form.city.trim() || undefined,
        postalCode: form.postal.trim() || undefined,
      });

      if (result.success) {
        const nextForm = buildFormFromProfile(result.data);
        setForm(nextForm);
        setSavedForm(nextForm);
        setProfileUser({
          name: result.data.name,
          email: result.data.email,
          avatarUrl: result.data.image ?? undefined,
          memberSince: formatMemberSince(result.data.memberSince),
          tier: result.data.role === "ADMIN" ? "Administrator" : "Verified Customer",
        });
        setAccountStatus({
          emailVerified: result.data.emailVerified,
          phone: result.data.phone,
          role: result.data.role,
          createdAt: result.data.memberSince,
          updatedAt: result.data.updatedAt,
        });
        setSaved(true);
        setEditing(false);
        return;
      }

      setError(result.error.message);
    } catch {
      setError("Unable to update your profile right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-card">
          <Loader2 className="size-4 animate-spin text-primary" />
          Loading your profile…
        </div>
      </main>
    );
  }

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
            <SummaryCard user={profileUser} completion={completion} />
            <AccountStatusCard
              status={
                accountStatus
                  ? {
                      ...accountStatus,
                      phone: accountStatus.phone ?? savedForm.phone,
                    }
                  : undefined
              }
            />
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
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
