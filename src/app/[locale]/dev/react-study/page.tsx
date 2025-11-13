'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  MenuBook,
  Code,
  Psychology,
  Timeline,
  Rocket,
  Group
} from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';

export default function ReactStudyPage() {
  return (
    <PageContainer sx={{ height: 'auto', minHeight: '100vh', overflow: 'auto' }}>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          React 연구회
        </Typography>
        <Typography variant="body1" color="text.secondary">
          React 학습을 위한 체계적인 교재와 실습 자료를 제공합니다.
        </Typography>
      </Box>

      {/* Welcome Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Group sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              React 연구회에 오신 것을 환영합니다
            </Typography>
            <Typography variant="body1">
              함께 배우고 성장하는 React 학습 커뮤니티
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Study Curriculum */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            학습 커리큘럼
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Code color="primary" />
                    <Typography variant="h6">기초 과정</Typography>
                    <Chip label="준비 중" size="small" color="warning" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    React의 기본 개념과 JSX, 컴포넌트, Props에 대해 학습합니다.
                  </Typography>
                  <Button variant="outlined" size="small" disabled>
                    시작하기
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Psychology color="primary" />
                    <Typography variant="h6">중급 과정</Typography>
                    <Chip label="준비 중" size="small" color="warning" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Hooks, State 관리, 라이프사이클에 대해 심화 학습합니다.
                  </Typography>
                  <Button variant="outlined" size="small" disabled>
                    시작하기
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Rocket color="primary" />
                    <Typography variant="h6">고급 과정</Typography>
                    <Chip label="준비 중" size="small" color="warning" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    성능 최적화, 고급 패턴, 실전 프로젝트를 진행합니다.
                  </Typography>
                  <Button variant="outlined" size="small" disabled>
                    시작하기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Learning Resources */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            학습 자료
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <MenuBook color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">공식 문서</Typography>
                    <Typography variant="body2" color="text.secondary">
                      React 공식 문서와 튜토리얼
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Timeline color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">학습 로드맵</Typography>
                    <Typography variant="body2" color="text.secondary">
                      단계별 React 학습 가이드
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Study Guidelines */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            학습 가이드
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                학습 목표
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • React의 핵심 개념과 원리를 이해하고 실무에 적용할 수 있다
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 컴포넌트 기반 개발 방법론을 습득한다
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 현대적인 React 개발 도구와 생태계를 활용할 수 있다
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                학습 방법
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 매주 정해진 교재를 학습하고 실습 예제를 완성합니다
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 학습한 내용을 바탕으로 미니 프로젝트를 진행합니다
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 함께 토론하고 서로의 코드를 리뷰합니다
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                참여 방법
              </Typography>
              <Typography variant="body2" color="text.secondary">
                자세한 내용은 개발팀에 문의해주세요.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
