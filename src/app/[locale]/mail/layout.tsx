'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

/**
 * Mail Layout - Uses fullBleed mode for minimal padding
 * Mail pages manage their own scroll and layout
 */
export default function MailLayout({
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
