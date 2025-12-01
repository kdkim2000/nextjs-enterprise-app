'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Box, CircularProgress } from '@mui/material';

export default function MailPage() {
  const router = useRouter();
  const locale = useCurrentLocale();

  useEffect(() => {
    // Redirect to /mail/inbox
    router.replace(`/${locale}/mail/inbox`);
  }, [router, locale]);

  // Show loading while redirecting
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
