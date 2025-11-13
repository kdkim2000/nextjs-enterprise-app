'use client';

import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  styled
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import NextLink from 'next/link';

export interface BreadcrumbItem {
  /**
   * Display label
   */
  label: string;

  /**
   * Link path (optional for last item)
   */
  href?: string;

  /**
   * Icon component
   */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Show home icon for first item
   */
  showHome?: boolean;

  /**
   * Max items to display before collapsing
   */
  maxItems?: number;

  /**
   * Separator between items
   */
  separator?: React.ReactNode;

  /**
   * Custom styling
   */
  sx?: object;
}

const StyledBreadcrumb = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  fontSize: theme.typography.pxToRem(14),
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.primary.main
  }
}));

const CurrentBreadcrumb = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: theme.typography.pxToRem(14),
  color: theme.palette.text.primary,
  fontWeight: 500
}));

export default function Breadcrumb({
  items,
  showHome = true,
  maxItems = 8,
  separator = <NavigateNext fontSize="small" />,
  sx
}: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const breadcrumbItems = showHome && items[0]?.label !== 'Home'
    ? [{ label: 'Home', href: '/', icon: <Home fontSize="small" /> }, ...items]
    : items;

  return (
    <Box sx={{ py: 1, ...sx }}>
      <MuiBreadcrumbs
        maxItems={maxItems}
        separator={separator}
        aria-label="breadcrumb"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          // Last item (current page) - not clickable
          if (isLast) {
            return (
              <CurrentBreadcrumb key={index}>
                {item.icon}
                {item.label}
              </CurrentBreadcrumb>
            );
          }

          // Clickable items
          if (item.href) {
            return (
              <StyledBreadcrumb
                key={index}
                component={NextLink}
                href={item.href}
              >
                {item.icon}
                {item.label}
              </StyledBreadcrumb>
            );
          }

          // Non-clickable items (no href)
          return (
            <Typography
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 14,
                color: 'text.secondary'
              }}
            >
              {item.icon}
              {item.label}
            </Typography>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
