"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { LoginDialogProvider } from "@/components/auth/LoginDialogContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { CompleteProfileBanner } from "@/components/profile/CompleteProfileBanner";
import { Footer } from "@/components/layout/Footer";

export function AppClientShell({ children }: { children: ReactNode }) {
  return (
    <LoginDialogProvider>
      <Navbar />
      <CompleteProfileBanner />
      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
        <Footer />
      </div>
      <LoginDialog />
    </LoginDialogProvider>
  );
}
