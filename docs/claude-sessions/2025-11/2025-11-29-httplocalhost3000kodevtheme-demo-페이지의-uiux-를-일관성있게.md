# httplocalhost3000kodevtheme-demo 페이지의 UIUX 를 일관성있게 변경한다. httplocalhost3000kodevcompon...

## 메타데이터

| 항목 | 값 |
|------|---|
| **날짜** | 2025-11-29 |
| **프로젝트** | nextjs-enterprise-app |
| **브랜치** | 14-baseline |
| **카테고리** | bug-fix |
| **난이도** | hard |
| **소요시간** | 102분 |
| **메시지 수** | 126 |
| **세션 ID** | 147799b0-0924-4d75-bd5e-67e166b9eba9 |

---

## 대화 내용

### 👤 사용자 (오전 8:14:05)

http://localhost:3000/ko/dev/theme-demo 페이지의 UI/UX 를 일관성있게 변경한다. http://localhost:3000/ko/dev/components 페이지를 참고하여 사용자가 UI/UX 를 경험할 수 있도록 수정하라. 

### 🤖 Claude (오전 8:14:10)

두 페이지의 현재 상태를 먼저 확인하겠습니다.

### 👤 사용자 (오전 8:14:26)



### 👤 사용자 (오전 8:14:26)



### 👤 사용자 (오전 8:14:46)



### 👤 사용자 (오전 8:14:46)



### 👤 사용자 (오전 8:15:03)



### 🤖 Claude (오전 8:15:07)

두 페이지를 읽어보겠습니다.

### 👤 사용자 (오전 8:15:14)



### 👤 사용자 (오전 8:15:14)



### 👤 사용자 (오전 8:15:29)



### 👤 사용자 (오전 8:15:37)



### 🤖 Claude (오전 8:15:46)

이제 theme-demo 페이지를 components 페이지와 일관된 UI/UX로 리팩토링하겠습니다. 먼저 섹션 데이터를 만들고 페이지 구조를 업데이트합니다.

### 👤 사용자 (오전 8:18:22)



### 👤 사용자 (오전 8:20:06)



### 👤 사용자 (오전 8:20:17)



### 👤 사용자 (오전 8:21:47)



### 🤖 Claude (오전 8:21:51)

theme 타입 문제를 수정해야 합니다.

### 👤 사용자 (오전 8:21:55)



### 👤 사용자 (오전 8:22:03)



### 🤖 Claude (오전 8:22:08)

타입 문제를 수정하겠습니다. `Theme` 타입을 명시적으로 사용해야 합니다.

### 👤 사용자 (오전 8:22:09)



### 👤 사용자 (오전 8:22:17)



### 👤 사용자 (오전 8:22:24)



### 👤 사용자 (오전 8:22:32)



### 👤 사용자 (오전 8:22:41)



### 👤 사용자 (오전 8:22:48)



### 👤 사용자 (오전 8:22:56)



### 👤 사용자 (오전 8:23:19)



### 👤 사용자 (오전 8:23:27)



### 🤖 Claude (오전 8:23:41)

theme-demo 페이지의 UI/UX를 components 페이지와 일관되게 수정 완료했습니다.

## 주요 변경 사항

### 1. 레이아웃 구조 변경
- **Fixed Header + Scrollable Content** 구조로 변경
- 검색바가 상단에 고정되어 스크롤해도 항상 보임

### 2. 검색 기능 추가
- `QuickSearchBar` 컴포넌트 통합
- 이름, 설명, 태그로 테마 요소 검색 가능
- 검색 결과 카운트 표시 (예: "15 / 23 elements")

### 3. 섹션 카테고리화
- 6개 섹션 (Typography, Status Colors, Role Colors, Component Overrides, Spacing, Usage Guide)
- 각 섹션에 아이콘과 고유 색상 적용
- 접기/펼치기 기능 추가

### 4. 인터랙티브 요소 추가
- 모든 카드/Paper에 hover 효과 (transform, boxShadow)
- 상태 칩과 아바타에 hover 시 scale 효과
- 섹션 헤더 클릭으로 접기/펼치기

### 5. 빈 상태 처리
- 검색 결과가 없을 때 친절한 안내 메시지 표시

### 6. Theme Strategy 정보 박스
- 하단에 테마 전략 요약 정보 제공

새로운 파일:
- `src/app/[locale]/dev/theme-demo/themeSections.ts` - 섹션 데이터 정의

http://localhost:3000/ko/dev/theme-demo 에서 변경된 UI를 확인할 수 있습니다.

### 👤 사용자 (오전 8:27:08)

http://localhost:3000/ko/dashboard 대시보드 를 작성한다. 
현재 보유하고 관리하고 있는 정보들로 구성가능한 대시보드 형태가 컨셉 안을 제안하라. 


