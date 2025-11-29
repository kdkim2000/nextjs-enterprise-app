/**
 * React Study Course Data Types
 */

// 코드 예제 타입
export interface CodeExample {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: 'tsx' | 'typescript' | 'javascript' | 'jsx' | 'css' | 'json';
  fileName?: string; // 프로젝트 내 실제 파일 경로 (예: src/components/common/Badge/index.tsx)
  highlightLines?: number[]; // 강조할 라인 번호들
}

// 섹션 타입 (챕터 내 세부 구분)
export interface ChapterSection {
  id: string;
  title: string;
  titleKo?: string; // 한국어 제목 (선택)
  content: string; // HTML 또는 Markdown 형식의 내용
  codeExamples?: CodeExample[];
  tips?: string[]; // 팁이나 주의사항
  quiz?: QuizQuestion[]; // 섹션별 퀴즈
}

// 퀴즈 문제 타입
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // options 배열의 인덱스
  explanation: string;
}

// 챕터 타입
export interface Chapter {
  id: string;
  order: number;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  estimatedMinutes: number; // 예상 학습 시간 (분)
  objectives: string[]; // 학습 목표
  objectivesKo: string[];
  sections: ChapterSection[];
  practiceExercises?: PracticeExercise[]; // 실습 과제
  references?: Reference[]; // 참고 자료
  status: 'draft' | 'ready' | 'published';
}

// 실습 과제 타입
export interface PracticeExercise {
  id: string;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
}

// 참고 자료 타입
export interface Reference {
  title: string;
  url: string;
  type: 'documentation' | 'article' | 'video' | 'github';
}

// 코스 레벨 타입
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

// 코스 타입
export interface Course {
  id: string;
  level: CourseLevel;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  icon: string; // MUI 아이콘 이름
  color: string; // 테마 색상
  chapters: Chapter[];
  prerequisites?: string[]; // 선수 과목
  status: 'draft' | 'ready' | 'published';
  estimatedHours: number; // 총 예상 학습 시간
}

// 코스 메타데이터 (목록 표시용, 챕터 내용 제외)
export interface CourseMeta {
  id: string;
  level: CourseLevel;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  color: string;
  chapterCount: number;
  estimatedHours: number;
  status: 'draft' | 'ready' | 'published';
}

// 챕터 메타데이터 (목록 표시용, 섹션 내용 제외)
export interface ChapterMeta {
  id: string;
  order: number;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  estimatedMinutes: number;
  status: 'draft' | 'ready' | 'published';
}
