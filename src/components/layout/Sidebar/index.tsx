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
  Tooltip,
  Tabs,
  Tab
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
const DRAWER_WIDTH_COLLAPSED = 72;

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
  expanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const { menus, favoriteMenus, isFavorite, addToFavorites, removeFromFavorites } = useMenu();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState(0);

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
      router.push(`/${locale}${menu.path}`);
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
        <Tooltip title={!expanded ? menu.name[locale as 'en' | 'ko'] : ''} placement="right">
          <ListItem
            disablePadding
            sx={{ pl: expanded ? level * 2 : 0 }}
            secondaryAction={
              expanded && menu.programId && (
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
                minHeight: 44,
                justifyContent: expanded ? 'initial' : 'center',
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
              {expanded && (
                <>
                  <ListItemText
                    primary={menu.name[locale as 'en' | 'ko']}
                    primaryTypographyProps={{
                      fontSize: level === 0 ? '0.95rem' : '0.9rem',
                      fontWeight: level === 0 ? 500 : 400
                    }}
                  />
                  {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                </>
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        {hasChildren && expanded && (
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
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          minHeight: 64
        }}
      >
        {expanded ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MenuIcon color="primary" />
              <Typography variant="h6" fontWeight={600} color="primary">
                Enterprise
              </Typography>
            </Box>
            <IconButton size="small" onClick={onToggle} sx={{ mr: -1 }}>
              <ExpandLess sx={{ transform: 'rotate(-90deg)' }} />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Expand" placement="right">
            <IconButton size="small" onClick={onToggle}>
              <MenuIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* Tabs - only show when expanded */}
      {expanded && (
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          <Tab label={locale === 'ko' ? '전체 메뉴' : 'All Menus'} />
          <Tab
            label={locale === 'ko' ? '즐겨찾기' : 'Favorites'}
            disabled={favoriteMenus.length === 0}
          />
        </Tabs>
      )}

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {expanded && currentTab === 1 ? (
          <List dense>
            {favoriteMenus.map((menu) => (
              <Tooltip
                key={`fav-${menu.id}`}
                title={!expanded ? menu.name[locale as 'en' | 'ko'] : ''}
                placement="right"
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => router.push(`/${locale}${menu.path}`)}
                    selected={pathname === `/${locale}${menu.path}`}
                    sx={{
                      borderRadius: 1.5,
                      mx: 1,
                      my: 0.25,
                      minHeight: 44,
                      justifyContent: expanded ? 'initial' : 'center',
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
                        color: pathname === `/${locale}${menu.path}` ? 'inherit' : 'text.secondary'
                      }}
                    >
                      {iconMap[menu.icon] || <Dashboard />}
                    </ListItemIcon>
                    {expanded && (
                      <ListItemText
                        primary={menu.name[locale as 'en' | 'ko']}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        ) : (
          <List>{menus.map((menu) => renderMenu(menu))}</List>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: expanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: expanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          position: 'relative',
          border: 'none',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