### 🤖 Claude (오전 8:27:15)

현재 프로젝트에서 관리하고 있는 데이터를 파악하여 대시보드 컨셉을 제안하겠습니다.

### 👤 사용자 (오전 8:32:04)



### 🤖 Claude (오전 8:32:43)

현재 프로젝트 데이터를 분석했습니다. 다음은 대시보드 컨셉 제안입니다.

---

## 대시보드 컨셉 제안

### 관리 중인 핵심 데이터
| 도메인 | 테이블 | 활용 가능 지표 |
|--------|--------|----------------|
| **사용자** | users, departments, roles | 사용자 수, 상태별 분포, 부서별 인원 |
| **콘텐츠** | posts, comments, post_views, post_likes | 게시글 수, 조회수, 좋아요, 댓글 |
| **게시판** | board_types | 게시판별 활동량 |
| **시스템** | logs | API 호출량, 에러율, 응답시간 |
| **학습** | conversations | 학습 세션, 태그 분포 |

---

## 3가지 대시보드 컨셉 안

### **컨셉 A: 통합 운영 대시보드 (Admin Overview)**
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 KPI 카드 (4개)                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 총 사용자 │ │ 오늘 게시글│ │ API 호출  │ │ 에러율   │               │
│  │  29,997  │ │   128   │ │ 15,432  │ │  0.3%  │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  📈 활동 추이 (Line Chart)          │  🥧 사용자 상태 (Pie)      │
│  [7일간 게시글/댓글/조회수 추이]      │  [Active/Inactive/Pending] │
├─────────────────────────────────────────────────────────────────┤
│  📊 부서별 인원 (Bar Chart)          │  🔥 인기 게시판 (Bar)      │
│  [Top 10 부서 인원수]               │  [게시판별 게시글 수]        │
├─────────────────────────────────────────────────────────────────┤
│  📋 최근 활동 (Table)               │  ⚡ 빠른 작업 (Actions)     │
│  [최근 게시글/댓글 목록]              │  [신규사용자, 게시판관리 등]  │
└─────────────────────────────────────────────────────────────────┘
```

### **컨셉 B: 콘텐츠 중심 대시보드 (Content Analytics)**
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 콘텐츠 KPI (4개)                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 총 게시글 │ │ 총 댓글  │ │ 총 조회수 │ │ 총 좋아요 │               │
│  │  5,432  │ │ 12,847 │ │ 89,432  │ │  3,241 │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  📈 게시글 생성 추이 (Area Chart)                                 │
│  [월별/주별 게시글 생성 트렌드 - 게시판별 스택]                        │
├─────────────────────────────────────────────────────────────────┤
│  🏆 인기 게시글 Top 5               │  👤 활발한 작성자 Top 5     │
│  [조회수 기준 순위]                  │  [게시글 수 기준 순위]        │
├─────────────────────────────────────────────────────────────────┤
│  📊 게시판별 참여도 (Composed Chart)                              │
│  [게시판별 게시글 수(Bar) + 평균 조회수(Line)]                       │
└─────────────────────────────────────────────────────────────────┘
```

### **컨셉 C: 시스템 모니터링 대시보드 (System Health)**
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 시스템 KPI (4개)                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 오늘 요청 │ │ 평균응답  │ │ 에러 건수 │ │ 활성세션  │               │
│  │ 45,231  │ │  120ms │ │   23   │ │   847  │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  📈 API 호출량 (Area Chart)         │  🔴 HTTP 상태코드 (Donut)   │
│  [시간대별 요청 수]                  │  [2xx/4xx/5xx 비율]        │
├─────────────────────────────────────────────────────────────────┤
│  🐢 느린 엔드포인트 Top 5            │  ❌ 에러 많은 엔드포인트 Top 5 │
│  [평균 응답시간 기준]                 │  [에러 건수 기준]            │
├─────────────────────────────────────────────────────────────────┤
│  📋 최근 에러 로그 (Table)                                        │
│  [에러 발생 시간, 엔드포인트, 상태코드, 메시지]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 추천: 컨셉 A + B 하이브리드

**실제 엔터프라이즈 앱에서 가장 유용한 조합:**

