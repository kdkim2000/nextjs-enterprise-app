'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function DevLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  );
}
