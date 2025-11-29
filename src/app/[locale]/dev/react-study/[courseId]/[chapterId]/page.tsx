'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  IconButton,
  Collapse,
  Tooltip,
  Alert,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  AccessTime,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  MenuBook,
  Lightbulb,
  Code,
  UnfoldMore,
  UnfoldLess
} from '@mui/icons-material';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

// 코스 데이터 임포트
import { getCourseMeta } from '../../data/courses';
import {
  getChapter as getBeginnerChapter,
  getNextChapter as getBeginnerNextChapter,
  getPrevChapter as getBeginnerPrevChapter
} from '../../data/beginner';
import {
  getChapter as getIntermediateChapter,
  getNextChapter as getIntermediateNextChapter,
  getPrevChapter as getIntermediatePrevChapter
} from '../../data/intermediate';
import {
  getChapter as getAdvancedChapter,
  getNextChapter as getAdvancedNextChapter,
  getPrevChapter as getAdvancedPrevChapter
} from '../../data/advanced';

// 코스별 챕터 함수 매핑
const courseChapterFunctions: Record<string, {
  getChapter: (id: string) => ReturnType<typeof getBeginnerChapter>;
  getNextChapter: (id: string) => ReturnType<typeof getBeginnerNextChapter>;
  getPrevChapter: (id: string) => ReturnType<typeof getBeginnerPrevChapter>;
}> = {
  beginner: {
    getChapter: getBeginnerChapter,
    getNextChapter: getBeginnerNextChapter,
    getPrevChapter: getBeginnerPrevChapter
  },
  intermediate: {
    getChapter: getIntermediateChapter,
    getNextChapter: getIntermediateNextChapter,
    getPrevChapter: getIntermediatePrevChapter
  },
  advanced: {
    getChapter: getAdvancedChapter,
    getNextChapter: getAdvancedNextChapter,
    getPrevChapter: getAdvancedPrevChapter
  }
};