```
┌─────────────────────────────────────────────────────────────────┐
│  통합 대시보드                                          [기간 선택]│
├─────────────────────────────────────────────────────────────────┤
│  📊 핵심 KPI (6개 카드)                                          │
│  [총사용자] [활성사용자] [게시글] [댓글] [오늘조회] [에러율]            │
├───────────────────────────────┬─────────────────────────────────┤
│  📈 주간 활동 추이 (Line)       │  👥 부서별 인원 (Horizontal Bar) │
│  게시글/댓글/조회수              │  Top 8 부서                     │
├───────────────────────────────┼─────────────────────────────────┤
│  🥧 사용자 상태 (Donut)         │  📊 게시판별 활동 (Bar)          │
│  Active/Inactive/Pending      │  게시판별 게시글 수               │
├───────────────────────────────┴─────────────────────────────────┤
│  📋 최근 게시글                  │  ⚡ 빠른 작업                   │
│  [제목, 작성자, 게시판, 일시]      │  [사용자관리, 게시판관리, 로그]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 어떤 컨셉을 선택하시겠습니까?

| 옵션 | 특징 | 적합한 사용자 |
|------|------|--------------|
| **A** | 전체 운영 현황 파악 | 관리자, 운영팀 |
| **B** | 콘텐츠 성과 분석 | 콘텐츠 담당자, 마케팅 |
| **C** | 시스템 안정성 모니터링 | 개발자, DevOps |
| **A+B** | 운영 + 콘텐츠 통합 | 대부분의 관리자 |

선택하시면 해당 대시보드를 구현하겠습니다.

### 👤 사용자 (오전 8:35:56)

A  + B + C 형태의 통합된 관리자용 게시판을 다시 제안하라. 


### 🤖 Claude (오전 8:36:52)

## 통합 관리자 대시보드 (A + B + C)

---

### 전체 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 관리자 대시보드                                    [오늘] [7일] [30일] 🔄 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │👥총사용자│ │✅활성사용자│ │📝총게시글│ │💬총댓글  │ │👁오늘조회│ │⚠️에러율 │  │
│  │ 29,997 │ │ 24,532 │ │  5,432 │ │ 12,847 │ │  3,241 │ │  0.3% │  │
│  │ +2.3%  │ │  82%   │ │ +128   │ │ +89    │ │ ↑15%   │ │ ↓0.1% │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 📈 활동 추이 (7일) ──────────────────┐ ┌─ 👥 사용자 현황 ─────────────┐ │
│  │                                      │ │                             │ │
│  │    ╭──╮                              │ │   ┌─────────────────┐       │ │
│  │   ╱    ╲    ╭──╮                     │ │   │    ● Active     │       │ │
│  │  ╱      ╲  ╱    ╲   게시글           │ │   │      82%       │       │ │
│  │ ╱        ╲╱      ╲  ─────            │ │   │  ● Inactive 15% │       │ │
│  │╱                  ╲ 댓글  ─ ─ ─       │ │   │  ● Pending  3%  │       │ │
│  │                    조회수 · · ·       │ │   └─────────────────┘       │ │
│  │ Mon Tue Wed Thu Fri Sat Sun          │ │      (Donut Chart)          │ │
│  └──────────────────────────────────────┘ └─────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 🏢 부서별 인원 Top 8 ────────────────┐ ┌─ 📋 게시판별 활동 ───────────┐ │
│  │                                      │ │                             │ │
│  │  개발팀      ████████████████ 1,234  │ │  공지사항  ███████████ 432   │ │
│  │  영업팀      ██████████████ 1,102    │ │  자유게시판 █████████ 387    │ │
│  │  마케팅팀    ████████████ 987        │ │  Q&A      ███████ 298       │ │
│  │  인사팀      ██████████ 856          │ │  자료실   █████ 215         │ │
│  │  재무팀      ████████ 743            │ │  건의사항  ███ 156          │ │
│  │  기획팀      ██████ 621              │ │                             │ │
│  │  디자인팀    ████ 432                │ │   (Horizontal Bar Chart)    │ │
│  │  QA팀       ██ 298                  │ │                             │ │
│  └──────────────────────────────────────┘ └─────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ ⚡ 시스템 성능 ──────────────────────┐ ┌─ 🔴 HTTP 상태 분포 ──────────┐ │
│  │                                      │ │                             │ │
│  │  API 호출 (24h)                      │ │   2xx ████████████████ 94%  │ │
│  │    ╭────────────────────╮            │ │   3xx ██ 2%                 │ │
│  │   ╱                      ╲           │ │   4xx ██ 3%                 │ │
│  │  ╱    평균: 120ms         ╲          │ │   5xx █ 1%                  │ │
│  │ ╱                          ╲         │ │                             │ │
│  │  00  04  08  12  16  20  24          │ │   (Stacked Bar / Donut)     │ │
│  └──────────────────────────────────────┘ └─────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 🏆 인기 게시글 Top 5 ────────────────┐ ┌─ ❌ 에러 엔드포인트 Top 5 ───┐ │
│  │                                      │ │                             │ │
│  │  # │ 제목           │ 조회 │ 좋아요   │ │  # │ 엔드포인트    │ 에러수  │ │
│  │  1 │ 2024년 신규... │ 3.2K │   89    │ │  1 │ /api/upload   │   23   │ │
│  │  2 │ 시스템 점검... │ 2.8K │   67    │ │  2 │ /api/user/... │   12   │ │
│  │  3 │ 하반기 계획... │ 2.1K │   54    │ │  3 │ /api/post/... │    8   │ │
│  │  4 │ 복지 제도 ...  │ 1.9K │   43    │ │  4 │ /api/auth/... │    5   │ │
│  │  5 │ 조직개편 안... │ 1.7K │   38    │ │  5 │ /api/log/...  │    3   │ │
│  └──────────────────────────────────────┘ └─────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 📋 최근 활동 ────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  [게시글] [댓글] [로그인] [시스템]                           [더보기 →] │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │  🟢 홍길동   새 게시글 작성 "2024년 하반기 계획"     공지사항   2분 전  │ │
│  │  🟢 김철수   댓글 작성 "좋은 정보 감사합니다"        자유게시판  5분 전  │ │
│  │  🟡 이영희   로그인                                          8분 전  │ │
│  │  🔴 System  API Error /api/upload (500)                    12분 전  │ │
│  │  🟢 박지민   새 게시글 작성 "신규 프로젝트 안내"      Q&A       15분 전  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ ⚡ 빠른 작업 ────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │ 👤       │ │ 📝       │ │ 🏢       │ │ 📊       │ │ ⚙️       │   │ │
│  │  │ 사용자   │ │ 게시판   │ │ 부서     │ │ 로그     │ │ 설정     │   │ │
│  │  │ 관리     │ │ 관리     │ │ 관리     │ │ 분석     │ │ 관리     │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 섹션별 상세 구성

| 섹션 | 구성요소 | 데이터 소스 | 차트 타입 |
|------|---------|------------|----------|
| **KPI 카드** | 6개 핵심 지표 | users, posts, comments, logs | StatCard |
| **활동 추이** | 7일간 게시글/댓글/조회수 | posts, comments, post_views | LineChart |
| **사용자 현황** | 상태별 분포 | users.status | DonutChart |
| **부서별 인원** | Top 8 부서 | users + departments | HorizontalBar |
| **게시판별 활동** | 게시판별 게시글 수 | posts + board_types | HorizontalBar |
| **시스템 성능** | 24시간 API 호출량 | logs | AreaChart |
| **HTTP 상태** | 상태코드 분포 | logs.status_code | StackedBar/Donut |
| **인기 게시글** | 조회수 Top 5 | posts | Table |
| **에러 엔드포인트** | 에러 Top 5 | logs (5xx) | Table |
| **최근 활동** | 실시간 활동 피드 | posts, comments, logs | Timeline |
| **빠른 작업** | 관리 페이지 바로가기 | - | ActionCards |

---

### 기술 구현 계획

```
src/app/[locale]/dashboard/
├── page.tsx                    # 메인 대시보드 페이지
├── components/
│   ├── KPICards.tsx           # 6개 KPI 카드
│   ├── ActivityTrendChart.tsx  # 활동 추이 라인차트
│   ├── UserStatusChart.tsx     # 사용자 상태 도넛차트
│   ├── DepartmentChart.tsx     # 부서별 인원 바차트
│   ├── BoardActivityChart.tsx  # 게시판별 활동 바차트
│   ├── SystemPerformanceChart.tsx # API 호출 에어리어차트
│   ├── HttpStatusChart.tsx     # HTTP 상태 분포
│   ├── TopPostsTable.tsx       # 인기 게시글 테이블
│   ├── ErrorEndpointsTable.tsx # 에러 엔드포인트 테이블
│   ├── RecentActivityFeed.tsx  # 최근 활동 피드
│   └── QuickActions.tsx        # 빠른 작업 카드
├── hooks/
│   └── useDashboardData.ts     # 대시보드 데이터 fetching
└── types.ts                    # 타입 정의

