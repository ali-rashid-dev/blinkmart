"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail, Lock, User, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwFocused, setPwFocused] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passed = rules.filter((r) => r.test(password)).length;
  const strength = password ? passed : 0;
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];

  const nameError = touched.name && name.trim().length < 2 ? "Please enter your full name" : "";
  const emailError = touched.email && !emailValid(email) ? "Enter a valid email address" : "";
  const ready = name.trim().length >= 2 && emailValid(email) && passed >= 3;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  return (
    <AuthLayout
      quote={{
        headline: "A market that knows the name of every grower.",
        body: "Join thousands who shop seasonally, waste less, and eat remarkably well.",
      }}
    >
      <h1 className="text-[2rem] leading-tight text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fresh baskets, curated weekly, delivered to your door.
      </p>

      {done && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <Check className="size-4" /> Account created — welcome to the market.
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        <FloatingInput
          label="Full name"
          autoComplete="name"
          icon={<User />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={nameError}
        />
        <FloatingInput
          label="Email address"
          type="email"
          autoComplete="email"
          icon={<Mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          success={emailValid(email) ? "Looks good" : ""}
        />
        <Popover open={pwFocused || password.length > 0}>
          <PopoverAnchor asChild>
            <div>
              <FloatingInput
                label="Password"
                type="password"
                autoComplete="new-password"
                revealable
                icon={<Lock />}
                value={password}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={14}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="w-72 rounded-xl border-border bg-popover p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Password strength</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  strength <= 1 && "text-destructive",
                  strength === 2 && "text-primary",
                  strength === 3 && "text-secondary",
                  strength === 4 && "text-success",
                )}
              >
                {strengthLabel}
              </span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    i < strength
                      ? strength <= 1
                        ? "bg-destructive"
                        : strength === 2
                          ? "bg-primary"
                          : strength === 3
                            ? "bg-secondary"
                            : "bg-success"
                      : "bg-border",
                  )}
                />
              ))}
            </div>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {rules.map((r) => {
                const ok = r.test(password);
                return (
                  <li
                    key={r.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      ok ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    <Check className={cn("size-3.5", !ok && "opacity-35")} />
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>

        <SubmitButton loading={loading} disabled={!ready}>
          {loading ? "Creating account…" : "Create Account"}
        </SubmitButton>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
