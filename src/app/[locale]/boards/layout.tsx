'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function BoardsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveLayout fullBleed>
      {children}
    </ResponsiveLayout>
  );
}
