import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppClientShell } from './AppClientShell';

export const metadata: Metadata = {
  title: 'kitcomart',
  description: 'Weekly and monthly grocery essentials, carefully packed and delivered across Faisalabad.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: RootLayoutProps) {
  return <AppClientShell>{children}</AppClientShell>;
}
