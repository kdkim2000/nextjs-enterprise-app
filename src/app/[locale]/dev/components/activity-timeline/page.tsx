'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Switch, FormControlLabel } from '@mui/material';
import { Article, Comment, Error as ErrorIcon, Login, CheckCircle, Edit, Delete, Person } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import ActivityTimeline, { ActivityItem, ActivityTypeConfig, ActivityTimelineColors } from '@/components/common/ActivityTimeline';

export default function ActivityTimelineDemoPage() {
  const [loading, setLoading] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(true);

  const basicActivities: ActivityItem[] = [
    {
      id: 1,
      type: 'post',
      user: '김철수',
      action: '새 게시글을 작성했습니다',
      target: '프로젝트 진행 상황 보고',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      id: 2,
      type: 'comment',
      user: '이영희',
      action: '댓글을 남겼습니다',
      target: '주간 회의록',
      meta: '공지사항',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 3,
      type: 'error',
      user: 'System',
      action: '서버 오류가 발생했습니다',
      target: 'API Gateway Timeout',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      id: 4,
      type: 'login',
      user: '박지민',
      action: '로그인했습니다',
      meta: 'Chrome / Windows',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    }
  ];

  const typeConfig: Record<string, ActivityTypeConfig> = {
    post: { icon: Article, color: ActivityTimelineColors.info },
    comment: { icon: Comment, color: ActivityTimelineColors.success },
    error: { icon: ErrorIcon, color: ActivityTimelineColors.error },
    login: { icon: Login, color: ActivityTimelineColors.warning }
  };

  const customTypeConfig: Record<string, ActivityTypeConfig> = {
    create: { icon: CheckCircle, color: '#10b981', bgColor: '#10b98115' },
    update: { icon: Edit, color: '#3b82f6', bgColor: '#3b82f615' },
    delete: { icon: Delete, color: '#ef4444', bgColor: '#ef444415' },
    user: { icon: Person, color: '#8b5cf6', bgColor: '#8b5cf615' }
  };

  const customActivities: ActivityItem[] = [
    {
      id: 1,
      type: 'create',
      user: 'Admin',
      action: 'created a new project',
      target: 'E-commerce Platform',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: 2,
      type: 'update',
      user: 'John Doe',
      action: 'updated the settings',
      target: 'Payment Gateway',
      meta: 'Production',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: 3,
      type: 'delete',
      user: 'Jane Smith',
      action: 'deleted a record',
      target: 'Legacy Database',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 120)
    },
    {
      id: 4,
      type: 'user',
      user: 'Mike Johnson',
      action: 'joined the team',
      meta: 'Developer',
      // eslint-disable-next-line react-hooks/purity
      timestamp: new Date(Date.now() - 1000 * 60 * 180)
    }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          ActivityTimeline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A timeline component for displaying user activities with customizable icons and colors.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          사용자 활동을 커스터마이즈 가능한 아이콘과 색상으로 표시하는 타임라인 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display recent activities with type-based icons and relative timestamps.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={basicActivities}
              typeConfig={typeConfig}
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
            {`import ActivityTimeline, { ActivityItem, ActivityTypeConfig } from '@/components/common/ActivityTimeline';
import { Article, Comment, Error, Login } from '@mui/icons-material';

const activities: ActivityItem[] = [
  {
    id: 1,
    type: 'post',
    user: '김철수',
    action: '새 게시글을 작성했습니다',
    target: '프로젝트 진행 상황 보고',
    timestamp: new Date()
  }
];

const typeConfig: Record<string, ActivityTypeConfig> = {
  post: { icon: Article, color: '#3b82f6' },
  comment: { icon: Comment, color: '#10b981' },
  error: { icon: Error, color: '#ef4444' },
  login: { icon: Login, color: '#f59e0b' }
};

<ActivityTimeline items={activities} typeConfig={typeConfig} />`}
          </Box>
        </Paper>

        {/* Custom Type Configuration */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Type Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Define custom icons, colors, and background colors for each activity type.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={customActivities}
              typeConfig={customTypeConfig}
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
            {`const typeConfig: Record<string, ActivityTypeConfig> = {
  create: { icon: CheckCircle, color: '#10b981', bgColor: '#10b98115' },
  update: { icon: Edit, color: '#3b82f6', bgColor: '#3b82f615' },
  delete: { icon: Delete, color: '#ef4444', bgColor: '#ef444415' },
  user: { icon: Person, color: '#8b5cf6', bgColor: '#8b5cf615' }
};

<ActivityTimeline items={activities} typeConfig={typeConfig} />`}
          </Box>
        </Paper>

        {/* Show/Hide Timestamp */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Timestamp Toggle
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show or hide the relative timestamp.
          </Typography>

          <FormControlLabel
            control={<Switch checked={showTimestamp} onChange={(e) => setShowTimestamp(e.target.checked)} />}
            label="Show Timestamp"
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={basicActivities.slice(0, 3)}
              typeConfig={typeConfig}
              showTimestamp={showTimestamp}
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
            {`<ActivityTimeline
  items={activities}
  typeConfig={typeConfig}
  showTimestamp={false}
/>`}
          </Box>
        </Paper>

        {/* Max Items */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Limit Displayed Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Limit the number of activities shown using maxItems.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={basicActivities}
              typeConfig={typeConfig}
              maxItems={2}
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
            {`<ActivityTimeline items={activities} maxItems={2} />`}
          </Box>
        </Paper>

        {/* Custom Timestamp Formatter */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Timestamp Formatter
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use a custom function to format timestamps.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={basicActivities.slice(0, 3)}
              typeConfig={typeConfig}
              formatTimestamp={(date) => date.toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
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
            {`<ActivityTimeline
  items={activities}
  formatTimestamp={(date) => date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
/>`}
          </Box>
        </Paper>

        {/* Empty State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Empty State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Custom message when there are no activities.
          </Typography>

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={[]}
              emptyMessage="아직 활동 내역이 없습니다."
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
            {`<ActivityTimeline
  items={[]}
  emptyMessage="아직 활동 내역이 없습니다."
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

          <Box sx={{ maxWidth: 600, mb: 3 }}>
            <ActivityTimeline
              items={basicActivities}
              typeConfig={typeConfig}
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
            {`<ActivityTimeline items={activities} loading={true} />`}
          </Box>
        </Paper>

        {/* Color Palette */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Default Color Palette
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Available preset colors for activity types.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {Object.entries(ActivityTimelineColors).map(([name, color]) => (
              <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: color }} />
                <Typography variant="body2">
                  {name}: {color}
                </Typography>
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
            {`import { ActivityTimelineColors } from '@/components/common/ActivityTimeline';

// ActivityTimelineColors.primary  // #6366f1
// ActivityTimelineColors.success  // #10b981
// ActivityTimelineColors.warning  // #f59e0b
// ActivityTimelineColors.error    // #ef4444
// ActivityTimelineColors.info     // #3b82f6`}
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
            {`import ActivityTimeline, {
  ActivityItem,
  ActivityTypeConfig,
  ActivityTimelineColors
} from '@/components/common/ActivityTimeline';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            ActivityItem Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>id</code>?: string | number - Unique identifier</li>
            <li><code>type</code>: string - Activity type for icon/color mapping</li>
            <li><code>user</code>: string - Main actor/user name</li>
            <li><code>action</code>: string - Action description</li>
            <li><code>target</code>?: string - Target of the action</li>
            <li><code>meta</code>?: string - Additional metadata</li>
            <li><code>timestamp</code>: string | Date - Activity timestamp</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            ActivityTypeConfig Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>icon</code>: ComponentType - Icon component</li>
            <li><code>color</code>: string - Icon color</li>
            <li><code>bgColor</code>?: string - Avatar background color</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            ActivityTimelineProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>items</code>: ActivityItem[] - Array of activities</li>
            <li><code>loading</code>?: boolean - Loading state</li>
            <li><code>emptyMessage</code>?: string - Empty state message</li>
            <li><code>typeConfig</code>?: Record&lt;string, ActivityTypeConfig&gt; - Type configuration</li>
            <li><code>defaultConfig</code>?: ActivityTypeConfig - Default for unknown types</li>
            <li><code>maxItems</code>?: number - Limit displayed items</li>
            <li><code>showTimestamp</code>?: boolean - Show timestamps (default: true)</li>
            <li><code>locale</code>?: Locale - date-fns locale (default: ko)</li>
            <li><code>formatTimestamp</code>?: (date: Date) =&gt; string - Custom formatter</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
