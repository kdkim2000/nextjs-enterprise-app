# Claude Code Sessions

Claude Code와의 대화를 저장하고 학습 자료로 활용하기 위한 문서입니다.

## 폴더 구조

```
docs/claude-sessions/
├── README.md                    # 이 파일
├── _index.md                    # 전체 세션 목록
├── templates/                   # 템플릿 폴더
│   └── session-template.md      # 세션 템플릿
├── 2024-11/                     # 월별 폴더
│   ├── 2024-11-29-attachment-refactor.md
│   └── ...
└── 2024-12/
    └── ...
```

## 파일 명명 규칙

```
YYYY-MM-DD-{간단한-설명}.md
```

예시:
- `2024-11-29-attachment-system-refactor.md`
- `2024-11-29-notice-popup-bugfix.md`
- `2024-11-30-rich-text-editor-image-upload.md`

## 카테고리

| 카테고리 | 설명 |
|---------|------|
| `bug-fix` | 버그 수정 |
| `feature` | 새 기능 개발 |
| `refactor` | 코드 리팩토링 |
| `debugging` | 디버깅 과정 |
| `learning` | 학습/질문 |
| `architecture` | 아키텍처 설계 |
| `performance` | 성능 최적화 |
| `security` | 보안 관련 |

## 난이도

| 레벨 | 설명 |
|------|------|
| `easy` | 간단한 수정, 기본 개념 |
| `medium` | 중간 복잡도, 여러 파일 수정 |
| `hard` | 복잡한 문제, 아키텍처 변경 |

## 태그

기술 태그: `#react`, `#nextjs`, `#typescript`, `#nodejs`, `#postgresql`, `#css`, `#api`

주제 태그: `#bug-fix`, `#feature`, `#refactor`, `#debugging`, `#performance`

## 사용 방법

1. 새 세션 시작 시 `templates/session-template.md`를 복사
2. 파일명을 날짜-설명 형식으로 변경
3. 해당 월 폴더에 저장
4. `_index.md`에 링크 추가

## 검색 팁

- VS Code에서 `Ctrl+Shift+F`로 전체 검색
- 태그로 검색: `#typescript`
- 카테고리로 검색: `category: bug-fix`
- 날짜로 검색: `2024-11-29`
