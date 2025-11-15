'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Remove requireRole - use program-based permissions via RouteGuard in each page
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}
