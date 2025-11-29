/**
 * React Study Courses Definition
 * 코스 목록 및 메타데이터 정의
 */

import { CourseMeta, CourseLevel } from './types';

// Re-export types for convenience
export type { CourseMeta, CourseLevel };

// 코스 레벨별 설정
export const courseLevelConfig: Record<CourseLevel, { label: string; labelKo: string; color: string }> = {
  beginner: {
    label: 'Beginner',
    labelKo: '초급',
    color: '#4CAF50' // green
  },
  intermediate: {
    label: 'Intermediate',
    labelKo: '중급',
    color: '#FF9800' // orange
  },
  advanced: {
    label: 'Advanced',
    labelKo: '고급',
    color: '#F44336' // red
  }
};

// 코스 메타데이터 목록
export const coursesMeta: CourseMeta[] = [
  {
    id: 'beginner',
    level: 'beginner',
    title: 'React Fundamentals',
    titleKo: 'React 기초',
    description: 'Learn the basics of React including JSX, components, props, and state.',
    descriptionKo: 'JSX, 컴포넌트, Props, State 등 React의 기본 개념을 학습합니다.',
    icon: 'Code',
    color: '#4CAF50',
    chapterCount: 10,
    estimatedHours: 20,
    status: 'draft'
  },
  {
    id: 'intermediate',
    level: 'intermediate',
    title: 'React Advanced Patterns',
    titleKo: 'React 심화',
    description: 'Master hooks, context, performance optimization, advanced patterns, and Next.js.',
    descriptionKo: 'Hooks, Context, 성능 최적화, 고급 패턴, Next.js를 마스터합니다.',
    icon: 'Psychology',
    color: '#FF9800',
    chapterCount: 10,
    estimatedHours: 8,
    status: 'draft'
  },
  {
    id: 'advanced',
    level: 'advanced',
    title: 'React Expert',
    titleKo: 'React 전문가',
    description: 'Master enterprise architecture, testing strategies, CI/CD, security, and production monitoring.',
    descriptionKo: '엔터프라이즈 아키텍처, 테스트 전략, CI/CD, 보안, 프로덕션 모니터링을 마스터합니다.',
    icon: 'WorkspacePremium',
    color: '#E91E63',
    chapterCount: 10,
    estimatedHours: 8,
    status: 'draft'
  }
];

// 코스 ID로 메타데이터 조회
export function getCourseMeta(courseId: string): CourseMeta | undefined {
  return coursesMeta.find(course => course.id === courseId);
}

// 레벨별 코스 조회
export function getCoursesByLevel(level: CourseLevel): CourseMeta[] {
  return coursesMeta.filter(course => course.level === level);
}
