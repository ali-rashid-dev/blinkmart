import { Navbar } from '@/components/layout/navbar';
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
      <Navbar />
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
    </>
  );
}
