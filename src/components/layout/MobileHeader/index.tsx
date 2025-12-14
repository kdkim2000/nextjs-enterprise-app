'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { getAvatarUrl } from '@/lib/config';
import { useAppSettings } from '@/hooks/useAppSettings';

const MOBILE_HEADER_HEIGHT = 56;

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export default function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n();
  const { user } = useAuth();
  const { getSetting, getLocalizedSetting } = useAppSettings();

  // Get app name and logo from settings
  const appName = getLocalizedSetting('app_name', t('common.appName'));
  const appLogo = getSetting('app_logo');

  // Get user initials for avatar
  const getUserInitials = () => {
    const displayName = user?.name_ko || user?.name_en || user?.name || '';
    if (!displayName) return '?';

    // Check if name contains Korean characters
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(displayName);

    if (hasKorean) {
      return displayName.substring(0, 1);
    } else {
      return displayName.substring(0, 2).toUpperCase();
    }
  };

  // Get avatar source
  const getAvatarSrc = () => {
    if (user?.avatar_image) {
      return user.avatar_image;
    }
    if (user?.avatarUrl) {
      return getAvatarUrl(user.avatarUrl);
    }
    return undefined;
  };

  const avatarSrc = getAvatarSrc();

  const handleAvatarClick = () => {
    router.push(`/${locale}/dashboard/settings`);
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: MOBILE_HEADER_HEIGHT,
          height: MOBILE_HEADER_HEIGHT,
          px: 1,
        }}
      >
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuOpen}
          aria-label={t('header.toggleMenu')}
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo & App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          {appLogo && (
            <Box
              component="img"
              src={appLogo}
              alt="Logo"
              sx={{
                height: 28,
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          )}
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            sx={{ fontWeight: 600 }}
          >
            {appName}
          </Typography>
        </Box>

        {/* User Avatar */}
        <IconButton
          onClick={handleAvatarClick}
          sx={{ p: 0.5 }}
          aria-label={t('header.profile')}
        >
          <Avatar
            src={avatarSrc}
            alt={user?.name_ko || user?.name_en || ''}
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'secondary.main',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {!avatarSrc && getUserInitials()}
          </Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export { MOBILE_HEADER_HEIGHT };
