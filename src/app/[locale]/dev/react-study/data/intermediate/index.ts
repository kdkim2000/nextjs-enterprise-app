/**
 * React 중급 과정 (Intermediate Course)
 */

import { Course, ChapterMeta } from '../types';

// 챕터 임포트
import chapter01 from './chapters/01-useeffect-advanced';
import chapter02 from './chapters/02-useref-dom';
import chapter03 from './chapters/03-usememo-usecallback';
import chapter04 from './chapters/04-custom-hooks';
import chapter05 from './chapters/05-context-api';
import chapter06 from './chapters/06-state-patterns';
import chapter07 from './chapters/07-performance';
import chapter08 from './chapters/08-nextjs-app-router';
import chapter09 from './chapters/09-server-client-components';
import chapter10 from './chapters/10-api-communication';

// 전체 챕터 배열
export const chapters = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10
];

// 챕터 메타데이터 (목록 표시용)
export const chaptersMeta: ChapterMeta[] = chapters.map(ch => ({
  id: ch.id,
  order: ch.order,
  title: ch.title,
  titleKo: ch.titleKo,
  description: ch.description,
  descriptionKo: ch.descriptionKo,
  estimatedMinutes: ch.estimatedMinutes,
  status: ch.status
}));

// 코스 정의
export const intermediateCourse: Course = {
  id: 'intermediate',
  level: 'intermediate',
  title: 'React Advanced Patterns',
  titleKo: 'React 심화',
  description: 'Master hooks, context, performance optimization, advanced patterns, and Next.js.',
  descriptionKo: 'Hooks, Context, 성능 최적화, 고급 패턴, Next.js를 마스터합니다.',
  icon: 'Psychology',
  color: '#FF9800',
  chapters,
  status: 'draft',
  estimatedHours: Math.ceil(chapters.reduce((sum, ch) => sum + ch.estimatedMinutes, 0) / 60)
};

// 챕터 ID로 챕터 조회
export function getChapter(chapterId: string) {
  return chapters.find(ch => ch.id === chapterId);
}

// 챕터 순서로 챕터 조회
export function getChapterByOrder(order: number) {
  return chapters.find(ch => ch.order === order);
}

// 다음 챕터 조회
export function getNextChapter(currentChapterId: string) {
  const currentChapter = getChapter(currentChapterId);
  if (!currentChapter) return null;
  return getChapterByOrder(currentChapter.order + 1);
}

// 이전 챕터 조회
export function getPrevChapter(currentChapterId: string) {
  const currentChapter = getChapter(currentChapterId);
  if (!currentChapter) return null;
  return getChapterByOrder(currentChapter.order - 1);
}

export default intermediateCourse;