backend/routes/
└── dashboard.js               # 대시보드 전용 API
```

---

### 필요한 백엔드 API

```javascript
// GET /api/dashboard/summary
{
  users: { total, active, inactive, pending, growth },
  posts: { total, today, weekGrowth },
  comments: { total, today },
  views: { today, weekGrowth },
  errors: { rate, count }
}

// GET /api/dashboard/activity-trend?days=7
[{ date, posts, comments, views }]

// GET /api/dashboard/user-status
[{ status, count, percentage }]

// GET /api/dashboard/department-stats?limit=8
[{ department, count }]

// GET /api/dashboard/board-activity
[{ boardType, postCount }]

// GET /api/dashboard/system-performance?hours=24
[{ hour, requests, avgResponseTime }]

// GET /api/dashboard/http-status
[{ statusCode, count, percentage }]

// GET /api/dashboard/top-posts?limit=5
[{ id, title, views, likes, author, boardType }]

// GET /api/dashboard/error-endpoints?limit=5
[{ endpoint, errorCount, lastError }]

// GET /api/dashboard/recent-activity?limit=10
[{ type, user, action, target, timestamp }]
```

---

이 통합 대시보드 구현을 진행할까요?

### 👤 사용자 (오전 8:38:01)

계획대로 진행하라. 

### 👤 사용자 (오전 8:38:12)



### 🤖 Claude (오전 8:38:17)

먼저 기존 백엔드 구조를 확인하겠습니다.

### 👤 사용자 (오전 8:38:18)



### 👤 사용자 (오전 8:38:23)



### 👤 사용자 (오전 8:38:33)



### 👤 사용자 (오전 8:38:44)



### 👤 사용자 (오전 8:38:44)



### 👤 사용자 (오전 8:38:54)



### 🤖 Claude (오전 8:39:01)

이제 백엔드 대시보드 API를 생성하겠습니다.

### 👤 사용자 (오전 8:40:33)



### 🤖 Claude (오전 8:40:47)

server.js에 대시보드 라우트를 등록합니다.

### 👤 사용자 (오전 8:40:52)



### 👤 사용자 (오전 8:41:03)



### 👤 사용자 (오전 8:41:20)



### 👤 사용자 (오전 8:41:31)



### 👤 사용자 (오전 8:41:40)



### 🤖 Claude (오전 8:41:45)

이제 대시보드 타입과 컴포넌트들을 생성하겠습니다.

### 👤 사용자 (오전 8:42:01)



### 👤 사용자 (오전 8:42:45)



### 👤 사용자 (오전 8:43:25)



### 👤 사용자 (오전 8:43:58)



### 👤 사용자 (오전 8:44:13)



### 👤 사용자 (오전 8:44:51)



### 👤 사용자 (오전 8:45:18)



### 👤 사용자 (오전 8:45:44)



### 👤 사용자 (오전 8:46:07)



### 👤 사용자 (오전 8:46:29)



### 👤 사용자 (오전 8:47:00)



### 👤 사용자 (오전 8:47:26)



### 👤 사용자 (오전 8:48:00)



### 👤 사용자 (오전 8:48:33)



### 👤 사용자 (오전 8:49:17)



### 👤 사용자 (오전 8:49:48)



### 👤 사용자 (오전 8:50:02)



### 👤 사용자 (오전 8:50:15)



### 👤 사용자 (오전 8:50:44)



### 👤 사용자 (오전 8:50:58)



### 👤 사용자 (오전 8:51:26)



### 🤖 Claude (오전 8:51:34)

타입 오류를 수정하겠습니다.

### 👤 사용자 (오전 8:51:37)



### 👤 사용자 (오전 8:51:52)



### 👤 사용자 (오전 8:52:14)



### 👤 사용자 (오전 8:52:25)



### 👤 사용자 (오전 8:52:38)



### 👤 사용자 (오전 8:52:55)



### 👤 사용자 (오전 8:53:06)



### 👤 사용자 (오전 8:53:26)



### 👤 사용자 (오전 8:53:38)



### 👤 사용자 (오전 8:53:59)



### 👤 사용자 (오전 8:54:08)



### 🤖 Claude (오전 8:54:27)

## 통합 관리자 대시보드 구현 완료

### 생성된 파일 구조

```
backend/routes/
└── dashboard.js                    # 대시보드 API (9개 엔드포인트)

