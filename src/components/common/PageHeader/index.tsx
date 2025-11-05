'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import { useMenu } from '@/hooks/useMenu';
import type { MenuItem } from '@/types/menu';

interface PageHeaderProps {
  // Option 1: Manual mode - provide title and description directly
  title?: string;
  description?: string;

  // Option 2: Auto mode - automatically fetch menu info based on current path
  useMenu?: boolean;

  // Option 3: Menu object - provide menu object directly
  menu?: MenuItem;

  // Common props
  actions?: React.ReactNode;
  showBreadcrumb?: boolean;
}

/**
 * Common page header component with menu integration
 *
 * Usage:
 * 1. Auto mode (fetch menu by current path):
 *    <PageHeader useMenu />
 *
 * 2. Menu object mode:
 *    <PageHeader menu={menuObject} />
 *
 * 3. Manual mode (backward compatible):
 *    <PageHeader title="My Title" description="My Description" />
 */
export default function PageHeader({
  title,
  description,
  useMenu: useMenuMode = false,
  menu: menuProp,
  actions,
  showBreadcrumb = false
}: PageHeaderProps) {
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const { getMenuByPath, menus } = useMenu();
  const [menuInfo, setMenuInfo] = useState<MenuItem | null>(null);

  // Auto-fetch menu based on current path
  useEffect(() => {
    if (useMenuMode && pathname) {
      const fetchMenu = async () => {
        try {
          // Remove locale prefix from path
          const cleanPath = pathname.replace(`/${locale}`, '');
          const menu = await getMenuByPath(cleanPath);
          setMenuInfo(menu);
        } catch (error) {
          console.error('Failed to fetch menu:', error);
        }
      };
      fetchMenu();
    }
  }, [useMenuMode, pathname, locale, getMenuByPath]);

  // Determine which menu to use
  const activeMenu = menuProp || menuInfo;

  // Get localized title
  const displayTitle = activeMenu
    ? activeMenu.name[locale as 'en' | 'ko']
    : title || '';

  // Get localized description
  const displayDescription = activeMenu
    ? activeMenu.description[locale as 'en' | 'ko']
    : description;

  // Build breadcrumb
  const getBreadcrumb = () => {
    if (!activeMenu || !showBreadcrumb) return null;

    const breadcrumbItems: MenuItem[] = [];

    // Find parent menus
    const findParents = (menu: MenuItem) => {
      if (menu.parentId) {
        const parent = menus.find(m => m.id === menu.parentId);
        if (parent) {
          breadcrumbItems.unshift(parent);
          findParents(parent);
        }
      }
    };

    if (activeMenu.parentId) {
      findParents(activeMenu);
    }
    breadcrumbItems.push(activeMenu);

    return (
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 1 }}
      >
        {breadcrumbItems.map((item, index) => (
          index === breadcrumbItems.length - 1 ? (
            <Typography key={item.id} color="text.primary" fontSize="0.875rem">
              {item.name[locale as 'en' | 'ko']}
            </Typography>
          ) : (
            <Link
              key={item.id}
              color="inherit"
              href={`/${locale}${item.path}`}
              underline="hover"
              fontSize="0.875rem"
            >
              {item.name[locale as 'en' | 'ko']}
            </Link>
          )
        ))}
      </Breadcrumbs>
    );
  };

  return (
    <Box sx={{ mb: 1.5, flexShrink: 0 }}>
      {showBreadcrumb && getBreadcrumb()}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              {displayTitle}
            </Typography>
            {displayDescription && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  ml: 1,
                  display: { xs: 'none', sm: 'inline' }
                }}
              >
                {displayDescription}
              </Typography>
            )}
          </Box>
        </Box>

        {actions && (
          <Box sx={{ flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
