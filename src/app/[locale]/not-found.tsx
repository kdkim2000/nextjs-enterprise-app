'use client';

import NotFoundPage from '@/components/common/NotFoundPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function GlobalNotFound() {
  const locale = useCurrentLocale();

  return (
    <NotFoundPage
      title={locale === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found'}
      message={
        locale === 'ko'
          ? '요청하신 페이지가 존재하지 않습니다. URL을 확인하시거나 홈으로 돌아가세요.'
          : 'The page you are looking for does not exist. Please check the URL or go back to home.'
      }
      homeUrl={`/${locale}/dashboard`}
    />
  );
}
