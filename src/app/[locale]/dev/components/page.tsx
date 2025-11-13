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
          Our component library follows a <strong>MUI-first</strong> approach with theme-based consistency.
          Simple UI components use MUI directly, while complex business logic is encapsulated in custom components.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>MUI 우선</strong> 접근 방식과 테마 기반 일관성을 따릅니다.
          단순 UI는 MUI를 직접 사용하고, 복잡한 비즈니스 로직만 커스텀 컴포넌트로 구현합니다.
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

      <Box sx={{ mt: 6, p: 3, bgcolor: 'info.lighter', borderRadius: 2, border: 1, borderColor: 'info.light' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          💡 Component Strategy / 컴포넌트 전략
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          1. MUI Direct Usage (MUI 직접 사용)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For simple UI components, use MUI directly with theme styling:
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: 13, mb: 2 }}>
          <code>
            import {'{ Button, TextField, Dialog }'} from &apos;@mui/material&apos;;
            <br />
            import {'{ useTheme }'} from &apos;@mui/material/styles&apos;;
          </code>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          2. Custom Business Components (커스텀 비즈니스 컴포넌트)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Use custom components for business logic, complex patterns, or 3+ reuses:
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: 13, mb: 2 }}>
          <code>
            import DataGrid from &apos;@/components/common/DataGrid&apos;;
            <br />
            import PageHeader from &apos;@/components/common/PageHeader&apos;;
            <br />
            import PermissionGuard from &apos;@/components/common/PermissionGuard&apos;;
          </code>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          3. Theme System (테마 시스템)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All styling consistency comes from <code>src/theme/</code> with custom status/role colors, typography, and component overrides.
        </Typography>
      </Box>
    </PageContainer>
  );
}
