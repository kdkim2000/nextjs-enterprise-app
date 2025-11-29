/**
 * Chapter 1: React 소개
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'introduction',
  order: 1,
  title: 'Introduction to React',
  titleKo: 'React 소개',
  description: 'Learn what React is and why it is used for building user interfaces.',
  descriptionKo: 'React가 무엇인지, 왜 사용자 인터페이스 구축에 사용되는지 학습합니다.',
  estimatedMinutes: 30,
  objectives: [
    'Understand what React is and its core philosophy',
    'Learn why React is popular for building UIs',
    'Get familiar with the project structure'
  ],
  objectivesKo: [
    'React가 무엇이고 핵심 철학이 무엇인지 이해한다',
    'React가 UI 구축에 인기 있는 이유를 학습한다',
    '프로젝트 구조에 익숙해진다'
  ],
  sections: [
    {
      id: 'what-is-react',
      title: 'React란 무엇인가?',
      content: `
React는 **사용자 인터페이스(UI)** 를 만들기 위한 JavaScript 라이브러리입니다. Facebook(현 Meta)에서 2013년에 오픈소스로 공개했으며, 현재 전 세계에서 가장 인기 있는 프론트엔드 라이브러리 중 하나입니다.

### React의 정의

공식 홈페이지에서는 React를 다음과 같이 정의합니다:

> "A JavaScript library for building user interfaces"
> (사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리)

여기서 중요한 점은 React가 **"프레임워크"가 아닌 "라이브러리"** 라는 것입니다. 프레임워크는 애플리케이션 전체의 구조를 결정하지만, 라이브러리는 특정 기능만 제공합니다. React는 오직 **UI 렌더링** 에만 집중합니다.

### 라이브러리 vs 프레임워크

| 구분 | 라이브러리 (React) | 프레임워크 (Angular, Vue) |
|------|-------------------|-------------------------|
| 제어권 | 개발자가 라이브러리를 호출 | 프레임워크가 개발자 코드를 호출 |
| 유연성 | 높음 (필요한 것만 선택) | 낮음 (정해진 규칙 따름) |
| 학습 곡선 | 상대적으로 낮음 | 상대적으로 높음 |
      `,
      tips: [
        'React는 UI만 담당하므로, 라우팅(React Router), 상태 관리(Redux, Zustand) 등은 별도 라이브러리를 사용합니다.',
        '본 프로젝트에서는 Next.js 프레임워크 위에서 React를 사용합니다. Next.js가 라우팅, 서버 렌더링 등을 담당합니다.'
      ]
    },
    {
      id: 'why-react',
      title: '왜 React를 사용하는가?',
      content: `
React가 전 세계적으로 인기를 얻은 이유는 무엇일까요? 핵심적인 장점들을 살펴보겠습니다.

### 1. 선언적(Declarative) UI

React는 **"어떻게(How)"가 아닌 "무엇을(What)"** 에 집중합니다. 개발자는 UI가 어떤 모습이어야 하는지만 선언하면, React가 실제 DOM 조작을 처리합니다.

**명령형 방식 (기존 JavaScript/jQuery)**

\`\`\`javascript
// DOM을 직접 조작해야 함
const button = document.createElement('button');
button.textContent = 'Click me';
button.className = 'primary-button';
button.onclick = function() {
  alert('Clicked!');
};
document.body.appendChild(button);
\`\`\`

**선언적 방식 (React)**

\`\`\`jsx
// 원하는 결과만 선언
function MyButton() {
  return (
    <button className="primary-button" onClick={() => alert('Clicked!')}>
      Click me
    </button>
  );
}
\`\`\`

### 2. 컴포넌트 기반(Component-Based)

UI를 독립적이고 재사용 가능한 **컴포넌트** 로 분리합니다. 각 컴포넌트는 자신만의 로직과 스타일을 가지며, 레고 블록처럼 조립하여 복잡한 UI를 구성합니다.

### 3. Virtual DOM

React는 **가상 DOM(Virtual DOM)** 을 사용하여 성능을 최적화합니다. 실제 DOM을 직접 조작하는 대신, 메모리에 가상의 DOM 트리를 유지하고 변경사항만 실제 DOM에 반영합니다.

### 4. 풍부한 생태계

수많은 라이브러리, 도구, 커뮤니티 지원이 있습니다:

- **상태 관리:** Redux, Zustand, Recoil, Jotai
- **UI 라이브러리:** Material-UI (MUI), Chakra UI, Ant Design
- **폼 관리:** React Hook Form, Formik
- **데이터 페칭:** React Query (TanStack Query), SWR
      `,
      tips: [
        '본 프로젝트에서는 UI 라이브러리로 MUI(Material-UI)를 사용합니다.',
        'Virtual DOM 덕분에 개발자는 성능 최적화를 크게 신경 쓰지 않아도 됩니다. React가 알아서 효율적으로 업데이트합니다.'
      ]
    },
    {
      id: 'core-philosophy',
      title: 'React의 핵심 철학',
      content: `
React를 잘 사용하려면 핵심 철학을 이해하는 것이 중요합니다.

### 1. 단방향 데이터 흐름 (One-Way Data Flow)

React에서 데이터는 **항상 부모에서 자식으로** 흐릅니다. 이를 "단방향 데이터 흐름" 또는 "하향식 데이터 흐름"이라고 합니다.

\`\`\`tsx
// 부모 컴포넌트
function ParentComponent() {
  const userName = "홍길동";

  return (
    <ChildComponent name={userName} />  {/* 데이터를 아래로 전달 */}
  );
}

