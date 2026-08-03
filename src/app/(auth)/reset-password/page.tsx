"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const rules = [
    { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
    { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
    { label: "One number", test: (v: string) => /\d/.test(v) },
    { label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const passed = rules.filter((r) => r.test(password)).length;

    const confirmError =
        confirmTouched && confirm !== password ? "Passwords don't match" : "";
    const ready = passed >= 3 && confirm === password && confirm.length > 0;

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
                headline: "A fresh start, just like the morning harvest.",
                body: "Pick a strong new password and your basket is waiting.",
            }}
        >
            <h1 className="text-[2rem] leading-tight text-foreground">Set a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Choose something memorable — and hard to guess.
            </p>

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
                    onChange={(e) => setPassword(e.target.value)}
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
