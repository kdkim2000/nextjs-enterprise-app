/**
 * React 초급 과정 (Beginner Course)
 */

import { Course, ChapterMeta } from '../types';

// 챕터 임포트
import chapter01 from './chapters/01-introduction';
import chapter02 from './chapters/02-jsx-basics';
import chapter03 from './chapters/03-components';
import chapter04 from './chapters/04-props';
import chapter05 from './chapters/05-state';
import chapter06 from './chapters/06-events';
import chapter07 from './chapters/07-conditional-rendering';
import chapter08 from './chapters/08-lists-and-keys';
import chapter09 from './chapters/09-composition';
import chapter10 from './chapters/10-styling';

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
export const beginnerCourse: Course = {
  id: 'beginner',
  level: 'beginner',
  title: 'React Fundamentals',
  titleKo: 'React 기초',
  description: 'Learn the basics of React including JSX, components, props, and state.',
  descriptionKo: 'JSX, 컴포넌트, Props, State 등 React의 기본 개념을 학습합니다.',
  icon: 'Code',
  color: '#4CAF50',
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

export default beginnerCourse;
