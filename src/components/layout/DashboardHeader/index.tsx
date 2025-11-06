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
  Language,
  Check,
  Policy
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useChangeLocale, useI18n } from '@/lib/i18n/client';

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

  const handleLanguageChange = (newLocale: string) => {
    handleUserMenuClose();
    changeLocale(newLocale as 'en' | 'ko');
  };

  // Available languages - easily expandable
  const availableLanguages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ko', label: 'Korean', nativeLabel: '한국어' }
    // Add more languages here as needed:
    // { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
    // { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

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
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'secondary.main',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {getUserInitials()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {user?.name}
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
              {user?.name}
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

          {availableLanguages.map((lang) => (
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
                  <Language fontSize="small" sx={{ visibility: 'hidden' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={lang.nativeLabel}
                secondary={lang.label !== lang.nativeLabel ? lang.label : undefined}
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
