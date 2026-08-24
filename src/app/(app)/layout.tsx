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
      {/* pb-20 ensures content isn't hidden behind the mobile bottom nav on small screens */}
      <div className="pb-20 lg:pb-0">{children}</div>
    </>
  );
}
