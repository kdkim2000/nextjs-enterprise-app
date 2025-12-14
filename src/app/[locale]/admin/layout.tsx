'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Remove requireRole - use program-based permissions via RouteGuard in each page
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  );
}
