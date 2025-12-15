'use client';

import { useTheme, useMediaQuery } from '@mui/material';

export interface UseMobileResult {
  isMobile: boolean;      // xs: < 600px
  isTablet: boolean;      // sm: 600~899px
  isDesktop: boolean;     // md+: >= 900px
  isMobileLayout: boolean; // md 미만: < 900px (모바일 레이아웃 적용 기준)
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * 모바일/태블릿/데스크톱 감지 훅
 *
 * @example
 * const { isMobileLayout, isDesktop } = useMobile();
 *
 * if (isMobileLayout) {
 *   return <MobileLayout />;
 * }
 * return <DesktopLayout />;
 */
export function useMobile(): UseMobileResult {
  const theme = useTheme();

  // 각 breakpoint에 대한 미디어 쿼리
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));      // 0~599px
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));      // 600~899px
  const isMd = useMediaQuery(theme.breakpoints.only('md'));      // 900~1199px
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));      // 1200~1535px
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));      // 1536px+
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));      // 900px+

  // 편의 속성
  const isMobile = isXs;                          // 모바일: < 600px
  const isTablet = isSm;                          // 태블릿: 600~899px
  const isDesktop = isMdUp;                       // 데스크톱: >= 900px
  const isMobileLayout = !isMdUp;                 // 모바일 레이아웃 적용: < 900px

  // 현재 breakpoint
  const breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' =
    isXs ? 'xs' :
    isSm ? 'sm' :
    isMd ? 'md' :
    isLg ? 'lg' :
    isXl ? 'xl' : 'md';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileLayout,
    breakpoint
  };
}

export default useMobile;