src/app/[locale]/dashboard/
├── page.tsx                        # 메인 대시보드 페이지 (업데이트)
├── types.ts                        # TypeScript 타입 정의
├── hooks/
│   └── useDashboardData.ts         # 데이터 fetching 훅
└── components/
    ├── index.ts                    # 컴포넌트 export
    ├── KPICards.tsx                # 6개 KPI 카드
    ├── ActivityTrendChart.tsx      # 활동 추이 라인차트
    ├── UserStatusChart.tsx         # 사용자 상태 도넛차트
    ├── DepartmentChart.tsx         # 부서별 인원 바차트
    ├── BoardActivityChart.tsx      # 게시판별 활동 바차트
    ├── SystemPerformanceChart.tsx  # API 성능 에어리어차트
    ├── HttpStatusChart.tsx         # HTTP 상태 분포
    ├── TopPostsTable.tsx           # 인기 게시글 테이블
    ├── ErrorEndpointsTable.tsx     # 에러 엔드포인트 테이블
    ├── RecentActivityFeed.tsx      # 최근 활동 피드
    └── QuickActions.tsx            # 빠른 작업 카드
```

### 백엔드 API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/dashboard/summary` | 핵심 KPI 요약 |
| `GET /api/dashboard/activity-trend` | 활동 추이 (7/30일) |
| `GET /api/dashboard/user-status` | 사용자 상태 분포 |
| `GET /api/dashboard/department-stats` | 부서별 인원 |
| `GET /api/dashboard/board-activity` | 게시판별 활동 |
| `GET /api/dashboard/system-performance` | 시스템 성능 (24h) |
| `GET /api/dashboard/http-status` | HTTP 상태 분포 |
| `GET /api/dashboard/top-posts` | 인기 게시글 Top 5 |
| `GET /api/dashboard/error-endpoints` | 에러 엔드포인트 Top 5 |
| `GET /api/dashboard/recent-activity` | 최근 활동 피드 |

