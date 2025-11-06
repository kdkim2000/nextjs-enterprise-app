'use client';

import NotFoundPage from '@/components/common/NotFoundPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function AdminNotFound() {
  const locale = useCurrentLocale();

  return (
    <NotFoundPage
      title={locale === 'ko' ? '관리 페이지를 찾을 수 없습니다' : 'Admin Page Not Found'}
      message={
        locale === 'ko'
          ? '요청하신 관리 페이지가 존재하지 않거나 아직 준비 중입니다. 메뉴 관리에서 해당 페이지를 구현해야 할 수 있습니다.'
          : 'The requested admin page does not exist or is still under construction. You may need to implement this page in menu management.'
      }
      homeUrl={`/${locale}/admin`}
    />
  );
}
