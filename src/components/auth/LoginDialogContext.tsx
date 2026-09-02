"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface LoginDialogContextValue {
  open: boolean;
  redirectTo: string;
  openDialog: (redirectTo?: string) => void;
  closeDialog: () => void;
}

const LoginDialogContext = createContext<LoginDialogContextValue | null>(null);

export function LoginDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");

  const openDialog = (redirect = "/") => {
    setRedirectTo(redirect);
    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  return (
    <LoginDialogContext.Provider value={{ open, redirectTo, openDialog, closeDialog }}>
      {children}
    </LoginDialogContext.Provider>
  );
}

export function useLoginDialog() {
  const ctx = useContext(LoginDialogContext);
  if (!ctx) {
    throw new Error("useLoginDialog must be used within <LoginDialogProvider>");
  }
  return ctx;
}