### 대시보드 기능

1. **기간 선택**: 오늘 / 7일 / 30일
2. **새로고침 버튼**: 실시간 데이터 갱신
3. **KPI 카드 6개**: 총사용자, 활성사용자, 총게시글, 총댓글, 오늘조회, 에러율
4. **차트 시각화**: Recharts 라이브러리 활용
5. **반응형 레이아웃**: Grid 시스템 적용
6. **로딩 상태**: Skeleton 컴포넌트
7. **빠른 작업**: 관리자 메뉴 바로가기

### 접속 URL

```
http://localhost:3000/ko/dashboard
```

백엔드 서버를 먼저 실행해야 합니다 (`npm run dev:backend`).

### 👤 사용자 (오전 9:42:46)

Console AxiosError


Request failed with status code 500
src/app/[locale]/dashboard/hooks/useDashboardData.ts (86:11) @ async useDashboardData.useCallback[fetchDashboardData]


  84 |         errorsRes,
  85 |         activityFeedRes
> 86 |       ] = await Promise.all([
     |           ^
  87 |         api.get('/dashboard/summary'),
  88 |         api.get(`/dashboard/activity-trend?days=${days}`),
  89 |         api.get('/dashboard/user-status'),
Call Stack
4

Show 3 ignore-listed frame(s)
async useDashboardData.useCallback[fetchDashboardData]
src/app/[locale]/dashboard/hooks/useDashboardData.ts (86:11)

### 🤖 Claude (오전 9:42:53)

백엔드 API에서 오류가 발생하고 있습니다. 확인해보겠습니다.

### 👤 사용자 (오전 9:42:58)



### 👤 사용자 (오전 9:43:07)



### 🤖 Claude (오전 9:43:15)

activity-trend 쿼리에서 SQL 문법 오류가 있을 수 있습니다. 수정하겠습니다.

### 👤 사용자 (오전 9:43:18)



### 🤖 Claude (오전 9:43:28)

`post_views` 테이블 구조를 확인해보겠습니다.

### 👤 사용자 (오전 9:43:42)



### 👤 사용자 (오전 9:43:53)



### 👤 사용자 (오전 9:44:03)



### 👤 사용자 (오전 9:44:15)



### 🤖 Claude (오전 9:44:24)

SQL 쿼리를 안전한 파라미터화 방식으로 수정하겠습니다.

### 👤 사용자 (오전 9:44:35)



### 🤖 Claude (오전 9:44:47)

PostgreSQL 문법을 더 정확하게 수정하겠습니다.

### 👤 사용자 (오전 9:44:56)



### 🤖 Claude (오전 9:45:05)

에러 처리를 개선하여 개별 API 호출이 실패해도 다른 데이터가 표시되도록 수정하겠습니다.

### 👤 사용자 (오전 9:45:22)



### 🤖 Claude (오전 9:45:31)

백엔드 서버를 재시작해야 합니다.

### 👤 사용자 (오전 9:45:37)



### 🤖 Claude (오전 9:45:49)

백엔드 서버를 재시작해야 변경사항이 적용됩니다.

```bash
# 백엔드 서버 재시작
# 현재 실행 중인 백엔드 프로세스를 종료하고 다시 시작하세요:
npm run dev:backend
```

**수정 내용:**

1. **SQL 쿼리 수정** (`backend/routes/dashboard.js`)
   - 문자열 보간을 파라미터화된 쿼리로 변경
   - `($1 || ' days')::interval` 형식 사용

2. **에러 핸들링 개선** (`useDashboardData.ts`)
   - 각 API 호출이 개별적으로 실패해도 다른 데이터는 표시
   - `safeFetch` 헬퍼 함수로 graceful degradation 구현

백엔드 서버를 재시작한 후 대시보드 페이지를 새로고침해 주세요.

### 👤 사용자 (오전 9:49:42)

Console AxiosError


Request failed with status code 500
src/app/[locale]/dashboard/hooks/useDashboardData.ts (79:21) @ async useDashboardData.useCallback[fetchDashboardData].safeFetch


  77 |     ): Promise<T> => {
  78 |       try {
> 79 |         const res = await fetcher();
     |                     ^
  80 |         return res.data;
  81 |       } catch (err) {
  82 |         console.error('Dashboard API error:', err);
Call Stack
5

Show 3 ignore-listed frame(s)
async useDashboardData.useCallback[fetchDashboardData].safeFetch
src/app/[locale]/dashboard/hooks/useDashboardData.ts (79:21)
async useDashboardData.useCallback[fetchDashboardData]
src/app/[locale]/dashboard/hooks/useDashboardData.ts (100:11)

### 🤖 Claude (오전 9:49:48)

백엔드 로그를 직접 확인하겠습니다.

### 👤 사용자 (오전 9:50:50)



### 👤 사용자 (오전 9:51:01)



### 👤 사용자 (오전 9:51:36)



### 👤 사용자 (오전 9:51:55)



### 👤 사용자 (오전 9:52:07)



### 🤖 Claude (오전 9:52:17)

쿼리는 정상입니다. `getLogs` 함수를 확인해보겠습니다.

### 👤 사용자 (오전 9:52:20)



### 👤 사용자 (오전 9:52:32)



### 🤖 Claude (오전 9:52:44)

dashboard.js에 더 상세한 에러 로깅을 추가하겠습니다.

### 👤 사용자 (오전 9:52:49)



### 👤 사용자 (오전 9:52:59)



### 👤 사용자 (오전 9:53:14)



### 🤖 Claude (오전 9:53:23)

**백엔드 서버를 재시작해 주세요.**

SQL 쿼리는 테스트 결과 정상 작동합니다. 백엔드 서버가 이전 코드로 실행 중일 수 있습니다.

```bash
# 백엔드 터미널에서:
# 1. Ctrl+C로 현재 서버 종료
# 2. 다시 시작
npm run dev:backend
```

재시작 후 백엔드 콘솔에서 에러 메시지를 확인해 주세요. 상세한 에러 로깅을 추가했습니다.

### 👤 사용자 (오전 9:56:23)

forward-logs-shared.ts:95 [HMR] connected
index.tsx:71 [NoticePopup] Fetching popup notifications...
installHook.js:1 MUI: You are providing a disabled `button` child to the Tooltip component.
A disabled element does not fire events.
Tooltip needs to listen to the child element's events to display the title.

Add a simple wrapper element, such as a `span`.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
Tooltip.Tooltip.useEffect @ Tooltip.js:382
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
commitPassiveMountOnFiber @ react-dom-client.development.js:16638
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16844
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16803
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
<ForwardRef(Tooltip)>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:88
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
useDashboardData.ts:108  GET http://localhost:3001/api/dashboard/top-posts?limit=5 500 (Internal Server Error)
dispatchXhrRequest @ xhr.js:198
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
Axios.<computed> @ Axios.js:211
wrap @ bind.js:12
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:108
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:79
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:108
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
commitPassiveMountOnFiber @ react-dom-client.development.js:16638
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16844
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16803
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 Dashboard API error: AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
overrideMethod @ installHook.js:1
error @ intercept-console-error.ts:42
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:82
await in useDashboardData.useCallback[fetchDashboardData].safeFetch
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:108
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
commitPassiveMountOnFiber @ react-dom-client.development.js:16638
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16844
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16803
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
index.tsx:73 [NoticePopup] Response: {success: true, data: {…}, error: undefined, message: undefined}
index.tsx:96 [NoticePopup] Found 1 notifications, 0 visible
index.tsx:102 [NoticePopup] All notifications are hidden by user preference
useDashboardData.ts:108  GET http://localhost:3001/api/dashboard/top-posts?limit=5 500 (Internal Server Error)
dispatchXhrRequest @ xhr.js:198
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
Axios.<computed> @ Axios.js:211
wrap @ bind.js:12
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:108
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:79
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:108
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
reconnectPassiveEffects @ react-dom-client.development.js:17029
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
doubleInvokeEffectsOnFiber @ react-dom-client.development.js:20034
runWithFiberInDEV @ react-dom-client.development.js:984
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:19998
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
runWithFiberInDEV @ react-dom-client.development.js:987
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20018
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
commitDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20043
flushPassiveEffects @ react-dom-client.development.js:19770
flushPendingEffects @ react-dom-client.development.js:19689
performSyncWorkOnRoot @ react-dom-client.development.js:20300
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20145
flushSpawnedWork @ react-dom-client.development.js:19656
commitRoot @ react-dom-client.development.js:19239
commitRootWhenReady @ react-dom-client.development.js:18082
performWorkOnRoot @ react-dom-client.development.js:17958
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 Dashboard API error: AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
overrideMethod @ installHook.js:1
error @ intercept-console-error.ts:42
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:82
await in useDashboardData.useCallback[fetchDashboardData].safeFetch
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:108
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
reconnectPassiveEffects @ react-dom-client.development.js:17029
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
doubleInvokeEffectsOnFiber @ react-dom-client.development.js:20034
runWithFiberInDEV @ react-dom-client.development.js:984
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:19998
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
runWithFiberInDEV @ react-dom-client.development.js:987
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20018
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
commitDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20043
flushPassiveEffects @ react-dom-client.development.js:19770
flushPendingEffects @ react-dom-client.development.js:19689
performSyncWorkOnRoot @ react-dom-client.development.js:20300
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20145
flushSpawnedWork @ react-dom-client.development.js:19656
commitRoot @ react-dom-client.development.js:19239
commitRootWhenReady @ react-dom-client.development.js:18082
performWorkOnRoot @ react-dom-client.development.js:17958
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
useDashboardData.ts:110  GET http://localhost:3001/api/dashboard/recent-activity?limit=10 500 (Internal Server Error)
dispatchXhrRequest @ xhr.js:198
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
Axios.<computed> @ Axios.js:211
wrap @ bind.js:12
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:110
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:79
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:110
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
commitPassiveMountOnFiber @ react-dom-client.development.js:16638
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16844
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16803
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 Dashboard API error: AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
overrideMethod @ installHook.js:1
error @ intercept-console-error.ts:42
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:82
await in useDashboardData.useCallback[fetchDashboardData].safeFetch
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:110
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
commitPassiveMountOnFiber @ react-dom-client.development.js:16638
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16844
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16803
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
ActivityTrendChart @ ActivityTrendChart.tsx:51
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ActivityTrendChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:114
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,       please check the style of container, or the props width(100%) and height(100%),       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
ActivityTrendChart @ ActivityTrendChart.tsx:51
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ActivityTrendChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:114
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
UserStatusChart @ UserStatusChart.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<UserStatusChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:117
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,       please check the style of container, or the props width(100%) and height(100%),       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
UserStatusChart @ UserStatusChart.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<UserStatusChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:117
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DepartmentChart @ DepartmentChart.tsx:34
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DepartmentChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:124
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,       please check the style of container, or the props width(100%) and height(100%),       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DepartmentChart @ DepartmentChart.tsx:34
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DepartmentChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:124
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
BoardActivityChart @ BoardActivityChart.tsx:34
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BoardActivityChart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
DashboardPage @ page.tsx:127
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,       please check the style of container, or the props width(100%) and height(100%),       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
BoardActivityChart @ BoardActivityChart.tsx:34
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
SystemPerformanceChart @ SystemPerformanceChart.tsx:68
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
installHook.js:1 The width(-1) and height(-1) of chart should be greater than 0,       please check the style of container, or the props width(100%) and height(100%),       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the       height and width.
overrideMethod @ installHook.js:1
overrideMethod @ forward-logs-shared.ts:95
warn @ LogUtils.js:16
(anonymous) @ ResponsiveContainer.js:131
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.createElement @ react.development.js:1137
(anonymous) @ ResponsiveContainer.js:213
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateForwardRef @ react-dom-client.development.js:10038
beginWork @ react-dom-client.development.js:12431
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
SystemPerformanceChart @ SystemPerformanceChart.tsx:68
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
useDashboardData.ts:110  GET http://localhost:3001/api/dashboard/recent-activity?limit=10 500 (Internal Server Error)
dispatchXhrRequest @ xhr.js:198
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
Axios.<computed> @ Axios.js:211
wrap @ bind.js:12
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:110
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:79
useDashboardData.useCallback[fetchDashboardData] @ useDashboardData.ts:110
useDashboardData.useEffect @ useDashboardData.ts:137
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
reconnectPassiveEffects @ react-dom-client.development.js:17029
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17082
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
recursivelyTraverseReconnectPassiveEffects @ react-dom-client.development.js:16981
reconnectPassiveEffects @ react-dom-client.development.js:17021
doubleInvokeEffectsOnFiber @ react-dom-client.development.js:20034
runWithFiberInDEV @ react-dom-client.development.js:984
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:19998
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
runWithFiberInDEV @ react-dom-client.development.js:987
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20018
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20004
commitDoubleInvokeEffectsInDEV @ react-dom-client.development.js:20043
flushPassiveEffects @ react-dom-client.development.js:19770
flushPendingEffects @ react-dom-client.development.js:19689
performSyncWorkOnRoot @ react-dom-client.development.js:20300
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20145
flushSpawnedWork @ react-dom-client.development.js:19656
commitRoot @ react-dom-client.development.js:19239
commitRootWhenReady @ react-dom-client.development.js:18082
performWorkOnRoot @ react-dom-client.development.js:17958
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
Function.all @ VM1707 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1887
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2713
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4562
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4965
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
installHook.js:1 Dashboard API error: AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
overrideMethod @ installHook.js:1
error @ intercept-console-error.ts:42
useDashboardData.useCallback[fetchDashboardData].safeFetch @ useDashboardData.ts:82



### 🤖 Claude (오전 9:56:27)

Prompt is too long

