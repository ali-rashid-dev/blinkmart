"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail, Check, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, getFieldErrors, isValidEmail } from "@/schema/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [formError, setFormError] = useState("");

    const validation = getFieldErrors(forgotPasswordSchema, { email });
    const emailError = touched ? validation.email ?? "" : "";
    const ready = forgotPasswordSchema.safeParse({ email }).success;

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!ready || loading) return;

        setLoading(true);
        setFormError("");

        const { error } = await authClient.requestPasswordReset({
            email,
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setLoading(false);

        if (error) {
            setFormError(error.message || "We could not send a reset link right now.");
            return;
        }

        setSent(true);
    };

    return (
        <AuthLayout
            quote={{
                headline: "Every basket finds its way back home.",
                body: "We'll send you a link so you can pick up right where you left off.",
            }}
        >
            <h1 className="text-[2rem] leading-tight text-foreground">Forgot your password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Enter the email tied to your account and we&apos;ll send a reset link.
            </p>

            {formError ? (
                <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {formError}
                </div>
            ) : null}

            {sent ? (
                <div className="mt-7 space-y-6">
                    <div className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                        <Check className="mt-0.5 size-4 shrink-0" />
                        <span>
                            If an account exists for <span className="font-semibold">{email}</span>, a reset link
                            is on its way.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSent(false);
                            setFormError("");
                        }}
                        className="rounded text-sm font-medium text-secondary underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                        Use a different email
                    </button>
                </div>
            ) : (
                <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
                    <FloatingInput
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        icon={<Mail />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched(true)}
                        error={emailError}
                        success={isValidEmail(email) ? "Looks good" : ""}
                    />
                    <SubmitButton loading={loading} disabled={!ready}>
                        {loading ? "Sending link…" : "Send reset link"}
                    </SubmitButton>
                </form>
            )}

            <p className="mt-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
                >
                    <ArrowLeft className="size-4" /> Back to login
                </Link>
            </p>
        </AuthLayout>
    );
}
