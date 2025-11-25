'use client';

import React, { useState, useMemo } from 'react';
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
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Star,
  StarBorder,
  Dashboard,
  People,
  Assessment,
  Settings,
  List as ListIcon,
  AdminPanelSettings,
  GridOn,
  TrendingUp,
  Menu as MenuIcon,
  Description,
  Folder,
  Assignment,
  Build,
  Code,
  Security,
  Help,
  Link,
  AccountTree,
  School,
  Palette,
  Message,
  Article,
  Book,
  Announcement,
  Forum,
  Info,
  Storage,
  Notifications,
  Email
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { MenuItem } from '@/types/menu';
import { useMenu } from '@/hooks/useMenu';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

// Icon mapping - synchronized with ICON_TYPE codes in database
const iconMap: Record<string, React.ReactElement> = {
  AccountTree: <AccountTree />,
  AdminPanelSettings: <AdminPanelSettings />,
  Announcement: <Announcement />,
  Article: <Article />,
  Assessment: <Assessment />,
  Assignment: <Assignment />,
  Book: <Book />,
  Build: <Build />,
  Code: <Code />,
  Dashboard: <Dashboard />,
  Description: <Description />,
  Email: <Email />,
  Folder: <Folder />,
  Forum: <Forum />,
  GridOn: <GridOn />,
  Help: <Help />,
  Info: <Info />,
  Link: <Link />,
  List: <ListIcon />,
  Menu: <MenuIcon />,
  Message: <Message />,
  Notifications: <Notifications />,
  Palette: <Palette />,
  People: <People />,
  School: <School />,
  Security: <Security />,
  Settings: <Settings />,
  Storage: <Storage />,
  TrendingUp: <TrendingUp />,
  Widgets: <GridOn />
};

// Helper function to get icon by name (case-insensitive)
const getIcon = (iconName: string): React.ReactElement => {
  if (!iconName) return <Dashboard />;

  // Try exact match first
  if (iconMap[iconName]) return iconMap[iconName];

  // Try PascalCase conversion (e.g., 'build' -> 'Build', 'trendingUp' -> 'TrendingUp')
  const pascalCase = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (iconMap[pascalCase]) return iconMap[pascalCase];

  // Try finding case-insensitive match
  const lowerName = iconName.toLowerCase();
  const matchedKey = Object.keys(iconMap).find(key => key.toLowerCase() === lowerName);
  if (matchedKey) return iconMap[matchedKey];

  // Default to Dashboard
  return <Dashboard />;
};

interface SidebarProps {
  expanded: boolean;
}

export default function Sidebar({ expanded }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const t = useI18n();
  const { menus, favoriteMenus, recentMenus, isFavorite, addToFavorites, removeFromFavorites } = useMenu();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState(0);

  // Helper function to safely get menu name based on locale
  const getMenuName = (menu: MenuItem): string => {
    if (!menu?.name) return '';
    const localeKey = locale as 'en' | 'ko';
    return menu.name[localeKey] || menu.name.en || '';
  };

  // Optimize: Deduplicate and sort "My Work" menus (recent + favorites)
  // Using useMemo to prevent unnecessary recalculations on every render
  const myWorkMenus = useMemo(() => {
    // Combine recent and favorite menus
    const combined = [...recentMenus, ...favoriteMenus];

    // Remove duplicates by menu ID (keep the first occurrence which is from recentMenus)
    const seen = new Set<string>();
    const deduplicated = combined.filter((menu) => {
      if (seen.has(menu.id)) {
        return false;
      }
      seen.add(menu.id);
      return true;
    });

    return deduplicated;
  }, [recentMenus, favoriteMenus]);

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
    console.log('[Sidebar] Menu clicked:', menu.code, menu.path);
    if (menu.children && menu.children.length > 0) {
      handleToggleExpand(menu.id);
    } else {
      const targetPath = `/${locale}${menu.path}`;
      console.log('[Sidebar] Navigating to:', targetPath);
      router.push(targetPath);
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
    const icon = getIcon(menu.icon);

    return (
      <React.Fragment key={menu.id}>
        <Tooltip title={!expanded ? getMenuName(menu) : ''} placement="right">
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
                    primary={getMenuName(menu)}
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
              fontWeight: 500,
              fontSize: '0.875rem'
            }
          }}
        >
          <Tab label={t('menu.allMenus')} />
          <Tab
            label={t('menu.favorites')}
            disabled={favoriteMenus.length === 0}
          />
          <Tab
            label={t('menu.myWork')}
            disabled={myWorkMenus.length === 0}
          />
        </Tabs>
      )}

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {expanded && currentTab === 1 ? (
          // Favorites Tab
          <List dense>
            {favoriteMenus.map((menu) => (
              <Tooltip
                key={`fav-${menu.id}`}
                title={!expanded ? getMenuName(menu) : ''}
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
                      {getIcon(menu.icon)}
                    </ListItemIcon>
                    {expanded && (
                      <ListItemText
                        primary={getMenuName(menu)}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        ) : expanded && currentTab === 2 ? (
          // My Work Tab - Recent + Favorites (deduplicated)
          <List dense>
            {myWorkMenus.map((menu) => (
              <Tooltip
                key={`mywork-${menu.id}`}
                title={!expanded ? getMenuName(menu) : ''}
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
                      {getIcon(menu.icon)}
                    </ListItemIcon>
                    {expanded && (
                      <ListItemText
                        primary={getMenuName(menu)}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        ) : (
          // All Menus Tab
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
          overflowY: 'auto',
          position: 'static',
          height: '100%',
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
