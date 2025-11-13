# 공통 컴포넌트 전략 및 디자인 원칙

## 1. 현황 분석

### 문제점
현재 52개의 공통 컴포넌트 중 상당수가 MUI 컴포넌트를 단순히 래핑만 하고 있어, 불필요한 추상화 레이어를 만들고 있습니다.

**단순 래핑의 문제점:**
- 개발자가 두 개의 API를 학습해야 함 (MUI + 커스텀)
- 유지보수 부담 증가
- MUI 업데이트 시 호환성 문제
- 불필요한 코드 복잡도

## 2. 공통 컴포넌트가 필요한 경우

### ✅ 유지해야 할 컴포넌트

#### A. 비즈니스 로직 캡슐화 (11개)
프로젝트 특화 로직이 포함된 컴포넌트
```
✓ DataGrid           - 권한 기반 액션, 로깅, 상태 관리
✓ FileUpload         - 파일 검증, 업로드 로직, 진행률
✓ UserSelector       - 사용자 검색, 필터링, API 연동
✓ PermissionGuard    - 권한 체크, fallback 처리
✓ PageHeader         - 메뉴 연동, breadcrumb, 즐겨찾기
✓ RoleBadge          - 역할별 색상, 아이콘 매핑
✓ Status             - 상태별 색상, 아이콘, 로직
✓ ActionsCell        - 권한 기반 액션 버튼
✓ AutoLogoutWarning  - 세션 관리, 타이머
✓ ErrorBoundary      - 에러 로깅, 복구 로직
✓ HelpViewer         - API 연동, markdown 렌더링
```

#### B. 복잡한 컴포넌트 조합 (12개)
여러 MUI 컴포넌트를 조합하여 특정 패턴 구현
```
✓ CrudDialog              - Form + Dialog + Validation
✓ SearchFilterPanel       - Accordion + Form + Chips
✓ AdvancedSearchDialog    - Dialog + Multiple Filters
✓ UserSearchDialog        - Dialog + Search + Table
✓ DeleteConfirmDialog     - Dialog + Confirmation Pattern
✓ DateRangePicker         - Two DatePickers + Logic
✓ DateTimeRangePicker     - DateTime + Range Logic
✓ SearchFilterFields      - Dynamic Field Generation
✓ QuickSearchBar          - Search + Autocomplete + Recent
✓ RichTextEditor          - TipTap + Toolbar + Extensions
✓ MultiSelect             - Select + Chips + Search
✓ Notification            - Badge + Menu + List + Actions
```

#### C. 레이아웃 & 네비게이션 (5개)
일관된 페이지 구조 제공
```
✓ PageContainer      - 일관된 padding, spacing, layout
✓ EmptyState         - 표준 empty state 패턴
✓ NotFoundPage       - 404 페이지 표준
✓ ComingSoonPage     - 준비중 페이지 표준
✓ Footer             - 앱 전체 푸터
```

#### D. Date/Time Pickers (6개)
dayjs 통합 및 일관된 format
```
✓ DatePicker         - dayjs 통합, format 표준화
✓ TimePicker         - 시간 선택 표준화
✓ DateTimePicker     - 날짜+시간 조합
✓ YearPicker         - 연도 선택 특화
✓ MonthPicker        - 월 선택 특화
✓ DateRangePicker    - 범위 선택 로직
```

**총 34개 유지 필요**

---

### ❌ 제거 가능한 컴포넌트

MUI를 직접 사용하는 것이 더 나은 컴포넌트 (18개)

#### 단순 래핑 컴포넌트
```
✗ Tooltip       → MUI Tooltip 직접 사용
✗ Progress      → MUI LinearProgress/CircularProgress 직접 사용
✗ Badge         → MUI Badge/Chip 직접 사용
✗ Alert         → MUI Alert 직접 사용
✗ Card          → MUI Card 직접 사용
✗ Switch        → MUI Switch 직접 사용
✗ Modal         → MUI Modal/Dialog 직접 사용
✗ Confirmation  → MUI Dialog 직접 사용
✗ Tab           → MUI Tabs 직접 사용
✗ Table         → MUI Table 또는 DataGrid 사용
✗ Accordion     → MUI Accordion 직접 사용
✗ Stepper       → MUI Stepper 직접 사용
✗ Menu          → MUI Menu 직접 사용
✗ Breadcrumb    → MUI Breadcrumbs 직접 사용
✗ Input         → MUI TextField 직접 사용
✗ Select        → MUI Select 직접 사용
✗ Checkbox      → MUI Checkbox/Radio 직접 사용
✗ Loading       → MUI CircularProgress/Skeleton 직접 사용
```

**이유:**
- MUI 컴포넌트가 이미 충분히 커스터마이징 가능
- prop drilling만 하고 있음
- MUI의 풍부한 문서와 커뮤니티 활용 불가

---

## 3. 디자인 시스템 접근

### MUI Theme 기반 표준화
공통 컴포넌트를 줄이고, **MUI Theme**으로 일관성 확보

