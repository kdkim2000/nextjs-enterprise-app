# Theme 사용 가이드

## 개요
이 프로젝트는 MUI Theme 시스템을 통해 디자인 일관성을 유지합니다.
불필요한 컴포넌트 래핑 대신, Theme으로 스타일을 표준화합니다.

---

## Theme 구조

```
src/theme/
├── index.ts          # 메인 theme export
├── palette.ts        # 색상 정의 (light/dark)
├── typography.ts     # 폰트, 크기, 굵기
└── components.ts     # MUI 컴포넌트 overrides
```

---

## 1. 기본 사용법

### MUI 컴포넌트 직접 사용
```typescript
import { Button, TextField, Card } from '@mui/material';

// ✅ Theme이 자동 적용됨
<Button variant="contained">클릭</Button>
<TextField label="이름" />
<Card>콘텐츠</Card>
```

### Theme 색상 사용
```typescript
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box sx={{
      color: theme.palette.primary.main,
      bgcolor: theme.palette.background.paper
    }}>
      콘텐츠
    </Box>
  );
}
```

---

## 2. 커스텀 색상 사용

### Status 색상
```typescript
import { useTheme } from '@mui/material';

const theme = useTheme();

// ✅ Status 색상 사용
<Chip
  label="Active"
  sx={{ bgcolor: theme.palette.status.active }}
/>

<Chip
  label="Pending"
  sx={{ bgcolor: theme.palette.status.pending }}
/>
```

### Role 색상
```typescript
// ✅ Role 색상 사용
<Badge
  sx={{ bgcolor: theme.palette.role.admin }}
>
  Admin
</Badge>

<Avatar
  sx={{ bgcolor: theme.palette.role.user }}
>
  U
</Avatar>
```

---

## 3. Typography 사용

### Heading
```typescript
<Typography variant="h1">가장 큰 제목</Typography>
<Typography variant="h2">큰 제목</Typography>
<Typography variant="h3">중간 제목</Typography>
<Typography variant="h4">작은 제목</Typography>
```

### Body
```typescript
<Typography variant="body1">기본 본문 (16px)</Typography>
<Typography variant="body2">작은 본문 (14px)</Typography>
```

### Button Text
```typescript
<Typography variant="button">버튼 텍스트</Typography>
```

---

## 4. Spacing 사용

Theme의 spacing은 8px 기준입니다.

```typescript
// ✅ Theme spacing 사용
<Box sx={{
  p: 2,      // padding: 16px (8 * 2)
  mt: 3,     // margin-top: 24px (8 * 3)
  gap: 1,    // gap: 8px (8 * 1)
}}>
  콘텐츠
</Box>
```

---

## 5. Component Overrides 활용

### Button (자동 적용)
```typescript
// ❌ Before: 커스텀 래핑
import Button from '@/components/common/Button';

// ✅ After: MUI 직접 사용 (Theme 자동 적용)
import { Button } from '@mui/material';

<Button variant="contained">
  자동으로 borderRadius: 8, textTransform: none 적용
</Button>
```

### Card (자동 적용)
```typescript
import { Card } from '@mui/material';

<Card>
  {/* 자동으로 borderRadius: 12, boxShadow 적용 */}
</Card>
```

### TextField (자동 적용)
```typescript
import { TextField } from '@mui/material';

<TextField label="이름" />
{/* 자동으로 size="small", borderRadius: 8 적용 */}
```

---

## 6. 실전 예시

### Before: 불필요한 래핑
```typescript
// ❌ Bad
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';

function MyForm() {
  return (
    <Card>
      <Input label="이름" />
      <Button>저장</Button>
    </Card>
  );
}
```

### After: Theme 기반
```typescript
// ✅ Good
import { Card, TextField, Button, Box } from '@mui/material';

function MyForm() {
  return (
    <Card>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="이름" />
        <Button variant="contained">저장</Button>
      </Box>
    </Card>
  );
}
```

---

## 7. Status Indicator 패턴

### Before: Status 컴포넌트
```typescript
// ❌ 제거할 컴포넌트
import Status from '@/components/common/Status';
<Status type="active" />
```

