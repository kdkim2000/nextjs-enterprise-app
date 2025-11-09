'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import { componentCategories } from '../constants/componentData';

export default function ComponentsPage() {
  const locale = useCurrentLocale();

  // Transform paths to include locale
  const localizedCategories = useMemo(() =>
    componentCategories.map(category => ({
      ...category,
      components: category.components.map(component => ({
        ...component,
        href: `/${locale}${component.path}`
      }))
    })),
    [locale]
  );

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Component Library
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore our collection of reusable UI components. Each component comes with examples, usage guidelines, and best practices.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          컴포넌트 라이브러리를 탐색하세요. 각 컴포넌트는 예제, 사용 가이드, 모범 사례를 포함합니다.
        </Typography>
      </Box>

      {localizedCategories.map((category, categoryIndex) => (
        <Box key={categoryIndex} sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${category.color}15`,
                mr: 2
              }}
            >
              <category.icon sx={{ fontSize: 24, color: category.color }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {category.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {category.components.map((component, componentIndex) => (
              <Grid item xs={12} sm={6} md={4} key={componentIndex}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={component.href}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {component.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, minHeight: 40 }}
                      >
                        {component.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {component.tags.map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: `${category.color}10`,
                              color: category.color,
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {categoryIndex < localizedCategories.length - 1 && (
            <Divider sx={{ mt: 4 }} />
          )}
        </Box>
      ))}

      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Getting Started / 시작하기
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          All components are located in <code>src/components/common/</code> and can be imported directly into your pages.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          모든 컴포넌트는 <code>src/components/common/</code>에 위치하며 페이지에서 직접 가져올 수 있습니다.
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: 14 }}>
          <code>
            import DataGrid from &apos;@/components/common/DataGrid&apos;;
            <br />
            import PageHeader from &apos;@/components/common/PageHeader&apos;;
            <br />
            import FileUpload from &apos;@/components/common/FileUpload&apos;;
          </code>
        </Box>
      </Box>
    </PageContainer>
  );
}
