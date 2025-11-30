'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Switch, FormControlLabel } from '@mui/material';
import { Visibility, ThumbUp, Star, TrendingUp } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import RankedList, { RankedItem, RankedListColors } from '@/components/common/RankedList';

interface PostRankedItem extends RankedItem {
  views: number;
  likes: number;
}

interface ProductRankedItem extends RankedItem {
  price: number;
  sales: number;
  rating: number;
}

export default function RankedListDemoPage() {
  const [loading, setLoading] = useState(false);

  const basicItems: RankedItem[] = [
    { id: 1, title: '프로젝트 진행 상황 보고', subtitle: '공지사항', meta: '김철수' },
    { id: 2, title: '2024년 1분기 매출 분석', subtitle: '보고서', meta: '이영희' },
    { id: 3, title: '신규 기능 업데이트 안내', subtitle: '공지사항', meta: '박지민' },
    { id: 4, title: '팀 빌딩 행사 안내', subtitle: '일반', meta: '최수진' },
    { id: 5, title: '시스템 점검 공지', subtitle: '공지사항', meta: '관리자' }
  ];

  const postItems: PostRankedItem[] = [
    { id: 1, title: 'React 18의 새로운 기능들', subtitle: '개발', meta: '김개발', views: 15234, likes: 342 },
    { id: 2, title: 'TypeScript 5.0 마이그레이션 가이드', subtitle: '개발', meta: '이타입', views: 12456, likes: 289 },
    { id: 3, title: '2024 프론트엔드 트렌드', subtitle: '기술', meta: '박프론트', views: 10234, likes: 256 },
    { id: 4, title: 'Next.js 14 App Router 완벽 가이드', subtitle: '튜토리얼', meta: '최넥스트', views: 8932, likes: 198 },
    { id: 5, title: 'CSS Grid vs Flexbox', subtitle: '디자인', meta: '정스타일', views: 7654, likes: 167 }
  ];

  const productItems: ProductRankedItem[] = [
    { id: 1, title: 'MacBook Pro 16"', subtitle: 'Electronics', price: 2499, sales: 1543, rating: 4.8 },
    { id: 2, title: 'iPhone 15 Pro Max', subtitle: 'Electronics', price: 1199, sales: 3421, rating: 4.7 },
    { id: 3, title: 'AirPods Pro 2', subtitle: 'Accessories', price: 249, sales: 5678, rating: 4.6 },
    { id: 4, title: 'iPad Air', subtitle: 'Electronics', price: 599, sales: 2345, rating: 4.5 },
    { id: 5, title: 'Apple Watch Ultra', subtitle: 'Wearables', price: 799, sales: 1234, rating: 4.4 }
  ];

  const withValuesItems: RankedItem[] = [
    { id: 1, title: 'Dashboard', value: 15234, secondaryValue: '↑12%' },
    { id: 2, title: 'User Management', value: 12456, secondaryValue: '↑8%' },
    { id: 3, title: 'Reports', value: 10234, secondaryValue: '↓3%' },
    { id: 4, title: 'Settings', value: 8932, secondaryValue: '↑5%' },
    { id: 5, title: 'Analytics', value: 7654, secondaryValue: '↑15%' }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          RankedList
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A ranked list component with customizable highlighting and metric display.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          커스터마이즈 가능한 하이라이트와 지표 표시를 지원하는 순위 목록 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display a ranked list with title, subtitle, and metadata.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <RankedList items={basicItems} title="인기 게시글" />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import RankedList, { RankedItem } from '@/components/common/RankedList';

const items: RankedItem[] = [
  { id: 1, title: '프로젝트 진행 상황 보고', subtitle: '공지사항', meta: '김철수' },
  { id: 2, title: '2024년 1분기 매출 분석', subtitle: '보고서', meta: '이영희' },
  { id: 3, title: '신규 기능 업데이트 안내', subtitle: '공지사항', meta: '박지민' }
];

<RankedList items={items} title="인기 게시글" />`}
          </Box>
        </Paper>

        {/* With Values */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Values
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display primary and secondary values on the right side.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <RankedList
              items={withValuesItems}
              title="Page Views"
              formatValue={(v) => typeof v === 'number' ? v.toLocaleString() : v}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`const items: RankedItem[] = [
  { id: 1, title: 'Dashboard', value: 15234, secondaryValue: '↑12%' },
  { id: 2, title: 'User Management', value: 12456, secondaryValue: '↑8%' }
];

<RankedList
  items={items}
  formatValue={(v) => typeof v === 'number' ? v.toLocaleString() : v}
/>`}
          </Box>
        </Paper>

        {/* Custom Render Metrics */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Render Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use renderMetrics for custom metric display with icons.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <RankedList<PostRankedItem>
              items={postItems}
              title="인기 게시글"
              renderMetrics={(item) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      {item.views.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      {item.likes}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`interface PostRankedItem extends RankedItem {
  views: number;
  likes: number;
}

<RankedList<PostRankedItem>
  items={postItems}
  title="인기 게시글"
  renderMetrics={(item) => (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Visibility sx={{ fontSize: 14 }} />
        <Typography>{item.views.toLocaleString()}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ThumbUp sx={{ fontSize: 14 }} />
        <Typography>{item.likes}</Typography>
      </Box>
    </Box>
  )}
/>`}
          </Box>
        </Paper>

        {/* Custom Rank Colors */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Rank Colors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize the colors for top-ranked items.
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Default Colors
              </Typography>
              <RankedList items={basicItems.slice(0, 4)} />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Gold, Silver, Bronze
              </Typography>
              <RankedList
                items={basicItems.slice(0, 4)}
                rankColors={['#FFD700', '#C0C0C0', '#CD7F32']}
              />
            </Box>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<RankedList
  items={items}
  rankColors={['#FFD700', '#C0C0C0', '#CD7F32']}
/>`}
          </Box>
        </Paper>

        {/* Top Highlight */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Highlight Count
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Control how many top items are highlighted.
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                topHighlight: 3 (Default)
              </Typography>
              <RankedList items={basicItems} topHighlight={3} />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                topHighlight: 1
              </Typography>
              <RankedList items={basicItems} topHighlight={1} />
            </Box>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<RankedList items={items} topHighlight={1} />`}
          </Box>
        </Paper>

        {/* Clickable Items */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Clickable Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add click handlers to navigate or perform actions.
          </Typography>

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <RankedList
              items={basicItems}
              title="클릭 가능한 목록"
              onItemClick={(item) => alert(`Clicked: ${item.title}`)}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<RankedList
  items={items}
  onItemClick={(item) => router.push(\`/posts/\${item.id}\`)}
/>`}
          </Box>
        </Paper>

        {/* Custom Render Item */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Render Item
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Completely customize item rendering with renderItem.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <RankedList<ProductRankedItem>
              items={productItems}
              title="Best Sellers"
              renderItem={(item) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Star sx={{ fontSize: 12, color: '#f59e0b' }} />
                      <Typography sx={{ fontSize: '0.65rem', color: '#f59e0b' }}>
                        {item.rating}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.04)' }}>
                      {item.subtitle}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'success.main', fontWeight: 600 }}>
                      ${item.price}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderMetrics={(item) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {item.sales.toLocaleString()} sold
                  </Typography>
                </Box>
              )}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<RankedList<ProductRankedItem>
  items={productItems}
  renderItem={(item) => (
    <Box>
      <Typography>{item.title}</Typography>
      <Typography>\${item.price}</Typography>
    </Box>
  )}
  renderMetrics={(item) => (
    <Typography>{item.sales} sold</Typography>
  )}
