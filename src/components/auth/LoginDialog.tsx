"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Check, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { authClient } from "@/lib/auth-client";
import { getFieldErrors, isValidEmail, loginSchema } from "@/validations/auth";
import { useLoginDialog } from "./LoginDialogContext";

export function LoginDialog() {
  const router = useRouter();
  const { open, redirectTo, closeDialog } = useLoginDialog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  const trimmedEmail = email.trim();
  const validation = getFieldErrors(loginSchema, { email: trimmedEmail, password });
  const emailError = touched.email ? (validation.email ?? "") : "";
  const passwordError = touched.password ? (validation.password ?? "") : "";
  const ready = loginSchema.safeParse({ email: trimmedEmail, password }).success;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setTouched({ email: false, password: false });
    setFormError("");
    setDone(false);
    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeDialog();
      // Reset form after dialog close animation
      setTimeout(resetForm, 200);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!ready || loading) return;

    setFormError("");
    setLoading(true);

    const result = await authClient.signIn.email({
      email: trimmedEmail,
      password,
      rememberMe: true,
      callbackURL: redirectTo,
    });

    setLoading(false);

    if (result.error) {
      setFormError(result.error.message || "Unable to sign in right now.");
      return;
    }

    setDone(true);
    closeDialog();
    router.push(redirectTo);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        {/* Header gradient strip */}
        <div className="bg-primary px-6 pt-8 pb-6 text-primary-foreground">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
              <ShoppingBag className="size-4" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight">Kit&amp;Co</span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary-foreground">
              Sign in to continue
            </DialogTitle>
            <DialogDescription className="text-sm text-primary-foreground/75 mt-1">
              You need to be logged in to checkout.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-5 space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
            >
              {formError}
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <Check className="size-4" /> Signed in successfully. Redirecting…
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
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

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded text-sm font-medium text-secondary underline-offset-4 transition-colors hover:text-primary hover:underline"
                onClick={() => {
                  closeDialog();
                  router.push("/forgot-password");
                }}
              >
                Forgot password?
              </button>
            </div>

            <SubmitButton loading={loading} disabled={!ready}>
              {loading ? "Signing in…" : "Sign In"}
            </SubmitButton>
          </form>

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton label="Continue with Google" />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={closeDialog}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
