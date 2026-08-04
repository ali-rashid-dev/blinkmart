import { AppShell } from '@/components/layout/app-shell';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'BlinkMart',
  description: 'A modern shopping experience',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: RootLayoutProps) {
  return (
    <>
      <AppShell>{children}</AppShell>
    </>
  );
}
