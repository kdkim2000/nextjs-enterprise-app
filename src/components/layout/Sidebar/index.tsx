'use client';

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Star,
  StarBorder,
  Menu as MenuIcon,
  Dashboard,
  People,
  Assessment,
  Settings,
  List as ListIcon,
  AdminPanelSettings,
  GridOn,
  TrendingUp
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { MenuItem } from '@/types/menu';
import { useMenu } from '@/hooks/useMenu';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';

const DRAWER_WIDTH = 280;

// Icon mapping
const iconMap: Record<string, React.ReactElement> = {
  Dashboard: <Dashboard />,
  People: <People />,
  Assessment: <Assessment />,
  Settings: <Settings />,
  List: <ListIcon />,
  AdminPanelSettings: <AdminPanelSettings />,
  GridOn: <GridOn />,
  TrendingUp: <TrendingUp />,
  Widgets: <GridOn />
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const { menus, favoriteMenus, isFavorite, addToFavorites, removeFromFavorites } = useMenu();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

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
      router.push(`/${locale}${menu.path}`);
      if (window.innerWidth < 960) {
        onClose();
      }
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

  const renderMenu = (menu: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus.has(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const isActive = pathname === `/${locale}${menu.path}`;
    const icon = iconMap[menu.icon] || <Dashboard />;

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
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
            <ListItemText
              primary={menu.name[locale as 'en' | 'ko']}
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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MenuIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Enterprise App
        </Typography>
      </Box>

      <Divider />

      {/* Favorite Menus */}
      {favoriteMenus.length > 0 && (
        <>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              FAVORITES
            </Typography>
          </Box>
          <List dense>
            {favoriteMenus.map((menu) => (
              <ListItem key={`fav-${menu.id}`} disablePadding>
                <ListItemButton
                  onClick={() => router.push(`/${locale}${menu.path}`)}
                  sx={{ borderRadius: 1, mx: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {iconMap[menu.icon] || <Dashboard />}
                  </ListItemIcon>
                  <ListItemText
                    primary={menu.name[locale as 'en' | 'ko']}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {/* Main Menu */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          MENU
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>{menus.map((menu) => renderMenu(menu))}</List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