### After: Theme + Chip
```typescript
// ✅ Theme 기반
import { Chip } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material';

function StatusChip({ type }: { type: 'active' | 'inactive' | 'pending' }) {
  const theme = useTheme();

  const config = {
    active: { label: 'Active', color: theme.palette.status.active, icon: <CheckCircle /> },
    inactive: { label: 'Inactive', color: theme.palette.status.inactive },
    pending: { label: 'Pending', color: theme.palette.status.pending },
  };

  const { label, color, icon } = config[type];

  return (
    <Chip
      label={label}
      icon={icon}
      size="small"
      sx={{ bgcolor: color, color: 'white' }}
    />
  );
}
```

---

## 8. Role Badge 패턴

### Before: RoleBadge 컴포넌트
```typescript
// ✅ 유지 (비즈니스 로직 포함)
import RoleBadge from '@/components/common/RoleBadge';
<RoleBadge role="admin" />
```

### RoleBadge 내부에서 Theme 사용
```typescript
// src/components/common/RoleBadge/index.tsx
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material';

export default function RoleBadge({ role }: { role: string }) {
  const theme = useTheme();

  return (
    <Chip
      label={role}
      size="small"
      sx={{ bgcolor: theme.palette.role[role] }}
    />
  );
}
```

---

## 9. DataGrid 스타일링

```typescript
import { DataGrid } from '@mui/x-data-grid';

<DataGrid
  rows={rows}
  columns={columns}
  // Theme에서 자동으로 스타일 적용:
  // - borderRadius: 12
  // - header backgroundColor
  // - cell borderColor
/>
```

---

## 10. Dark Mode 지원

```typescript
// Provider 레벨에서 theme 전환
import { ThemeProvider } from '@mui/material';
import { lightTheme, darkTheme } from '@/theme';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

---

## 11. 새 컴포넌트 개발 시 체크리스트

### MUI 직접 사용 vs 공통 컴포넌트

**MUI 직접 사용하는 경우:**
- [ ] 단순 UI 렌더링만 필요
- [ ] Theme으로 스타일 해결 가능
- [ ] 비즈니스 로직 없음
- [ ] 3회 미만 재사용

**공통 컴포넌트 만드는 경우:**
- [ ] 비즈니스 로직 포함 (권한, API 호출 등)
- [ ] 여러 MUI 컴포넌트의 복잡한 조합
- [ ] 3회 이상 재사용
- [ ] 프로젝트 특화 기능

---

## 12. 마이그레이션 가이드

### Step 1: Import 변경
```typescript
// Before
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

// After
import { Button, Card } from '@mui/material';
```

### Step 2: Props 확인
```typescript
// MUI props 그대로 사용
<Button
  variant="contained"
  color="primary"
  size="large"
  startIcon={<AddIcon />}
>
  추가
</Button>
```

### Step 3: 커스텀 스타일은 sx prop
```typescript
<Button
  variant="contained"
  sx={{
    borderRadius: 2,  // 16px
    fontWeight: 600
  }}
>
  커스텀 버튼
</Button>
```

---

## 13. 자주 묻는 질문

### Q1: Theme을 컴포넌트에서 어떻게 사용하나요?
```typescript
import { useTheme } from '@mui/material';

const theme = useTheme();
console.log(theme.palette.primary.main);
```

### Q2: 커스텀 색상을 추가하려면?
`src/theme/palette.ts`에 추가하세요.

### Q3: 모든 Button에 기본 스타일을 적용하려면?
`src/theme/components.ts`의 `MuiButton` 섹션을 수정하세요.

### Q4: 기존 Status 컴포넌트는 제거하나요?
네, `theme.palette.status` 색상 + MUI Chip으로 대체합니다.

---

## 14. 권장 사항

1. **MUI 우선**: 가능하면 MUI 컴포넌트를 직접 사용
2. **Theme 확장**: 프로젝트 특화 스타일은 Theme에 추가
3. **의미있는 추상화**: 비즈니스 로직이 있을 때만 공통 컴포넌트 생성
4. **일관성**: 모든 개발자가 동일한 Theme 사용

---

## 참고 자료
- [MUI Theme 문서](https://mui.com/material-ui/customization/theming/)
- [MUI Component API](https://mui.com/material-ui/api/button/)
- [프로젝트 컴포넌트 전략](./COMPONENT_STRATEGY.md)
