'use client';

import ComingSoonPage from '@/components/common/ComingSoonPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function SalesReportPage() {
  const locale = useCurrentLocale();

  return (
    <ComingSoonPage
      title={locale === 'ko' ? '판매 보고서' : 'Sales Report'}
      featureName={locale === 'ko' ? '판매 분석 및 보고서' : 'Sales Analysis and Reporting'}
      message={
        locale === 'ko'
          ? '판매 보고서 기능은 현재 개발 중입니다. 판매 데이터 분석, 차트, 통계 등의 기능이 제공될 예정입니다.'
          : 'The Sales Report feature is currently under development. It will provide sales data analysis, charts, statistics, and more.'
      }
      homeUrl={`/${locale}/dashboard`}
    />
  );
}
