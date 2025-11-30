'use client';

import React, { memo } from 'react';
import { Box, Typography, Grid, Skeleton, SvgIconProps } from '@mui/material';
import Link from 'next/link';

export interface QuickAction {
  /** Unique identifier */
  id?: string;
  /** Action title */
  title: string;
  /** Optional description */
  description?: string;
  /** Icon component */
  icon: React.ComponentType<SvgIconProps>;
  /** Navigation href */
  href: string;
  /** Accent color */
  color?: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface QuickActionGridProps {
  /** Array of quick actions */
  actions: QuickAction[];
  /** Loading state */
  loading?: boolean;
  /** Title for the grid */
  title?: string;
  /** Grid columns configuration */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** Grid spacing */
  spacing?: number;
  /** Default color for actions without custom color */
  defaultColor?: string;
}

const DEFAULT_COLOR = '#6366f1';

function QuickActionGrid({
  actions,
  loading = false,
  title,
  columns = { xs: 6, sm: 4 },
  spacing = 1.5,
  defaultColor = DEFAULT_COLOR
}: QuickActionGridProps) {
  if (loading) {
    return (
      <Box>
        {title && <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />}
        <Grid container spacing={spacing}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={columns.xs} sm={columns.sm} md={columns.md} lg={columns.lg} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2.5 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 2 }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={spacing}>
        {actions.map((action, index) => {
          const color = action.color || defaultColor;
          const Icon = action.icon;

          const content = (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid',
                borderColor: 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.5 : 1,
                height: '100%',
                ...(!action.disabled && {
                  '&:hover': {
                    bgcolor: `${color}08`,
                    borderColor: `${color}30`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${color}15`
                  }
                })
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: `${color}12`,
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 0.25
                }}
              >
                {action.title}
              </Typography>
              {action.description && (
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    lineHeight: 1.3
                  }}
                >
                  {action.description}
                </Typography>
              )}
            </Box>
          );

          return (
            <Grid item xs={columns.xs} sm={columns.sm} md={columns.md} lg={columns.lg} key={action.id ?? index}>
              {action.disabled ? (
                content
              ) : (
                <Box component={Link} href={action.href} sx={{ display: 'block', height: '100%' }}>
                  {content}
                </Box>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default memo(QuickActionGrid);
