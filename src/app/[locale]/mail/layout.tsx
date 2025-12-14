'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

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
    <ResponsiveLayout fullBleed>
      {children}
    </ResponsiveLayout>
  );
}
