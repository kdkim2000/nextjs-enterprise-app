'use client';

import NotFoundPage from '@/components/common/NotFoundPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function DashboardNotFound() {
  const locale = useCurrentLocale();

  return (
    <NotFoundPage
      title={locale === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'}
      message={
        locale === 'ko'
          ? '요청하신 대시보드 페이지가 존재하지 않거나 아직 준비 중입니다.'
          : 'The requested dashboard page does not exist or is still under construction.'
      }
      homeUrl={`/${locale}/dashboard`}
    />
  );
}
