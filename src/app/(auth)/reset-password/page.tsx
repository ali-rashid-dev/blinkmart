"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { authClient } from "@/lib/auth-client";
import { getFieldErrors, resetPasswordSchema } from "@/schema/auth";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [formError, setFormError] = useState("");

    const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") ?? "" : "";
    const validation = getFieldErrors(resetPasswordSchema, {
        password,
        confirmPassword: confirm,
        token,
    });
    const passwordError = passwordTouched ? validation.password ?? "" : "";
    const confirmError = confirmTouched ? validation.confirmPassword ?? "" : "";
    const ready = resetPasswordSchema.safeParse({ password, confirmPassword: confirm, token }).success;

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!ready || loading) return;

        setLoading(true);
        setFormError("");

        if (!token) {
            setLoading(false);
            setFormError("This reset link is invalid or missing a token.");
            return;
        }

        const { error } = await authClient.resetPassword({
            newPassword: password,
            token,
        });

        setLoading(false);

        if (error) {
            setFormError(error.message || "We could not reset your password right now.");
            return;
        }

        setDone(true);
        setPassword("");
        setConfirm("");
        setPasswordTouched(false);
        setConfirmTouched(false);
    };

    return (
        <AuthLayout
            quote={{
                headline: "A fresh start, just like the morning harvest.",
                body: "Pick a strong new password and your basket is waiting.",
            }}
        >
            <h1 className="text-[2rem] leading-tight text-foreground">Set a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Choose something memorable — and hard to guess.
            </p>

            {formError ? (
                <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {formError}
                </div>
            ) : null}

            {done && (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                    <Check className="size-4" /> Password updated — you can log in now.
                </div>
            )}

            <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
                <FloatingInput
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    revealable
                    icon={<Lock />}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordTouched(true);
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    error={passwordError}
                />


                <FloatingInput
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    revealable
                    icon={<Lock />}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    error={confirmError}
                    success={confirm.length > 0 && confirm === password ? "Passwords match" : ""}
                />

                <SubmitButton loading={loading} disabled={!ready}>
                    {loading ? "Updating…" : "Reset password"}
                </SubmitButton>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Back to login
                </Link>
            </p>
        </AuthLayout>
    );
}
