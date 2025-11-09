'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Button } from '@mui/material';
import { Widgets, Code, Description, ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import { componentCategories } from './constants/componentData';

export default function DevPage() {
  const locale = useCurrentLocale();
  const router = useRouter();

  const totalComponents = componentCategories.reduce(
    (sum, category) => sum + category.components.length,
    0
  );

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Widgets sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Development Resources
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Tools and components for developers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          개발자를 위한 도구 및 컴포넌트
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6
              }
            }}
          >
            <CardActionArea
              onClick={() => router.push(`/${locale}/dev/components`)}
              sx={{ height: '100%', p: 3 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Widgets sx={{ fontSize: 48, color: '#1976d2', mr: 2 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Component Library
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {totalComponents} Components Available
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Browse our collection of reusable UI components with examples, usage guidelines, and best practices.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  예제, 사용 가이드, 모범 사례가 포함된 재사용 가능한 UI 컴포넌트 컬렉션을 탐색하세요.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Categories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {componentCategories.map((cat, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: `${cat.color}15`,
                          color: cat.color,
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      >
                        {cat.category}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, color: 'primary.main' }}>
                  <Typography variant="button" sx={{ mr: 1 }}>
                    Browse Components
                  </Typography>
                  <ArrowForward />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6
              },
              bgcolor: 'grey.50'
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Code sx={{ fontSize: 48, color: '#2e7d32', mr: 2 }} />
                <Typography variant="h5" fontWeight={600}>
                  Code Examples
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                View implementation examples and code snippets for all components.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                모든 컴포넌트의 구현 예제 및 코드 스니펫을 확인하세요.
              </Typography>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Quick Import:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  <code>
                    import ComponentName from
                    <br />
                    &nbsp;&nbsp;&apos;@/components/common/ComponentName&apos;;
                  </code>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Description sx={{ fontSize: 48, mr: 2 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Documentation
                    </Typography>
                    <Typography variant="body2">
                      Learn how to use components effectively in your projects
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                  component={Link}
                  href={`/${locale}/dev/components`}
                  endIcon={<ArrowForward />}
                >
                  View Documentation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, p: 3, bgcolor: 'info.lighter', borderRadius: 2, border: 1, borderColor: 'info.light' }}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="info.dark">
          Getting Started / 시작하기
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          All components are located in <code>src/components/common/</code> and follow consistent patterns for easy integration.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          모든 컴포넌트는 <code>src/components/common/</code>에 위치하며 쉬운 통합을 위해 일관된 패턴을 따릅니다.
        </Typography>
      </Box>
    </PageContainer>
  );
}
