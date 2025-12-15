'use client';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  );
}