export default function ChapterPage() {
  const params = useParams();
  const locale = useCurrentLocale();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;

  const courseMeta = getCourseMeta(courseId);

  // 코스에 맞는 함수 선택
  const chapterFns = courseChapterFunctions[courseId];
  const chapter = chapterFns?.getChapter(chapterId);
  const nextChapter = chapterFns?.getNextChapter(chapterId);
  const prevChapter = chapterFns?.getPrevChapter(chapterId);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(chapter?.sections.map(s => s.id) || [])
  );

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (chapter) {
      setExpandedSections(new Set(chapter.sections.map(s => s.id)));
    }
  }, [chapter]);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  if (!courseMeta || !chapter) {
    return (
      <PageContainer>
        <PageHeader useMenu showBreadcrumb />
        <Typography variant="h5">챕터를 찾을 수 없습니다.</Typography>
      </PageContainer>
    );
  }

  const hasSections = chapter.sections && chapter.sections.length > 0;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Compact Header */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: 'white' }}>
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Title Bar with Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
            {/* Back Button */}
            <IconButton
              component={Link}
              href={`/${locale}/dev/react-study/${courseId}`}
              size="small"
              sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>

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
                  {chapter.titleKo}
                </Typography>
                <Chip
                  size="small"
                  label={`Chapter ${chapter.order}`}
                  sx={{
                    height: 20,
                    bgcolor: `${courseMeta.color}15`,
                    color: courseMeta.color,
                    fontWeight: 600,
                    fontSize: '0.65rem'
                  }}
                />
                {chapter.status === 'draft' && (
                  <Chip label="작성 중" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
                  <AccessTime sx={{ fontSize: 12 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {chapter.estimatedMinutes}분
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
                  <MenuBook sx={{ fontSize: 12 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {chapter.sections.length}개 섹션
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <Tooltip title="모두 펼치기">
                <IconButton
                  size="small"
                  onClick={expandAll}
                  sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                >
                  <UnfoldMore sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="모두 접기">
                <IconButton
                  size="small"
                  onClick={collapseAll}
                  sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                >
                  <UnfoldLess sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Box sx={{ width: 1, height: 24, bgcolor: 'grey.200', mx: 0.5 }} />

              {/* Navigation */}
              {prevChapter && (
                <Tooltip title={`이전: ${prevChapter.titleKo}`}>
                  <IconButton
                    component={Link}
                    href={`/${locale}/dev/react-study/${courseId}/${prevChapter.id}`}
                    size="small"
                    sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                  >
                    <ArrowBack sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {nextChapter && (
                <Tooltip title={`다음: ${nextChapter.titleKo}`}>
                  <IconButton
                    component={Link}
                    href={`/${locale}/dev/react-study/${courseId}/${nextChapter.id}`}
                    size="small"
                    sx={{ bgcolor: courseMeta.color, color: 'white', '&:hover': { bgcolor: courseMeta.color, filter: 'brightness(0.9)' } }}
                  >
                    <ArrowForward sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </PageContainer>
      </Box>

      {/* Content Area - Scrollable */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', bgcolor: 'grey.50' }}>
        <PageContainer sx={{ py: 2 }}>
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            {/* Learning Objectives */}
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: '#e0f2fe'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: '#f0f9ff',
                  borderBottom: '1px solid',
                  borderColor: '#e0f2fe'
                }}
              >
                <CheckCircle sx={{ fontSize: 20, color: '#0ea5e9' }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#0369a1' }}>
                  학습 목표
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5 }}>
                {chapter.objectivesKo.map((obj, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#0ea5e9',
                        mt: 0.75,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'grey.700', lineHeight: 1.6 }}>
                      {obj}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Sections */}
            {hasSections ? (
              chapter.sections.map((section, index) => {
                const isExpanded = expandedSections.has(section.id);

                return (
                  <Paper
                    key={section.id}
                    elevation={0}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Section Header */}
                    <Box
                      onClick={() => toggleSection(section.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        bgcolor: isExpanded ? 'white' : 'grey.50',
                        borderBottom: isExpanded ? '1px solid' : 'none',
                        borderColor: 'grey.100',
                        '&:hover': { bgcolor: isExpanded ? 'grey.50' : 'grey.100' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: courseMeta.color,
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'grey.800' }}>
                          {section.title}
                        </Typography>
                      </Box>
                      <IconButton size="small" sx={{ color: 'grey.400' }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    {/* Section Content */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ px: 2, py: 2 }}>
                        {/* Main Content - Markdown */}
                        <MarkdownRenderer content={section.content} />

                        {/* Code Examples */}
                        {section.codeExamples && section.codeExamples.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            {section.codeExamples.map((example) => (
                              <Paper
                                key={example.id}
                                elevation={0}
                                sx={{
                                  mb: 2,
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  border: '1px solid',
                                  borderColor: 'grey.200'
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 1,
                                    bgcolor: '#1e1e1e',
                                    color: 'white'
                                  }}
                                >
                                  <Code sx={{ fontSize: 16, color: '#61dafb' }} />
                                  <Typography variant="subtitle2" fontWeight={500}>
                                    {example.title}
                                  </Typography>
                                  {example.fileName && (
                                    <Typography
                                      variant="caption"
                                      sx={{ ml: 'auto', color: 'grey.500', fontFamily: 'monospace' }}
                                    >
                                      {example.fileName}
                                    </Typography>
                                  )}
                                </Box>
                                <MarkdownRenderer content={'```' + example.language + '\n' + example.code + '\n```'} />
                                {example.description && (
                                  <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {example.description}
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        )}

                        {/* Tips */}
                        {section.tips && section.tips.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            {section.tips.map((tip, tipIndex) => (
                              <Alert
                                key={tipIndex}
                                severity="info"
                                icon={<Lightbulb sx={{ color: '#f59e0b' }} />}
                                sx={{
                                  mb: 1.5,
                                  bgcolor: '#fffbeb',
                                  border: '1px solid',
                                  borderColor: '#fde68a',
                                  '& .MuiAlert-message': { color: '#92400e' }
                                }}
                              >
                                {tip}
                              </Alert>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })
            ) : (
              <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'white', borderRadius: 2 }}>
                <MenuBook sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  컨텐츠 준비 중
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  이 챕터의 내용은 현재 작성 중입니다.
                </Typography>
              </Paper>
            )}

            {/* Navigation Footer */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              {prevChapter ? (
                <Button
                  component={Link}
                  href={`/${locale}/dev/react-study/${courseId}/${prevChapter.id}`}
                  startIcon={<ArrowBack />}
                  variant="outlined"
                  sx={{ borderColor: 'grey.300', color: 'grey.700' }}
                >
                  이전: {prevChapter.titleKo}
                </Button>
              ) : (
                <Box />
              )}
              {nextChapter ? (
                <Button
                  component={Link}
                  href={`/${locale}/dev/react-study/${courseId}/${nextChapter.id}`}
                  endIcon={<ArrowForward />}
                  variant="contained"
                  sx={{ bgcolor: courseMeta.color, '&:hover': { bgcolor: courseMeta.color, filter: 'brightness(0.9)' } }}
                >
                  다음: {nextChapter.titleKo}
                </Button>
              ) : (
                <Button
                  component={Link}
                  href={`/${locale}/dev/react-study/${courseId}`}
                  variant="contained"
                  sx={{ bgcolor: courseMeta.color }}
                >
                  코스 완료!
                </Button>
              )}
            </Box>

            {/* Bottom Spacer */}
            <Box sx={{ height: 24 }} />
          </Box>
        </PageContainer>
      </Box>
    </Box>
  );
}
