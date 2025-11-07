'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayout showAutoLogoutWarning>
      {children}
    </AuthenticatedLayout>
  );
}
