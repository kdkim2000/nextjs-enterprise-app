'use client';

import React, { ReactNode } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  alpha,
  useTheme,
  SxProps,
  Theme
} from '@mui/material';
import { Settings } from '@mui/icons-material';

/**
 * Category item configuration
 */
export interface CategoryItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
  description?: string;
}

/**
 * Category statistics for display
 */
export interface CategoryStats {
  total: number;
  primary?: number;    // e.g., ready count
  secondary?: number;  // e.g., applied count
}

/**
 * Props for CategoryNavPanel
 */
interface CategoryNavPanelProps {
  /** Panel title */
  title: string;
  /** List of categories */
  categories: CategoryItem[];
  /** Currently selected category ID (empty string for "all") */
  selectedCategory: string;
  /** Callback when category is selected */
  onSelectCategory: (categoryId: string) => void;
  /** Get statistics for a category */
  getCategoryStats: (categoryId: string) => CategoryStats;
  /** Total stats for "All" item */
  totalStats: CategoryStats;
  /** Configuration for "All" item */
  allItem?: {
    label: string;
    icon?: React.ElementType;
  };
  /** Format for displaying stats in chip */
  formatStats?: (stats: CategoryStats) => string;
  /** Format for displaying total stats in header */
  formatTotalStats?: (stats: CategoryStats) => string;
  /** Default color for categories without specific color */
  defaultColor?: string;
  /** Whether to show the "All" item */
  showAllItem?: boolean;
  /** Whether to show stats header */
  showStatsHeader?: boolean;
  /** Custom sx props */
  sx?: SxProps<Theme>;
}

/**
 * CategoryNavPanel - Reusable category navigation panel with icons, colors, and stats
 *
 * Use cases:
 * - App settings categories
 * - Menu management categories
 * - Document folders
 * - Role-based navigation
 */
export default function CategoryNavPanel({
  title,
  categories,
  selectedCategory,
  onSelectCategory,
  getCategoryStats,
  totalStats,
  allItem = { label: 'All', icon: Settings },
  formatStats = (stats) => stats.total.toString(),
  formatTotalStats = (stats) => `Total ${stats.total.toLocaleString()}`,
  defaultColor,
  showAllItem = true,
  showStatsHeader = true,
  sx
}: CategoryNavPanelProps) {
  const theme = useTheme();
  const primaryColor = defaultColor || theme.palette.primary.main;
  const AllIcon = allItem.icon || Settings;

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }}>
      {/* Header */}
      <Box sx={{ p: 1.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      {/* Stats Header */}
      {showStatsHeader && (
        <Box sx={{ px: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: 'primary.50',
              borderRadius: 1,
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem'
            }}
          >
            {formatTotalStats(totalStats)}
          </Box>
        </Box>
      )}

      <Divider />

      {/* Category List */}
      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {/* All Items Option */}
        {showAllItem && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedCategory === ''}
                onClick={() => onSelectCategory('')}
                sx={{
                  py: 1,
                  px: 2,
                  minHeight: 48,
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    borderLeft: '3px solid',
                    borderLeftColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.100'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AllIcon
                    fontSize="small"
                    color={selectedCategory === '' ? 'primary' : 'inherit'}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight={selectedCategory === '' ? 600 : 500}
                        noWrap
                      >
                        {allItem.label}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatStats(totalStats)}
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Divider />
          </>
        )}

        {/* Category Items */}
        {categories.map((cat, index) => {
          const isSelected = selectedCategory === cat.id;
          const stats = getCategoryStats(cat.id);
          const categoryColor = cat.color || primaryColor;
          const IconComponent = cat.icon || Settings;

          return (
            <React.Fragment key={cat.id}>
              {index > 0 && <Divider />}
              <ListItem disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelectCategory(cat.id)}
                  sx={{
                    py: 1,
                    px: 2,
                    minHeight: 48,
                    '&.Mui-selected': {
                      bgcolor: alpha(categoryColor, 0.08),
                      borderLeft: '3px solid',
                      borderLeftColor: categoryColor,
                      '&:hover': {
                        bgcolor: alpha(categoryColor, 0.12)
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isSelected ? categoryColor : theme.palette.text.secondary }}>
                    <IconComponent fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          component="span"
                          variant="body2"
                          fontWeight={isSelected ? 600 : 500}
                          noWrap
                        >
                          {cat.label}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatStats(stats)}
                          sx={{
                            ml: 1,
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(categoryColor, 0.1),
                            color: categoryColor
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}
