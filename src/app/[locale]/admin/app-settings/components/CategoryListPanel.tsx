'use client';

import React from 'react';
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
  useTheme
} from '@mui/material';
import {
  Settings,
  Info,
  Palette,
  Language,
  Security,
  VpnKey,
  Notifications,
  CloudUpload,
  Build,
  Flag,
  Business
} from '@mui/icons-material';
import { CategoryInfo, CategoryType } from '../types';
import { CATEGORY_COLORS, getLocalizedText } from '../constants';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  Info,
  Palette,
  Language,
  Security,
  VpnKey,
  Notifications,
  CloudUpload,
  Build,
  Flag,
  Business,
  Settings
};

interface CategoryListPanelProps {
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  getCategoryCount: (categoryId: string) => number;
  getCategoryReadyCount: (categoryId: string) => number;
  getCategoryAppliedCount: (categoryId: string) => number;
  totalCount: number;
  readyCount: number;
  appliedCount: number;
  locale: string;
}

export default function CategoryListPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  getCategoryCount,
  getCategoryReadyCount,
  getCategoryAppliedCount,
  totalCount,
  readyCount,
  appliedCount,
  locale
}: CategoryListPanelProps) {
  const theme = useTheme();

  const title = getLocalizedText({
    en: 'Categories',
    ko: '카테고리',
    zh: '分类',
    vi: 'Danh mục'
  }, locale);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 1.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      {/* Count Badge */}
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
          {locale === 'ko'
            ? `총 ${totalCount.toLocaleString()} (준비: ${readyCount.toLocaleString()}, 적용: ${appliedCount.toLocaleString()})`
            : `Total ${totalCount.toLocaleString()} (Ready: ${readyCount.toLocaleString()}, Applied: ${appliedCount.toLocaleString()})`}
        </Box>
      </Box>

      <Divider />

      {/* Category List */}
      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {/* All Settings Item */}
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
              <Settings
                fontSize="small"
                color={selectedCategory === '' ? 'primary' : 'inherit'}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography component="span" variant="body2" fontWeight={selectedCategory === '' ? 600 : 500} noWrap>
                    {getLocalizedText({ en: 'All Settings', ko: '전체 설정', zh: '全部设置', vi: 'Tất cả' }, locale)}
                  </Typography>
                  <Chip
                    size="small"
                    label={totalCount}
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

        {/* Category Items */}
        {categories.map((cat, index) => {
          const isSelected = selectedCategory === cat.id;
          const readyCnt = getCategoryReadyCount(cat.id);
          const appliedCnt = getCategoryAppliedCount(cat.id);
          const totalCnt = getCategoryCount(cat.id);
          const categoryColor = CATEGORY_COLORS[cat.id as CategoryType] || theme.palette.primary.main;
          const IconComponent = iconMap[cat.icon] || Settings;

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
                        <Typography component="span" variant="body2" fontWeight={isSelected ? 600 : 500} noWrap>
                          {getLocalizedText(cat.label, locale)}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${appliedCnt}/${readyCnt}/${totalCnt}`}
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
