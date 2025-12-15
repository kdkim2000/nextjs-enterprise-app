'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveLayout showAutoLogoutWarning>
      {children}
    </ResponsiveLayout>
  );
}
