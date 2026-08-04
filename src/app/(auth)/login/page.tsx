"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { authClient } from "@/lib/auth-client";
import { getFieldErrors, isValidEmail, loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  const trimmedEmail = email.trim();
  const validation = getFieldErrors(loginSchema, { email: trimmedEmail, password });
  const emailError = touched.email ? validation.email ?? "" : "";
  const passwordError = touched.password ? validation.password ?? "" : "";
  const ready = loginSchema.safeParse({ email: trimmedEmail, password }).success;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!ready || loading) return;

    const trimmedEmail = email.trim();

    setFormError("");
    setLoading(true);

    const result = await authClient.signIn.email({
      email: trimmedEmail,
      password,
      rememberMe: true,
      callbackURL: "/",
    });

    setLoading(false);

    if (result.error) {
      setFormError(result.error.message || "Unable to sign in right now.");
      return;
    }

    setDone(true);
    router.push("/");
  };

  return (
    <AuthLayout
      quote={{
        headline: "Groceries picked at dawn, at your door by noon.",
        body: "Seasonal produce from small farms, sourced with care and packed by hand.",
      }}
    >
      <h1 className="text-[2rem] leading-tight text-foreground">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to pick up your basket where you left it.
      </p>

      {formError && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      {done && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <Check className="size-4" /> Signed in successfully.
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        <FloatingInput
          label="Email address"
          type="email"
          autoComplete="email"
          icon={<Mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          success={isValidEmail(trimmedEmail) ? "Looks good" : ""}
        />
        <FloatingInput
          label="Password"
          type="password"
          autoComplete="current-password"
          revealable
          icon={<Lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
        />

        <div className="flex justify-end pt-1">
          <button
            type="button"
            className="rounded text-sm font-medium text-secondary underline-offset-4 transition-colors hover:text-primary hover:underline"
            onClick={() => router.push("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        <SubmitButton loading={loading} disabled={!ready}>
          {loading ? "Signing in…" : "Login"}
        </SubmitButton>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
