import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "BlinkMart Admin",
  description: "BlinkMart administration panel",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: RootLayoutProps) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  // Not logged in → go to login
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch real role from DB (Better Auth session doesn't expose custom fields)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Logged in but not an admin → go to home
  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <>
      <AppShell>{children}</AppShell>
    </>
  );
}
