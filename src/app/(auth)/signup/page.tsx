"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail, Lock, User, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { authClient } from "@/lib/auth-client";
import { getFieldErrors, isValidEmail, signupSchema } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  const validation = getFieldErrors(signupSchema, { name, email, password });
  const nameError = touched.name ? validation.name ?? "" : "";
  const emailError = touched.email ? validation.email ?? "" : "";
  const passwordError = touched.password ? validation.password ?? "" : "";
  const ready = signupSchema.safeParse({ name, email, password }).success;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!ready || loading) return;

    const trimmedEmail = email.trim();

    setFormError("");
    setLoading(true);

    const result = await authClient.signUp.email({
      name,
      email: trimmedEmail,
      password,
      callbackURL: "/",
    });

    setLoading(false);

    if (result.error) {
      setFormError(result.error.message || "Unable to create account right now.");
      return;
    }

    setDone(true);
    router.push("/");
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
          success={isValidEmail(email) ? "Looks good" : ""}
        />
        <FloatingInput
          label="Password"
          type="password"
          autoComplete="new-password"
          revealable
          icon={<Lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
        />

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
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
