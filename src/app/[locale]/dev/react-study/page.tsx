'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  MenuBook,
  Code,
  Psychology,
  Rocket,
  AccessTime,
  PlayArrow,
  Lock,
  WorkspacePremium
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import CardGrid, { CardWrapper } from '@/components/common/CardGrid';

// 코스 데이터 임포트
import { coursesMeta, courseLevelConfig, CourseMeta } from './data/courses';
import { chaptersMeta as beginnerChapters } from './data/beginner';
import { chaptersMeta as intermediateChapters } from './data/intermediate';
import { chaptersMeta as advancedChapters } from './data/advanced';

// 아이콘 매핑
const iconMap: Record<string, React.ReactNode> = {
  Code: <Code sx={{ fontSize: 22 }} />,
  Psychology: <Psychology sx={{ fontSize: 22 }} />,
  Rocket: <Rocket sx={{ fontSize: 22 }} />,
  WorkspacePremium: <WorkspacePremium sx={{ fontSize: 22 }} />
};

// 코스별 챕터 수 매핑
const courseChapterCounts: Record<string, number> = {
  beginner: beginnerChapters.length,
  intermediate: intermediateChapters.length,
  advanced: advancedChapters.length
};

// Course Card Component
function CourseCard({
  course,
  onClick
}: {
  course: CourseMeta;
  onClick: () => void;
}) {
  const levelConfig = courseLevelConfig[course.level];
  const chapterCount = courseChapterCounts[course.id] || 0;
  const isAvailable = chapterCount > 0;
  const progress = course.status === 'published' ? 100 : course.status === 'ready' ? 50 : 10;

  return (
    <CardWrapper
      onClick={isAvailable ? onClick : undefined}
      sx={{
        opacity: isAvailable ? 1 : 0.6,
        cursor: isAvailable ? 'pointer' : 'default',
        '&:hover': isAvailable ? {
          borderColor: course.color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${course.color}20`
        } : {}
      }}
    >
      {/* Header - Icon & Level Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: course.color,
            color: 'white'
          }}
        >
          {iconMap[course.icon]}
        </Avatar>
        <Chip
          size="small"
          label={levelConfig.labelKo}
          sx={{
            height: 22,
            bgcolor: `${course.color}15`,
            color: course.color,
            fontWeight: 600,
            fontSize: '0.7rem'
          }}
        />
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
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          color: isAvailable ? 'grey.800' : 'grey.500'
        }}
      >
        {course.titleKo}
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
        {course.descriptionKo}
      </Typography>

      {/* Meta Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
          <MenuBook sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {chapterCount}개 챕터
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
          <AccessTime sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            약 {course.estimatedHours}시간
          </Typography>
        </Box>
      </Box>

      {/* Progress */}
      {isAvailable && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '0.7rem' }}>
              {course.status === 'draft' ? '컨텐츠 작성 중' : course.status === 'ready' ? '준비 완료' : '공개됨'}
            </Typography>
            <Typography variant="caption" sx={{ color: course.color, fontWeight: 600, fontSize: '0.7rem' }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: course.color,
                borderRadius: 2
              }
            }}
          />
        </Box>
      )}

      {/* Footer - Action Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'grey.100'
        }}
      >
        {isAvailable ? (
          <Chip
            size="small"
            icon={<PlayArrow sx={{ fontSize: 14 }} />}
            label="시작하기"
            sx={{
              height: 26,
              bgcolor: course.color,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { color: 'white' },
              '&:hover': { filter: 'brightness(0.9)' }
            }}
          />
        ) : (
          <Chip
            size="small"
            icon={<Lock sx={{ fontSize: 12 }} />}
            label="준비 중"
            sx={{
              height: 26,
              bgcolor: 'grey.100',
              color: 'grey.500',
              fontWeight: 500,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { color: 'grey.400' }
            }}
          />
        )}
      </Box>
    </CardWrapper>
  );
}

export default function ReactStudyPage() {
  const locale = useCurrentLocale();
  const router = useRouter();

  const handleCourseClick = (courseId: string) => {
    router.push(`/${locale}/dev/react-study/${courseId}`);
  };

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
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', bgcolor: 'grey.50' }}>
        <PageContainer sx={{ py: 3 }}>
          {/* Section Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'grey.700' }}>
              학습 커리큘럼
            </Typography>
            <Chip
              size="small"
              label={`${coursesMeta.length}개 코스`}
              sx={{
                height: 20,
                bgcolor: 'grey.100',
                color: 'grey.600',
                fontWeight: 500,
                fontSize: '0.7rem'
              }}
            />
          </Box>

          {/* Courses Grid */}
          <CardGrid
            items={coursesMeta}
            loading={false}
            columns={{ xs: 12, sm: 6, md: 4 }}
            renderCard={(course) => (
              <CourseCard
                course={course}
                onClick={() => handleCourseClick(course.id)}
              />
            )}
            emptyIcon={<MenuBook sx={{ fontSize: 64 }} />}
            emptyTitle="아직 준비된 코스가 없습니다"
            emptyDescription="곧 컨텐츠가 추가될 예정입니다."
          />

          {/* Learning Guide Section */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'grey.700' }}>
                학습 안내
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2
              }}
            >
              {/* Learning Goals */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                    <Rocket sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'grey.800' }}>
                    학습 목표
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • React 핵심 개념과 원리 이해
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 컴포넌트 기반 개발 방법론 습득
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 현대적 React 생태계 활용
                  </Typography>
                </Box>
              </Box>

              {/* Learning Method */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'success.main' }}>
                    <MenuBook sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'grey.800' }}>
                    학습 방법
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 매주 정해진 교재 학습
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 실습 예제 완성 및 미니 프로젝트
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 토론 및 코드 리뷰
                  </Typography>
                </Box>
              </Box>

              {/* Resources */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'warning.main' }}>
                    <Code sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'grey.800' }}>
                    학습 자료
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • React 공식 문서 참조
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 프로젝트 내 실제 코드 예제
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    • 단계별 학습 로드맵
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </PageContainer>
      </Box>
    </Box>
  );
}
