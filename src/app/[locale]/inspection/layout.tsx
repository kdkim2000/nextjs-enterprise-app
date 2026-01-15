'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function InspectionLayout({
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
