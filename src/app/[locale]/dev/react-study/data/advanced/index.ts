/**
 * React 전문가 과정 (Advanced Course)
 */

import { Course, ChapterMeta } from '../types';

// 챕터 임포트
import chapter01 from './chapters/01-project-architecture';
import chapter02 from './chapters/02-typescript-advanced';
import chapter03 from './chapters/03-component-design';
import chapter04 from './chapters/04-unit-testing';
import chapter05 from './chapters/05-component-testing';
import chapter06 from './chapters/06-e2e-testing';
import chapter07 from './chapters/07-cicd-pipeline';
import chapter08 from './chapters/08-security';
import chapter09 from './chapters/09-monitoring';
import chapter10 from './chapters/10-real-project';

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
export const advancedCourse: Course = {
  id: 'advanced',
  level: 'advanced',
  title: 'React Expert',
  titleKo: 'React 전문가',
  description: 'Master enterprise architecture, testing strategies, CI/CD, security, and production monitoring.',
  descriptionKo: '엔터프라이즈 아키텍처, 테스트 전략, CI/CD, 보안, 프로덕션 모니터링을 마스터합니다.',
  icon: 'WorkspacePremium',
  color: '#E91E63',
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

export default advancedCourse;