/>`}
          </Box>
        </Paper>

        {/* Loading State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Loading State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show skeleton placeholders while loading.
          </Typography>

          <FormControlLabel
            control={<Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} />}
            label="Toggle Loading"
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <RankedList
              items={basicItems}
              title="인기 게시글"
              loading={loading}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<RankedList items={items} loading={true} />`}
          </Box>
        </Paper>

        {/* Default Colors */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Default Rank Colors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Exported color array for customization.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {RankedListColors.map((color, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                  {index + 1}
                </Box>
                <Typography variant="caption">{color}</Typography>
              </Box>
            ))}
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import { RankedListColors } from '@/components/common/RankedList';

// RankedListColors = ['#6366f1', '#8b5cf6', '#ec4899']`}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mb: 3
            }}
          >
            {`import RankedList, { RankedItem, RankedListColors } from '@/components/common/RankedList';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            RankedItem Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>id</code>: string | number - Unique identifier</li>
            <li><code>title</code>: string - Primary display text</li>
            <li><code>subtitle</code>?: string - Secondary info</li>
            <li><code>meta</code>?: string - Tertiary info</li>
            <li><code>value</code>?: number | string - Primary metric</li>
            <li><code>secondaryValue</code>?: number | string - Secondary metric</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            RankedListProps&lt;T&gt;
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>items</code>: T[] - Array of ranked items</li>
            <li><code>loading</code>?: boolean - Loading state</li>
            <li><code>emptyMessage</code>?: string - Empty state message</li>
            <li><code>topHighlight</code>?: number - Top items to highlight (default: 3)</li>
            <li><code>rankColors</code>?: string[] - Colors for top ranks</li>
            <li><code>otherColor</code>?: string - Color for non-highlighted items</li>
            <li><code>title</code>?: string - List title</li>
            <li><code>renderItem</code>?: (item: T, index: number) =&gt; ReactNode - Custom item renderer</li>
            <li><code>renderMetrics</code>?: (item: T) =&gt; ReactNode - Custom metrics renderer</li>
            <li><code>formatValue</code>?: (value: number | string) =&gt; string - Value formatter</li>
            <li><code>formatSecondaryValue</code>?: (value: number | string) =&gt; string - Secondary value formatter</li>
            <li><code>onItemClick</code>?: (item: T) =&gt; void - Click handler</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
