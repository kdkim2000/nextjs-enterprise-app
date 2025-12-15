'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Person,
  Check,
  Policy
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useChangeLocale, useI18n } from '@/lib/i18n/client';
import { getAvatarUrl } from '@/lib/config';
import { useAppSettings } from '@/hooks/useAppSettings';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { authApi } from '@/lib/axios';

const MOBILE_HEADER_HEIGHT = 56;

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export default function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const t = useI18n();
  const { user, logout } = useAuth();
  const { getSetting, getLocalizedSetting } = useAppSettings();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
  const displayName = user?.name_ko || user?.name_en || user?.name || '';

  // Menu handlers
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    router.push(`/${locale}/dashboard/settings`);
  };

  const handleSettings = () => {
    handleUserMenuClose();
    router.push(`/${locale}/dashboard/settings`);
  };

  const handlePrivacyPolicy = () => {
    handleUserMenuClose();
    router.push(`/${locale}/privacy-policy`);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    router.push(`/${locale}/login`);
  };

  const handleLanguageChange = async (newLocale: string) => {
    handleUserMenuClose();
    changeLocale(newLocale as 'en' | 'ko' | 'zh' | 'vi');

    try {
      await authApi.patch('/user-settings/general', {
        language: newLocale
      });
    } catch (error) {
      console.error('[MobileHeader] Failed to save language preference:', error);
    }
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
          onClick={handleUserMenuClick}
          sx={{ p: 0.5 }}
          aria-label={t('header.profile')}
        >
          <Avatar
            src={avatarSrc}
            alt={displayName}
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

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleUserMenuClose}
          onClick={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 220,
              mt: 1,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.25,
                fontSize: '0.875rem'
              }
            }
          }}
        >
          {/* User Info */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('header.profile')}</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('header.settings')}</ListItemText>
          </MenuItem>

          <MenuItem onClick={handlePrivacyPolicy}>
            <ListItemIcon>
              <Policy fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('header.privacyPolicy')}</ListItemText>
          </MenuItem>

          <Divider />

          {/* Language Selection */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {t('header.language')}
            </Typography>
          </Box>

          {SUPPORTED_LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={locale === lang.code}
              sx={{
                pl: 3,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {locale === lang.code ? (
                  <Check fontSize="small" color="primary" />
                ) : (
                  <Box component="span" sx={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>
                    {lang.flag}
                  </Box>
                )}
              </ListItemIcon>
              <ListItemText
                primary={lang.nativeName}
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: locale === lang.code ? 600 : 400
                }}
              />
            </MenuItem>
          ))}

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>{t('header.logout')}</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export { MOBILE_HEADER_HEIGHT };
