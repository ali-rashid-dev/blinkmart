"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { LoginDialogProvider } from "@/components/auth/LoginDialogContext";
import { LoginDialog } from "@/components/auth/LoginDialog";

export function AppClientShell({ children }: { children: ReactNode }) {
  return (
    <LoginDialogProvider>
      <Navbar />
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>
      <LoginDialog />
    </LoginDialogProvider>
  );
}
