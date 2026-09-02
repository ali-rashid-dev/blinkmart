import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppClientShell } from './AppClientShell';

export const metadata: Metadata = {
  title: 'Kit&Co',
  description: 'A modern shopping experience',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: RootLayoutProps) {
  return <AppClientShell>{children}</AppClientShell>;
}
