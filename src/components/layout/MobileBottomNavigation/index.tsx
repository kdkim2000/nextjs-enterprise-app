'use client';

import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMenu } from '@/hooks/useMenu';

const BOTTOM_NAV_HEIGHT = 56;

interface MobileBottomNavigationProps {
  onMenuOpen: () => void;
}

type NavValue = 'dashboard' | 'favorites' | 'menu' | 'settings';

export default function MobileBottomNavigation({ onMenuOpen }: MobileBottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const t = useI18n();
  const { favoriteMenus } = useMenu();

  // Determine current nav value based on pathname
  const getCurrentValue = (): NavValue => {
    if (pathname.includes('/dashboard/settings')) {
      return 'settings';
    }
    if (pathname.includes('/dashboard') && !pathname.includes('/dashboard/')) {
      return 'dashboard';
    }
    // Default to menu for other pages
    return 'menu';
  };

  const currentValue = getCurrentValue();

  const handleNavChange = (event: React.SyntheticEvent, newValue: NavValue) => {
    switch (newValue) {
      case 'dashboard':
        router.push(`/${locale}/dashboard`);
        break;
      case 'favorites':
        // If there are favorites, navigate to the first one
        // Otherwise open the menu drawer
        if (favoriteMenus.length > 0) {
          const firstFavorite = favoriteMenus[0];
          if (firstFavorite.boardTypeId && firstFavorite.path?.startsWith('/boards')) {
            router.push(`/${locale}/boards/${firstFavorite.boardTypeId}`);
          } else {
            router.push(`/${locale}${firstFavorite.path}`);
          }
        } else {
          onMenuOpen();
        }
        break;
      case 'menu':
        onMenuOpen();
        break;
      case 'settings':
        router.push(`/${locale}/dashboard/settings`);
        break;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <BottomNavigation
        value={currentValue}
        onChange={handleNavChange}
        showLabels
        sx={{
          height: BOTTOM_NAV_HEIGHT,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        }}
      >
        <BottomNavigationAction
          label={t('menu.dashboard')}
          value="dashboard"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label={t('menu.favorites')}
          value="favorites"
          icon={
            <Badge
              badgeContent={favoriteMenus.length}
              color="primary"
              max={9}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                },
              }}
            >
              <StarIcon />
            </Badge>
          }
        />
        <BottomNavigationAction
          label={t('menu.menu')}
          value="menu"
          icon={<MenuIcon />}
        />
        <BottomNavigationAction
          label={t('menu.settings')}
          value="settings"
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}

export { BOTTOM_NAV_HEIGHT };
