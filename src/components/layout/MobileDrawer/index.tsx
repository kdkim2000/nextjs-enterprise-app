'use client';

import React, { useState } from 'react';
import {
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Tabs,
  Tab,
  Avatar,
  Typography,
  Divider
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Star,
  StarBorder,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { MenuItem } from '@/types/menu';
import { useMenu } from '@/hooks/useMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { getMenuIcon } from '@/lib/icons/menuIcons';
import { getAvatarUrl } from '@/lib/config';

const DRAWER_WIDTH = 300;

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function MobileDrawer({ open, onClose, onOpen }: MobileDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const t = useI18n();
  const { user } = useAuth();
  const { menus, favoriteMenus, isFavorite, addToFavorites, removeFromFavorites, refreshMenus, isLoading } = useMenu();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState(0);

  // Helper function to safely get menu name based on locale
  const getMenuName = (menu: MenuItem): string => {
    if (!menu?.name) return '';
    const localeKey = locale as 'en' | 'ko';
    return menu.name[localeKey] || menu.name.en || '';
  };

  // Helper function to get menu navigation path
  const getMenuPath = (menu: MenuItem): string => {
    if (menu.boardTypeId && menu.path?.startsWith('/boards')) {
      return `/${locale}/boards/${menu.boardTypeId}`;
    }
    return `/${locale}${menu.path}`;
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.name_ko || user?.name_en || user?.name || '';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (!displayName) return '?';

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleToggleExpand = (menuId: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleMenuClick = (menu: MenuItem) => {
    if (menu.children && menu.children.length > 0) {
      handleToggleExpand(menu.id);
    } else {
      const targetPath = getMenuPath(menu);
      router.push(targetPath);
      onClose();
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation();
    try {
      if (isFavorite(menuId)) {
        await removeFromFavorites(menuId);
      } else {
        await addToFavorites(menuId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleFavoriteClick = (menu: MenuItem) => {
    const targetPath = getMenuPath(menu);
    router.push(targetPath);
    onClose();
  };

  const renderMenu = (menu: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus.has(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const menuPath = getMenuPath(menu);
    const isActive = pathname === menuPath || pathname.startsWith(menuPath + '/');

    const icon = getMenuIcon(menu.icon);

    return (
      <React.Fragment key={menu.id}>
        <ListItem
          disablePadding
          sx={{ pl: level * 2 }}
          secondaryAction={
            menu.programId && (
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => handleToggleFavorite(e, menu.id)}
              >
                {isFavorite(menu.id) ? (
                  <Star fontSize="small" color="warning" />
                ) : (
                  <StarBorder fontSize="small" />
                )}
              </IconButton>
            )
          }
        >
          <ListItemButton
            selected={isActive}
            onClick={() => handleMenuClick(menu)}
            sx={{
              borderRadius: 1.5,
              mx: 1,
              my: 0.25,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText'
                }
              },
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                justifyContent: 'center',
                color: isActive ? 'inherit' : 'text.secondary'
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={getMenuName(menu)}
              primaryTypographyProps={{
                fontSize: level === 0 ? '0.95rem' : '0.9rem',
                fontWeight: level === 0 ? 500 : 400
              }}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menu.children?.map((child) => renderMenu(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      swipeAreaWidth={20}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        }
      }}
    >
      {/* User Info Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Avatar
          src={avatarSrc}
          alt={getUserDisplayName()}
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'secondary.main',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {!avatarSrc && getUserInitials()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }} noWrap>
            {user?.email}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'inherit' }}
          aria-label={t('common.close')}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs and Refresh Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            flex: 1,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem'
            }
          }}
        >
          <Tab label={t('menu.allMenus')} />
          <Tab
            label={`${t('menu.favorites')} (${favoriteMenus.length})`}
            disabled={favoriteMenus.length === 0}
          />
        </Tabs>
        <IconButton
          size="small"
          onClick={() => refreshMenus()}
          disabled={isLoading}
          sx={{ mr: 1 }}
          aria-label={t('menu.refresh')}
        >
          <RefreshIcon
            fontSize="small"
            sx={{
              animation: isLoading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
        </IconButton>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {currentTab === 1 ? (
          // Favorites Tab
          <List dense>
            {favoriteMenus.map((menu) => {
              const menuPath = getMenuPath(menu);
              const isActive = pathname === menuPath || pathname.startsWith(menuPath + '/');

              return (
                <ListItem key={`fav-${menu.id}`} disablePadding>
                  <ListItemButton
                    onClick={() => handleFavoriteClick(menu)}
                    selected={isActive}
                    sx={{
                      borderRadius: 1.5,
                      mx: 1,
                      my: 0.25,
                      minHeight: 48,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText'
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        justifyContent: 'center',
                        color: isActive ? 'inherit' : 'text.secondary'
                      }}
                    >
                      {getMenuIcon(menu.icon)}
                    </ListItemIcon>
                    <ListItemText
                      primary={getMenuName(menu)}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        ) : (
          // All Menus Tab
          <List>{menus.map((menu) => renderMenu(menu))}</List>
        )}
      </Box>
    </SwipeableDrawer>
  );
}
