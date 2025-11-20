'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
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
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n/languages';
import { getAvatarUrl } from '@/lib/config';
import { api } from '@/lib/axios';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const t = useI18n();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

    // Change locale immediately for better UX
    changeLocale(newLocale as LanguageCode);

    // Save to backend asynchronously
    try {
      await api.put('/user/preferences', {
        language: newLocale
      });
      console.log(`[DashboardHeader] Language preference saved: ${newLocale}`);
    } catch (error) {
      console.error('[DashboardHeader] Failed to save language preference:', error);
      // Don't show error to user - language is already changed locally
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    // Try name_ko first, then name_en, then name
    const displayName = user?.name_ko || user?.name_en || user?.name || '';
    if (!displayName) return '?';

    // Check if name contains Korean characters
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(displayName);

    if (hasKorean) {
      // For Korean names, take 1 character (usually the last name)
      return displayName.substring(0, 1);
    } else {
      // For English/other names, take 2 characters
      return displayName.substring(0, 2).toUpperCase();
    }
  };

  // Get avatar source with priority: avatar_image > avatar_url > initials
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

  return (
    <AppBar position="static" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, flexShrink: 0 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
          aria-label={t('header.toggleMenu')}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('common.appName')}
        </Typography>

        <Box
          onClick={handleUserMenuClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 1,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Avatar
            src={avatarSrc}
            alt={displayName}
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'secondary.main',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {!avatarSrc && getUserInitials()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {displayName}
          </Typography>
        </Box>

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
              minWidth: 200,
              mt: 1.5,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5
              }
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
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

          {/* Language Selection Section */}
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
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }
              }}
            >
              <ListItemIcon>
                {locale === lang.code ? (
                  <Check fontSize="small" color="primary" />
                ) : (
                  <Box component="span" sx={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>
                    {lang.flag}
                  </Box>
                )}
              </ListItemIcon>
              <ListItemText
                primary={lang.nativeName}
                secondary={lang.name !== lang.nativeName ? lang.name : undefined}
                primaryTypographyProps={{ fontWeight: locale === lang.code ? 600 : 400 }}
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
