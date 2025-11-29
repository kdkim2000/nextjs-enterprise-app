'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip
} from '@mui/material';
import { Widgets } from '@mui/icons-material';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import { componentCategories } from '../constants/componentData';

export default function ComponentsPage() {
  const locale = useCurrentLocale();
  const [searchTerm, setSearchTerm] = useState('');

  // Transform paths to include locale
  const localizedCategories = useMemo(
    () =>
      componentCategories.map((category) => ({
        ...category,
        components: category.components.map((component) => ({
          ...component,
          href: `/${locale}${component.path}`
        }))
      })),
    [locale]
  );

  // Filter components based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return localizedCategories;

    const term = searchTerm.toLowerCase();
    return localizedCategories
      .map((category) => ({
        ...category,
        components: category.components.filter(
          (component) =>
            component.title.toLowerCase().includes(term) ||
            component.description.toLowerCase().includes(term) ||
            component.tags.some((tag) => tag.toLowerCase().includes(term))
        )
      }))
      .filter((category) => category.components.length > 0);
  }, [localizedCategories, searchTerm]);

  // Count total components
  const totalCount = useMemo(
    () => localizedCategories.reduce((acc, cat) => acc + cat.components.length, 0),
    [localizedCategories]
  );

  const filteredCount = useMemo(
    () => filteredCategories.reduce((acc, cat) => acc + cat.components.length, 0),
    [filteredCategories]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSearch = useCallback(() => {
    // Client-side filtering - no action needed
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 10
        }}
      >
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Sticky Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <QuickSearchBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search components by name, description, or tag..."
                showAdvancedButton={false}
              />
            </Box>
            <Chip
              icon={<Widgets sx={{ fontSize: 16 }} />}
              label={searchTerm ? `${filteredCount} / ${totalCount}` : `${totalCount} components`}
              size="small"
              color={searchTerm && filteredCount === 0 ? 'error' : 'default'}
              sx={{ fontWeight: 500, flexShrink: 0 }}
            />
          </Box>
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PageContainer sx={{ py: 2 }}>
          {/* Component Categories */}
          {filteredCategories.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                color: 'text.secondary'
              }}
            >
              <Widgets sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No components found
              </Typography>
              <Typography variant="body2">Try searching with different keywords</Typography>
            </Box>
          ) : (
            filteredCategories.map((category, categoryIndex) => (
              <Box key={categoryIndex} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: `${category.color}15`,
                      mr: 1.5
                    }}
                  >
                    <category.icon sx={{ fontSize: 20, color: category.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {category.category}
                      </Typography>
                      <Chip
                        label={category.components.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: `${category.color}20`,
                          color: category.color
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  {category.components.map((component, componentIndex) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={componentIndex}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                      >
                        <CardActionArea component={Link} href={component.href} sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              {component.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1.5,
                                minHeight: 32,
                                lineHeight: 1.4
                              }}
                            >
                              {component.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {component.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    bgcolor: `${category.color}10`,
                                    color: category.color,
                                    fontWeight: 500
                                  }}
                                />
                              ))}
                              {component.tags.length > 3 && (
                                <Chip
                                  label={`+${component.tags.length - 3}`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    bgcolor: 'grey.100',
                                    color: 'grey.600'
                                  }}
                                />
                              )}
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}

          {/* Component Strategy Box */}
          {!searchTerm && (
            <Box
              sx={{
                mt: 4,
                p: 2.5,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                border: 1,
                borderColor: 'info.light'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Component Strategy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    1. MUI Direct Usage
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Simple UI: Button, TextField, Dialog
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    2. Custom Components
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Business logic, complex patterns, 3+ reuses
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    3. Theme System
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Consistent styling via src/theme/
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </PageContainer>
      </Box>
    </Box>
  );
}