// 자식 컴포넌트
function ChildComponent({ name }) {
  return <p>안녕하세요, {name}님!</p>;
}
\`\`\`

### 2. 불변성 (Immutability)

React에서 상태(state)를 변경할 때는 기존 값을 직접 수정하지 않고, **새로운 값으로 교체** 합니다.

\`\`\`tsx
// ❌ 잘못된 방법 - 직접 수정
const [items, setItems] = useState(['사과', '바나나']);
items.push('오렌지');  // 직접 수정 - React가 변경을 감지하지 못함

// ✅ 올바른 방법 - 새 배열 생성
setItems([...items, '오렌지']);  // 새 배열로 교체
\`\`\`

### 3. 컴포넌트 합성 (Composition)

상속(Inheritance) 대신 **합성(Composition)** 을 권장합니다. 작은 컴포넌트들을 조합하여 큰 컴포넌트를 만듭니다.

\`\`\`tsx
// 작은 컴포넌트들
function Avatar({ src, alt }) {
  return <img src={src} alt={alt} />;
}

function UserName({ name }) {
  return <span>{name}</span>;
}

// 합성하여 큰 컴포넌트 생성
function UserProfile({ user }) {
  return (
    <div>
      <Avatar src={user.avatar} alt={user.name} />
      <UserName name={user.name} />
    </div>
  );
}
\`\`\`
      `,
      tips: [
        '단방향 데이터 흐름 덕분에 데이터의 흐름을 추적하기 쉽고, 디버깅이 용이합니다.',
        '불변성을 지키면 React가 변경사항을 쉽게 감지할 수 있어 성능 최적화에 도움이 됩니다.'
      ]
    },
    {
      id: 'project-structure',
      title: '프로젝트 구조 이해하기',
      content: `
이제 우리가 학습에 사용할 실제 프로젝트 구조를 살펴보겠습니다. 본 프로젝트는 **Next.js + React + TypeScript** 로 구성되어 있습니다.

### 주요 폴더 구조

\`\`\`
nextjs-enterprise-app/
├── src/
│   ├── app/                    # Next.js App Router (페이지들)
│   │   └── [locale]/           # 다국어 지원 (ko, en, zh, vi)
│   │       ├── admin/          # 관리자 페이지
│   │       ├── boards/         # 게시판 페이지
│   │       └── dev/            # 개발자 도구 (현재 위치)
│   │           └── react-study/ # React 학습 페이지
│   │
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── PageContainer/  # 페이지 래퍼
│   │   │   ├── PageHeader/     # 페이지 헤더
│   │   │   ├── CardGrid/       # 카드 그리드
│   │   │   └── Badge/          # 배지 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   └── boards/             # 게시판 관련 컴포넌트
│   │
│   ├── lib/                    # 유틸리티 및 설정
│   │   ├── axios/              # API 클라이언트
│   │   └── i18n/               # 다국어 설정
│   │
│   └── hooks/                  # 커스텀 훅
│
├── backend/                    # Express.js 백엔드
└── public/                     # 정적 파일
\`\`\`

### React 컴포넌트 파일 구조

본 프로젝트에서 컴포넌트는 다음과 같은 패턴으로 구성됩니다:

\`\`\`
components/common/PageContainer/
├── index.tsx        # 메인 컴포넌트 파일
└── (styles.ts)      # 스타일 파일 (필요시)
\`\`\`
      `,
      codeExamples: [
        {
          id: 'page-container-example',
          title: 'PageContainer 컴포넌트 예시',
          description: '본 프로젝트에서 모든 페이지를 감싸는 레이아웃 컴포넌트입니다. children을 받아 내부에 렌더링합니다.',
          fileName: 'src/components/common/PageContainer/index.tsx',
          language: 'tsx',
          code: `// PageContainer - 페이지 레이아웃을 위한 컨테이너 컴포넌트
export interface PageContainerProps {
  children: React.ReactNode;  // 내부에 들어갈 내용
  title?: string;             // 페이지 제목 (선택)
  description?: string;       // 페이지 설명 (선택)
  fullHeight?: boolean;       // 전체 높이 사용 여부
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export default function PageContainer({
  children,
  title,
  description,
  fullHeight = true,
  maxWidth = false,
}: PageContainerProps) {
  return (
    <Container maxWidth={maxWidth}>
      {title && <Typography variant="h4">{title}</Typography>}
      {description && <Typography>{description}</Typography>}
      {children}
    </Container>
  );
}`
        },
        {
          id: 'page-usage-example',
          title: '페이지에서 컴포넌트 사용 예시',
          description: '실제 페이지에서 PageContainer와 PageHeader를 사용하는 방법입니다.',
          language: 'tsx',
          code: `'use client';

import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';

export default function MyPage() {
  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      {/* 페이지 내용 */}
      <div>
        여기에 페이지 내용이 들어갑니다.
      </div>
    </PageContainer>
  );
}`
        }
      ],
      tips: [
        "'use client' 지시문은 Next.js에서 클라이언트 컴포넌트임을 나타냅니다. React의 상태나 이벤트를 사용하려면 필요합니다.",
        '@ 기호는 src 폴더를 가리키는 경로 별칭(alias)입니다. @/components는 src/components와 같습니다.'
      ]
    },
    {
      id: 'first-component',
      title: '첫 번째 컴포넌트 살펴보기',
      content: `
이제 간단한 React 컴포넌트의 구조를 살펴보겠습니다. 아래는 본 프로젝트의 PageHeader 컴포넌트를 단순화한 예시입니다.

### 컴포넌트의 기본 구조

\`\`\`tsx
// 1. 필요한 것들을 import
import React from 'react';
import { Typography, Box } from '@mui/material';

// 2. 컴포넌트에서 받을 데이터 타입 정의 (TypeScript)
interface PageHeaderProps {
  title: string;
  description?: string;  // ? 는 선택적(optional)이라는 의미
}

// 3. 컴포넌트 함수 정의
export default function PageHeader({ title, description }: PageHeaderProps) {
  // 4. JSX를 반환
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography color="text.secondary">{description}</Typography>
      )}
    </Box>
  );
}
\`\`\`

### 코드 분석

1. **import 문:** 필요한 React 기능과 MUI 컴포넌트를 가져옵니다.
2. **interface:** TypeScript로 컴포넌트가 받을 props의 타입을 정의합니다.
3. **함수 컴포넌트:** function 키워드로 컴포넌트를 정의합니다. 이름은 대문자로 시작합니다.
4. **JSX 반환:** HTML과 비슷한 문법(JSX)으로 UI를 반환합니다.

### 사용 예시

\`\`\`tsx
// 다른 컴포넌트에서 사용
<PageHeader title="사용자 목록" description="시스템에 등록된 사용자들입니다." />
\`\`\`
      `,
      tips: [
        '컴포넌트 이름은 반드시 대문자로 시작해야 합니다. (PascalCase)',
        'export default를 사용하면 다른 파일에서 import할 수 있습니다.',
        '{description && ...} 패턴은 description이 있을 때만 렌더링하는 조건부 렌더링입니다.'
      ]
    },
    {
      id: 'summary',
      title: '정리',
      content: `
### 이번 챕터에서 배운 내용

- **React란:** UI를 만들기 위한 JavaScript 라이브러리
- **핵심 특징:** 선언적 UI, 컴포넌트 기반, Virtual DOM
- **핵심 철학:** 단방향 데이터 흐름, 불변성, 컴포넌트 합성
- **프로젝트 구조:** src/components에 재사용 컴포넌트, src/app에 페이지

### 핵심 용어

| 용어 | 설명 |
|------|------|
| 컴포넌트 | UI의 독립적인 조각. 재사용 가능한 함수 |
| JSX | JavaScript에서 HTML을 작성하는 문법 확장 |
| Props | 부모가 자식에게 전달하는 데이터 |
| Virtual DOM | 메모리에 유지되는 가상의 DOM 트리 |

### 다음 챕터 예고

다음 챕터에서는 **JSX 기초** 를 학습합니다. React에서 UI를 작성하는 핵심 문법인 JSX를 자세히 알아보겠습니다.
      `
    }
  ],
  references: [
    {
      title: 'React 공식 문서',
      url: 'https://react.dev',
      type: 'documentation'
    },
    {
      title: 'React 한국어 문서',
      url: 'https://ko.react.dev',
      type: 'documentation'
    },
    {
      title: 'Next.js 공식 문서',
      url: 'https://nextjs.org/docs',
      type: 'documentation'
    }
  ],
  status: 'ready'
};

export default chapter;
