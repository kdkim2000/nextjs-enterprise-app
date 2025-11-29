'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  PlayArrow,
  AccessTime,
  MenuBook,
  Lock,
  ArrowBack,
  Code
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import CardGrid from '@/components/common/CardGrid';

// 코스 데이터 임포트
import { getCourseMeta, courseLevelConfig } from '../data/courses';
import { chaptersMeta as beginnerChapters } from '../data/beginner';
import { chaptersMeta as intermediateChapters } from '../data/intermediate';
import { chaptersMeta as advancedChapters } from '../data/advanced';
import { ChapterMeta } from '../data/types';

// 코스별 챕터 매핑
const courseChaptersMap: Record<string, ChapterMeta[]> = {
  beginner: beginnerChapters,
  intermediate: intermediateChapters,
  advanced: advancedChapters
};

// Chapter Card Component
function ChapterCard({
  chapter,
  index,
  courseColor,
  onClick
}: {
  chapter: ChapterMeta;
  index: number;
  courseColor: string;
  onClick: () => void;
}) {
  const isReady = chapter.status === 'published' || chapter.status === 'ready';

  return (
    <Paper
      elevation={0}
      onClick={isReady ? onClick : undefined}
      sx={{
        height: '100%',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'white',
        opacity: isReady ? 1 : 0.6,
        cursor: isReady ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': isReady ? {
          borderColor: courseColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${courseColor}20`
        } : {}
      }}
    >
      {/* Header - Chapter Number & Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: isReady ? courseColor : 'grey.300',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          {index + 1}
        </Avatar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isReady ? (
            <Chip
              size="small"
              label="Ready"
              sx={{
                height: 22,
                bgcolor: `${courseColor}15`,
                color: courseColor,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          ) : (
            <Chip
              size="small"
              icon={<Lock sx={{ fontSize: 12 }} />}
              label="준비 중"
              sx={{
                height: 22,
                bgcolor: 'grey.100',
                color: 'grey.500',
                fontWeight: 500,
                fontSize: '0.7rem',
                '& .MuiChip-icon': { color: 'grey.400' }
              }}
            />
          )}
        </Box>
      </Box>

      {/* Title */}
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{
          mb: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.4,
          minHeight: 42,
          color: isReady ? 'grey.800' : 'grey.500'
        }}
      >
        {chapter.titleKo}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5,
          minHeight: 42,
          color: 'grey.500',
          fontSize: '0.8rem'
        }}
      >
        {chapter.descriptionKo}
      </Typography>

      {/* Footer - Time & Action */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'grey.100'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.400' }}>
          <AccessTime sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {chapter.estimatedMinutes}분
          </Typography>
        </Box>
        {isReady && (
          <Chip
            size="small"
            icon={<PlayArrow sx={{ fontSize: 14 }} />}
            label="학습하기"
            sx={{
              height: 24,
              bgcolor: courseColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              '& .MuiChip-icon': { color: 'white' },
              '&:hover': { filter: 'brightness(0.9)' }
            }}
          />
        )}
      </Box>
    </Paper>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const locale = useCurrentLocale();
  const router = useRouter();
  const courseId = params.courseId as string;

  const courseMeta = getCourseMeta(courseId);
  const chapters = courseChaptersMap[courseId] || [];

  if (!courseMeta) {
    return (
      <PageContainer>
        <PageHeader useMenu showBreadcrumb />
        <Typography variant="h5">코스를 찾을 수 없습니다.</Typography>
      </PageContainer>
    );
  }

  const levelConfig = courseLevelConfig[courseMeta.level];
  const totalMinutes = chapters.reduce((sum, ch) => sum + ch.estimatedMinutes, 0);
  const readyChapters = chapters.filter(ch => ch.status === 'published' || ch.status === 'ready').length;
  const progress = chapters.length > 0 ? (readyChapters / chapters.length) * 100 : 0;

  const handleChapterClick = (chapterId: string) => {
    router.push(`/${locale}/dev/react-study/${courseId}/${chapterId}`);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          zIndex: 10
        }}
      >
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Title Bar with Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
            {/* Back Button */}
            <Tooltip title="코스 목록으로">
              <IconButton
                component={Link}
                href={`/${locale}/dev/react-study`}
                size="small"
                sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
              >
                <ArrowBack sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Course Icon */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: courseMeta.color,
                color: 'white'
              }}
            >
              <Code sx={{ fontSize: 22 }} />
            </Avatar>

            {/* Title Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'grey.800'
                  }}
                >
                  {courseMeta.titleKo}
                </Typography>
                <Chip
                  size="small"
                  label={levelConfig.labelKo}
                  sx={{
                    height: 20,
                    bgcolor: `${courseMeta.color}15`,
                    color: courseMeta.color,
                    fontWeight: 600,
                    fontSize: '0.65rem'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
                  <MenuBook sx={{ fontSize: 12 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {chapters.length}개 챕터
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
                  <AccessTime sx={{ fontSize: 12 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    약 {Math.ceil(totalMinutes / 60)}시간
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Progress Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '0.65rem' }}>
                  컨텐츠 준비
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: courseMeta.color }}>
                  {readyChapters}/{chapters.length}
                </Typography>
              </Box>
              <Box sx={{ width: 60 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: courseMeta.color,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', bgcolor: 'grey.50' }}>
        <PageContainer sx={{ py: 3 }}>
          {/* Course Description Card */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'white'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {courseMeta.descriptionKo}
            </Typography>
          </Paper>

          {/* Section Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'grey.700' }}>
              챕터 목록
            </Typography>
            <Chip
              size="small"
              label={`${chapters.length}개`}
              sx={{
                height: 20,
                bgcolor: 'grey.100',
                color: 'grey.600',
                fontWeight: 500,
                fontSize: '0.7rem'
              }}
            />
          </Box>

          {/* Chapters Grid */}
          <CardGrid
            items={chapters}
            loading={false}
            columns={{ xs: 12, sm: 6, md: 4 }}
            renderCard={(chapter, index) => (
              <ChapterCard
                chapter={chapter}
                index={index}
                courseColor={courseMeta.color}
                onClick={() => handleChapterClick(chapter.id)}
              />
            )}
            emptyIcon={<MenuBook sx={{ fontSize: 64 }} />}
            emptyTitle="아직 준비된 챕터가 없습니다"
            emptyDescription="곧 컨텐츠가 추가될 예정입니다."
          />
        </PageContainer>
      </Box>
    </Box>
  );
}