```typescript
// theme/index.ts
import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    status: {
      active: '#4caf50',
      inactive: '#9e9e9e',
      pending: '#ff9800',
      error: '#f44336',
    },
    role: {
      admin: '#f44336',
      manager: '#ff9800',
      user: '#2196f3',
      guest: '#9e9e9e',
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
  },

  spacing: 8, // 8px base unit

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },

    // DataGrid 스타일
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderColor: '#f0f0f0',
          },
        },
      },
    },
  },
});
```

---

## 4. 구체적 개선 방안

### Phase 1: Theme 적용 (우선)
```bash
1. src/theme/ 디렉토리 생성
2. 통합 theme 정의
3. 앱 전체에 ThemeProvider 적용
4. 기존 컴포넌트들 theme 기반으로 마이그레이션
```

### Phase 2: 단순 래핑 컴포넌트 제거
```bash
1. 18개 단순 래핑 컴포넌트 사용처 파악
2. MUI 직접 사용으로 변경
3. 컴포넌트 디렉토리 삭제
4. componentData.ts 업데이트
```

### Phase 3: 핵심 컴포넌트 강화
```bash
1. 34개 핵심 컴포넌트에 디자인 시스템 적용
2. Storybook 추가 (컴포넌트 문서화)
3. 단위 테스트 추가
4. 접근성(a11y) 개선
```

---

## 5. 새로운 컴포넌트 가이드라인

### 공통 컴포넌트를 만들어야 하는 경우
- [ ] 3번 이상 재사용되는 패턴인가?
- [ ] 비즈니스 로직이 포함되어 있는가?
- [ ] 여러 MUI 컴포넌트의 복잡한 조합인가?
- [ ] 프로젝트 특화 기능이 있는가?
- [ ] MUI Theme만으로는 표준화가 어려운가?

**위 질문 중 2개 이상 Yes → 공통 컴포넌트 생성**

### MUI를 직접 사용해야 하는 경우
- [ ] 단순히 MUI 컴포넌트를 래핑만 하는가?
- [ ] MUI의 props를 그대로 전달하는가?
- [ ] 추가 로직이 거의 없는가?
- [ ] Theme으로 해결 가능한가?

**위 질문 중 2개 이상 Yes → MUI 직접 사용**

---

## 6. 코드 예시

### ❌ Before: 불필요한 래핑
```typescript
// src/components/common/Button/index.tsx
export default function Button({ children, ...props }: ButtonProps) {
  return <MuiButton {...props}>{children}</MuiButton>;
}

// 사용
import Button from '@/components/common/Button';
<Button variant="contained">Click</Button>
```

### ✅ After: MUI 직접 사용 + Theme
```typescript
// 사용
import { Button } from '@mui/material';
<Button variant="contained">Click</Button>

// Theme에서 스타일 제어
MuiButton: {
  defaultProps: { disableElevation: true },
  styleOverrides: { root: { textTransform: 'none' } }
}
```

### ✅ 올바른 공통 컴포넌트 예시
```typescript
// src/components/common/ActionsCell/index.tsx
export default function ActionsCell({
  onEdit,
  onDelete,
  permissions
}: ActionsCellProps) {
  const { hasPermission } = usePermissions();

  return (
    <Box>
      {hasPermission(permissions.edit) && (
        <IconButton onClick={onEdit}>
          <Edit />
        </IconButton>
      )}
      {hasPermission(permissions.delete) && (
        <IconButton onClick={onDelete}>
          <Delete />
        </IconButton>
      )}
    </Box>
  );
}
```

---

## 7. 마이그레이션 체크리스트

### 단계별 작업
- [ ] **Week 1**: Theme 시스템 구축
  - [ ] src/theme/ 디렉토리 생성
  - [ ] palette, typography, spacing 정의
  - [ ] component overrides 정의
  - [ ] ThemeProvider 적용

- [ ] **Week 2**: 단순 컴포넌트 제거 (1-6)
  - [ ] Tooltip, Progress, Badge, Alert 제거
  - [ ] Card, Switch 제거

- [ ] **Week 3**: 단순 컴포넌트 제거 (7-12)
  - [ ] Modal, Confirmation, Tab 제거
  - [ ] Table, Accordion, Stepper 제거

- [ ] **Week 4**: 단순 컴포넌트 제거 (13-18)
  - [ ] Menu, Breadcrumb, Input 제거
  - [ ] Select, Checkbox, Loading 제거

- [ ] **Week 5-6**: 핵심 컴포넌트 개선
  - [ ] 34개 핵심 컴포넌트에 Theme 적용
  - [ ] 일관된 스타일 가이드 적용
  - [ ] Storybook 추가

---

## 8. 결론

### 핵심 원칙
1. **MUI 우선**: MUI가 제공하는 것은 직접 사용
2. **Theme 기반**: 스타일 일관성은 Theme으로 해결
3. **의미있는 추상화**: 비즈니스 로직이나 복잡한 조합만 컴포넌트화
4. **재사용성 검증**: 3회 이상 사용되는 패턴만 컴포넌트화

### 기대 효과
- 컴포넌트 수: 52개 → 34개 (35% 감소)
- 코드 유지보수성 향상
- MUI 생태계 활용 극대화
- 학습 곡선 감소
- 일관된 디자인 시스템 구축
