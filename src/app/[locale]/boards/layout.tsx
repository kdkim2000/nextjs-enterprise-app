'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function BoardsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout fullBleed>
      {children}
    </AuthenticatedLayout>
  );
}
