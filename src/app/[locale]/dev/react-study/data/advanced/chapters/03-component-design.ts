/**
 * Chapter 3: 컴포넌트 설계 원칙
 */

import { Chapter } from '../../types';

const chapter: Chapter = {
  id: 'component-design',
  order: 3,
  title: 'Component Design Principles',
  titleKo: '컴포넌트 설계 원칙',
  description: 'Learn advanced component patterns for building scalable and reusable React components.',
  descriptionKo: '확장 가능하고 재사용 가능한 React 컴포넌트를 위한 고급 설계 패턴을 학습합니다.',
  estimatedMinutes: 90,
  objectives: [
    'Master composition patterns',
    'Implement Render Props and Children patterns',
    'Build compound components',
    'Understand HOC (Higher-Order Component)',
    'Apply Headless UI pattern'
  ],
  objectivesKo: [
    '합성(Composition) 패턴을 마스터한다',
    'Render Props와 Children 패턴을 구현한다',
    '컴파운드 컴포넌트를 만든다',
    'HOC(Higher-Order Component)를 이해한다',
    'Headless UI 패턴을 적용한다'
  ],
  sections: [
    {
      id: 'composition-pattern',
      title: 'Composition Pattern',
      titleKo: '합성(Composition) 패턴',
      content: `
## 합성(Composition)이란?

**합성**은 작은 컴포넌트를 조합하여 더 큰 컴포넌트를 만드는 패턴입니다.
상속(Inheritance)보다 **유연하고 명시적**입니다.

### 왜 상속 대신 합성인가?

| 상속 | 합성 |
|------|------|
| is-a 관계 | has-a 관계 |
| 강한 결합 | 느슨한 결합 |
| 부모 변경 시 영향 | 독립적 변경 |
| 숨겨진 동작 | 명시적 동작 |

### 기본 합성 패턴

\`\`\`tsx
// ❌ 상속 스타일 (React에서 권장하지 않음)
class WelcomeDialog extends Dialog {
  render() {
    return super.render(); // 부모에 의존
  }
}

// ✅ 합성 스타일
function WelcomeDialog() {
  return (
    <Dialog>
      <Dialog.Header>환영합니다</Dialog.Header>
      <Dialog.Content>
        <p>서비스에 가입해 주셔서 감사합니다.</p>
      </Dialog.Content>
      <Dialog.Actions>
        <Button>확인</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
\`\`\`

### 합성의 장점

1. **재사용성**: 같은 컴포넌트를 다양한 방식으로 조합
2. **테스트 용이성**: 각 부분을 독립적으로 테스트
3. **유연성**: 런타임에 동적으로 구성 변경 가능
4. **명시성**: 컴포넌트 구조가 JSX에 드러남
      `,
      codeExamples: [
        {
          id: 'card-composition',
          title: 'Card 컴포넌트 합성',
          description: '유연한 카드 레이아웃',
          language: 'tsx',
          code: `// 합성을 활용한 Card 컴포넌트

// 기본 컴포넌트들
function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={\`card \${className}\`}>{children}</div>;
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
}

function CardContent({ children }: { children: ReactNode }) {
  return <div className="card-content">{children}</div>;
}

function CardFooter({ children }: { children: ReactNode }) {
  return <div className="card-footer">{children}</div>;
}

// 사용: 다양한 조합 가능
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <Avatar src={user.avatar} />
        <h3>{user.name}</h3>
      </CardHeader>
      <CardContent>
        <p>{user.bio}</p>
      </CardContent>
      <CardFooter>
        <Button>팔로우</Button>
        <Button variant="text">메시지</Button>
      </CardFooter>
    </Card>
  );
}

// 다른 조합: Footer 없는 카드
function SimpleCard({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// 또 다른 조합: Header 없는 카드
function ContentCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardContent>{children}</CardContent>
    </Card>
  );
}`
        },
        {
          id: 'layout-composition',
          title: '레이아웃 합성',
          description: 'AdminPageLayout 패턴',
          fileName: 'src/components/layout/AdminPageLayout.tsx',
          language: 'tsx',
          code: `// 레이아웃 컴포넌트 합성 패턴

interface AdminPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;  // 상단 액션 버튼 영역
  sidebar?: ReactNode;  // 사이드바 콘텐츠
}

function AdminPageLayout({
  children,
  title,
  subtitle,
  actions,
  sidebar
}: AdminPageLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 페이지 헤더 */}
      <PageHeader title={title} subtitle={subtitle}>
        {actions}
      </PageHeader>

      {/* 메인 콘텐츠 영역 */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 사이드바 (있으면 표시) */}
        {sidebar && (
          <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider' }}>
            {sidebar}
          </Box>
        )}

        {/* 메인 콘텐츠 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

// 사용 예시
function UsersPage() {
  return (
    <AdminPageLayout
      title="사용자 관리"
      subtitle="시스템 사용자를 관리합니다"
      actions={
        <>
          <Button onClick={handleExport}>내보내기</Button>
          <Button variant="contained" onClick={handleAdd}>
            사용자 추가
          </Button>
        </>
      }
      sidebar={
        <UserFilters
          filters={filters}
          onChange={setFilters}
        />
      }
    >
      <DataGrid rows={users} columns={columns} />
    </AdminPageLayout>
  );
}`
        }
      ],
      tips: [
        '✅ props로 컴포넌트를 전달받아 유연한 합성을 구현하세요.',
        '✅ children은 가장 기본적인 합성 메커니즘입니다.',
        'ℹ️ 상속보다 합성을 선호하는 것은 React의 핵심 철학입니다.'
      ]
    },
    {
      id: 'render-props-children',
      title: 'Render Props & Children',
      titleKo: 'Render Props와 Children 패턴',
      content: `
## Render Props 패턴

**Render Props**는 함수를 prop으로 전달하여 렌더링 로직을 공유하는 패턴입니다.

### 기본 구조

\`\`\`tsx
// Render Prop 컴포넌트
function DataFetcher<T>({
  url,
  render
}: {
  url: string;
  render: (data: T | null, loading: boolean) => ReactNode;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return <>{render(data, loading)}</>;
}

// 사용
<DataFetcher<User[]>
  url="/api/users"
  render={(users, loading) => (
    loading ? <Spinner /> : <UserList users={users!} />
  )}
/>
\`\`\`

### Children as Function

\`\`\`tsx
// children을 함수로 사용
function DataFetcher<T>({
  url,
  children
}: {
  url: string;
  children: (data: T | null, loading: boolean) => ReactNode;
}) {
  // ... 동일한 로직

  return <>{children(data, loading)}</>;
}

// 사용 (더 자연스러운 문법)
<DataFetcher<User[]> url="/api/users">
  {(users, loading) => (
    loading ? <Spinner /> : <UserList users={users!} />
  )}
</DataFetcher>
\`\`\`
      `,
      codeExamples: [
        {
          id: 'toggle-render-prop',
          title: 'Toggle Render Prop',
          description: '상태 로직 공유',
          language: 'tsx',
          code: `// Toggle 상태 로직을 render prop으로 공유
interface ToggleRenderProps {
  on: boolean;
  toggle: () => void;
  setOn: (on: boolean) => void;
}

function Toggle({
  initialOn = false,
  children
}: {
  initialOn?: boolean;
  children: (props: ToggleRenderProps) => ReactNode;
}) {
  const [on, setOn] = useState(initialOn);
  const toggle = useCallback(() => setOn(prev => !prev), []);

  return <>{children({ on, toggle, setOn })}</>;
}

// 사용 예시 1: 간단한 토글 버튼
<Toggle>
  {({ on, toggle }) => (
    <Button onClick={toggle}>
      {on ? '켜짐' : '꺼짐'}
    </Button>
  )}
</Toggle>

// 사용 예시 2: 모달 제어
<Toggle>
  {({ on, toggle }) => (
    <>
      <Button onClick={toggle}>모달 열기</Button>
      <Modal open={on} onClose={toggle}>
        <ModalContent />
      </Modal>
    </>
  )}
</Toggle>

// 사용 예시 3: 아코디언
<Toggle>
  {({ on, toggle }) => (
    <Accordion expanded={on}>
      <AccordionSummary onClick={toggle}>
        섹션 제목
      </AccordionSummary>
      <AccordionDetails>
        섹션 내용
      </AccordionDetails>
    </Accordion>
  )}
</Toggle>`
        },
        {
          id: 'mouse-tracker',
          title: '마우스 위치 추적',
          description: 'Render Prop으로 마우스 위치 공유',
          language: 'tsx',
          code: `// 마우스 위치를 추적하여 공유
interface MousePosition {
  x: number;
  y: number;
}

function MouseTracker({
  children
}: {
  children: (position: MousePosition) => ReactNode;
}) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{children(position)}</>;
}

// 사용 예시 1: 마우스 따라다니는 요소
<MouseTracker>
  {({ x, y }) => (
    <div
      style={{
        position: 'fixed',
        left: x + 10,
        top: y + 10,
        pointerEvents: 'none',
      }}
    >
      <Tooltip>현재 위치: ({x}, {y})</Tooltip>
    </div>
  )}
</MouseTracker>

// 사용 예시 2: 캔버스에 그리기
<MouseTracker>
  {(position) => (
    <Canvas>
      <Circle x={position.x} y={position.y} radius={20} />
    </Canvas>
  )}
</MouseTracker>

// 사용 예시 3: 디버그 정보 표시
<MouseTracker>
  {({ x, y }) => (
    <DebugPanel>
      <code>Mouse: {JSON.stringify({ x, y })}</code>
    </DebugPanel>
  )}
</MouseTracker>`
        },
        {
          id: 'form-field-pattern',
          title: 'Form Field Render Prop',
          description: '폼 필드 검증 로직 공유',
          language: 'tsx',
          code: `// 폼 필드 검증 로직을 render prop으로 공유
interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

interface FormFieldProps {
  name: string;
  validate?: (value: string) => string | null;
  children: (state: FieldState) => ReactNode;
}

function FormField({ name, validate, children }: FormFieldProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const onChange = (newValue: string) => {
    setValue(newValue);
    if (touched && validate) {
      setError(validate(newValue));
    }
  };

  const onBlur = () => {
    setTouched(true);
    if (validate) {
      setError(validate(value));
    }
  };

  return <>{children({ value, error, touched, onChange, onBlur })}</>;
}

// 사용: 다양한 UI로 동일한 검증 로직 적용
<FormField
  name="email"
  validate={(v) => !v.includes('@') ? '유효한 이메일을 입력하세요' : null}
>
  {({ value, error, touched, onChange, onBlur }) => (
    <TextField
      label="이메일"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={touched && !!error}
      helperText={touched && error}
    />
  )}
</FormField>`
        }
      ],
      tips: [
        '✅ Render Props는 로직을 공유하면서 UI를 자유롭게 구성할 때 유용합니다.',
        '✅ 현대 React에서는 Custom Hook이 많은 경우를 대체합니다.',
        '⚠️ 중첩이 깊어지면 가독성이 떨어집니다. Hook으로 리팩토링을 고려하세요.'
      ]
    },
    {
      id: 'compound-components',
      title: 'Compound Components',
      titleKo: '컴파운드 컴포넌트 패턴',
      content: `
## 컴파운드 컴포넌트란?

**컴파운드 컴포넌트**는 여러 컴포넌트가 **암묵적으로 상태를 공유**하며 함께 동작하는 패턴입니다.

### HTML의 컴파운드 컴포넌트

\`\`\`html
<!-- select와 option은 암묵적으로 연결됨 -->
<select>
  <option value="a">옵션 A</option>
  <option value="b">옵션 B</option>
</select>
\`\`\`

### React에서의 컴파운드 컴포넌트

\`\`\`tsx
// 부모와 자식이 암묵적으로 상태 공유
<Tabs>
  <TabList>
    <Tab>탭 1</Tab>
    <Tab>탭 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>패널 1 내용</TabPanel>
    <TabPanel>패널 2 내용</TabPanel>
  </TabPanels>
</Tabs>
\`\`\`

### 구현 방법

1. **Context API**: 상태를 Context로 공유
2. **React.Children**: 자식 컴포넌트 조작
3. **Static Properties**: 서브 컴포넌트를 부모의 속성으로 노출
      `,
      codeExamples: [
        {
          id: 'accordion-compound',
          title: 'Accordion 컴파운드 컴포넌트',
          description: 'Context를 활용한 구현',
          language: 'tsx',
          code: `// Accordion 컴파운드 컴포넌트

// 1. Context 정의
interface AccordionContextType {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion 컴포넌트 내부에서 사용해야 합니다');
  }
  return context;
}

// 2. 부모 컴포넌트
interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

function Accordion({
  children,
  allowMultiple = false,
  defaultExpanded = []
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState(
    new Set(defaultExpanded)
  );

  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// 3. 자식 컴포넌트들
interface AccordionItemProps {
  id: string;
  children: ReactNode;
}

function AccordionItem({ id, children }: AccordionItemProps) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.has(id);

  return (
    <div className={\`accordion-item \${isExpanded ? 'expanded' : ''}\`}>
      {children}
    </div>
  );
}

function AccordionTrigger({ itemId, children }: { itemId: string; children: ReactNode }) {
  const { toggleItem } = useAccordionContext();

  return (
    <button onClick={() => toggleItem(itemId)} className="accordion-trigger">
      {children}
    </button>
  );
}

function AccordionContent({ itemId, children }: { itemId: string; children: ReactNode }) {
  const { expandedItems } = useAccordionContext();

  if (!expandedItems.has(itemId)) return null;

  return <div className="accordion-content">{children}</div>;
}

// 4. Static Properties로 노출
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

// 5. 사용
<Accordion allowMultiple defaultExpanded={['faq-1']}>
  <Accordion.Item id="faq-1">
    <Accordion.Trigger itemId="faq-1">
      자주 묻는 질문 1
    </Accordion.Trigger>
    <Accordion.Content itemId="faq-1">
      답변 내용...
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item id="faq-2">
    <Accordion.Trigger itemId="faq-2">
      자주 묻는 질문 2
    </Accordion.Trigger>
    <Accordion.Content itemId="faq-2">
      답변 내용...
    </Accordion.Content>
  </Accordion.Item>
</Accordion>`
        },
        {
          id: 'form-dialog-compound',
          title: 'FormDialog 컴파운드 컴포넌트',
          description: '현재 프로젝트의 FormDialog 분석',
          fileName: 'src/components/common/FormDialog/index.tsx',
          language: 'tsx',
          code: `// FormDialog 컴파운드 컴포넌트 패턴 분석

// Context로 폼 상태 공유
interface FormDialogContextType<T> {
  data: T | null;
  mode: 'create' | 'edit';
  loading: boolean;
  errors: Record<string, string>;
  setFieldValue: (field: keyof T, value: any) => void;
  setErrors: (errors: Record<string, string>) => void;
}

// 메인 컴포넌트
interface FormDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  initialData?: T | null;
  title: string;
  children: ReactNode;
}

function FormDialog<T>({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  children
}: FormDialogProps<T>) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mode = initialData ? 'edit' : 'create';

  const setFieldValue = (field: keyof T, value: any) => {
    setData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = async () => {
    if (!data) return;
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <FormDialogContext.Provider value={{ data, mode, loading, errors, setFieldValue, setErrors }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} loading={loading}>
            {mode === 'create' ? '생성' : '저장'}
          </Button>
        </DialogActions>
      </FormDialogContext.Provider>
    </Dialog>
  );
}

// 서브 컴포넌트
function FormDialogField<T>({
  name,
  label,
  component: Component = TextField
}: {
  name: keyof T;
  label: string;
  component?: React.ComponentType<any>;
}) {
  const { data, errors, setFieldValue } = useFormDialogContext<T>();

  return (
    <Component
      label={label}
      value={data?.[name] || ''}
      onChange={(e: any) => setFieldValue(name, e.target.value)}
      error={!!errors[name as string]}
      helperText={errors[name as string]}
    />
  );
}

FormDialog.Field = FormDialogField;

// 사용
<FormDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onSubmit={handleSubmit}
  initialData={selectedUser}
  title={selectedUser ? '사용자 수정' : '사용자 추가'}
>
  <FormDialog.Field name="username" label="아이디" />
  <FormDialog.Field name="name" label="이름" />
  <FormDialog.Field name="email" label="이메일" />
</FormDialog>`
        }
      ],
      tips: [
        '✅ 컴파운드 컴포넌트는 관련 컴포넌트를 그룹화하고 API를 단순화합니다.',
        '✅ Context를 사용하여 prop drilling 없이 상태를 공유하세요.',
        '⚠️ 컴포넌트 간 결합도가 높아지므로 범용 라이브러리에서 신중하게 사용하세요.'
      ]
    },
    {
      id: 'higher-order-components',
      title: 'Higher-Order Components',
      titleKo: 'HOC (Higher-Order Component)',
      content: `
## HOC란?

**HOC(Higher-Order Component)** 는 컴포넌트를 인자로 받아 **새로운 컴포넌트를 반환**하는 함수입니다.

### 기본 구조

\`\`\`tsx
function withEnhancement<P>(WrappedComponent: ComponentType<P>) {
  return function EnhancedComponent(props: P) {
    // 추가 로직
    return <WrappedComponent {...props} />;
  };
}
\`\`\`

### HOC의 일반적인 사용 사례

| 사용 사례 | 설명 |
|----------|------|
| 인증 체크 | 로그인 여부 확인 후 렌더링 |
| 로딩 상태 | 로딩 중 스피너 표시 |
| 에러 처리 | 에러 발생 시 폴백 UI |
| 로깅/분석 | 컴포넌트 마운트 추적 |
| 데이터 주입 | 공통 데이터 prop 주입 |

### HOC vs Hooks

| 특성 | HOC | Hooks |
|------|-----|-------|
| 구문 | 컴포넌트 래핑 | 함수 호출 |
| 타입스크립트 | 복잡함 | 간단함 |
| 조건부 사용 | 가능 | 불가능 (규칙) |
| 디버깅 | 래퍼 증가 | 직관적 |
| 현재 권장 | 특수 케이스 | 일반적 |
      `,
      codeExamples: [
        {
          id: 'with-auth-hoc',
          title: '인증 HOC',
          description: '로그인 필요 페이지 보호',
          language: 'tsx',
          code: `// 인증 확인 HOC
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      return null; // 리다이렉트 중
    }

    return <WrappedComponent {...props} />;
  };
}

// 사용
function DashboardPage() {
  return <div>대시보드 내용</div>;
}

export default withAuth(DashboardPage);

// 권한 체크 HOC
function withPermission<P extends object>(
  permission: string
) {
  return function (WrappedComponent: ComponentType<P>) {
    return function PermissionComponent(props: P) {
      const { hasPermission } = usePermissions();

      if (!hasPermission(permission)) {
        return <AccessDenied />;
      }

      return <WrappedComponent {...props} />;
    };
  };
}

// 사용: 중첩 HOC
export default withAuth(
  withPermission('admin')(AdminPage)
);`
        },
        {
          id: 'with-loading-hoc',
          title: '로딩 상태 HOC',
          description: '로딩/에러 상태 처리',
          language: 'tsx',
          code: `// 로딩 상태를 처리하는 HOC
interface WithLoadingProps {
  loading?: boolean;
  error?: string | null;
}

function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  LoadingComponent: ComponentType = DefaultSpinner,
  ErrorComponent: ComponentType<{ error: string }> = DefaultError
) {
  return function LoadingComponent(props: P & WithLoadingProps) {
    const { loading, error, ...rest } = props;

    if (loading) {
      return <LoadingComponent />;
    }

    if (error) {
      return <ErrorComponent error={error} />;
    }

    return <WrappedComponent {...(rest as P)} />;
  };
}

// 사용
const UserListWithLoading = withLoading(UserList);

function UsersPage() {
  const { users, loading, error } = useUsers();

  return (
    <UserListWithLoading
      users={users}
      loading={loading}
      error={error}
    />
  );
}

// 커스텀 로딩/에러 컴포넌트 지정
const UserListWithCustomLoading = withLoading(
  UserList,
  () => <Skeleton variant="list" count={5} />,
  ({ error }) => <Alert severity="error">{error}</Alert>
);`
        },
        {
          id: 'hoc-best-practices',
          title: 'HOC 베스트 프랙티스',
          description: 'displayName, ref 전달 등',
          language: 'tsx',
          code: `// HOC 베스트 프랙티스

// 1. displayName 설정 (디버깅 용이)
function withLogger<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  function LoggerComponent(props: P) {
    useEffect(() => {
      console.log(\`\${WrappedComponent.displayName || WrappedComponent.name} mounted\`);
    }, []);

    return <WrappedComponent {...props} />;
  }

  // displayName 설정
  LoggerComponent.displayName = \`withLogger(\${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })\`;

  return LoggerComponent;
}

// 2. ref 전달 (forwardRef 사용)
function withTheme<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const ThemedComponent = forwardRef<any, P>((props, ref) => {
    const theme = useTheme();
    return <WrappedComponent {...props} ref={ref} theme={theme} />;
  });

  ThemedComponent.displayName = \`withTheme(\${
    WrappedComponent.displayName || WrappedComponent.name
  })\`;

  return ThemedComponent;
}

// 3. 정적 메서드 복사
import hoistNonReactStatics from 'hoist-non-react-statics';

function withHOC<P extends object>(WrappedComponent: ComponentType<P>) {
  function EnhancedComponent(props: P) {
    return <WrappedComponent {...props} />;
  }

  // 정적 메서드 복사
  hoistNonReactStatics(EnhancedComponent, WrappedComponent);

  return EnhancedComponent;
}

// 4. Props 충돌 방지
// ❌ 나쁜 예: 일반적인 prop 이름 사용
withData(Component); // { data: ... } 주입 - 충돌 가능

// ✅ 좋은 예: 네임스페이스 또는 명시적 이름
withUserData(Component); // { userData: ... } 주입`
        }
      ],
      tips: [
        '✅ 현대 React에서는 대부분의 경우 Custom Hook이 HOC보다 나은 선택입니다.',
        '✅ HOC는 조건부 렌더링, 라우트 가드 등 특수한 경우에 여전히 유용합니다.',
        '⚠️ HOC 중첩이 깊어지면 "래퍼 지옥"이 됩니다. compose 함수를 사용하세요.',
        'ℹ️ displayName을 설정하여 React DevTools에서 디버깅하기 쉽게 만드세요.'
      ]
    },
    {
      id: 'headless-ui',
      title: 'Headless UI Pattern',
      titleKo: 'Headless UI 패턴',
      content: `
## Headless UI란?

**Headless UI**는 **로직만 제공**하고 스타일/마크업은 사용자가 정의하는 패턴입니다.

### Headless vs 전통적 UI 라이브러리

| 특성 | 전통적 라이브러리 | Headless |
|------|-----------------|----------|
| 스타일 | 포함 (커스텀 어려움) | 없음 (완전 자유) |
| 마크업 | 고정 | 완전 제어 |
| 번들 크기 | 큼 | 작음 |
| 접근성 | 내장 | 내장 |
| 유연성 | 제한적 | 최대 |

### 대표적인 Headless UI 라이브러리

- **Radix UI**: 컴파운드 컴포넌트 스타일
- **Headless UI**: Tailwind Labs 제작
- **React Aria**: Adobe 제작, 접근성 중심
- **Downshift**: 자동완성/드롭다운
      `,
      codeExamples: [
        {
          id: 'headless-select',
          title: 'Headless Select 구현',
          description: '로직만 제공하는 Select',
          language: 'tsx',
          code: `// Headless Select - 로직만 제공
interface UseSelectOptions<T> {
  items: T[];
  value?: T;
  onChange?: (value: T) => void;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
}

interface UseSelectReturn<T> {
  // 상태
  isOpen: boolean;
  selectedItem: T | undefined;
  highlightedIndex: number;

  // 액션
  openMenu: () => void;
  closeMenu: () => void;
  selectItem: (item: T) => void;
  highlightItem: (index: number) => void;

  // Prop Getters (접근성 속성 포함)
  getTriggerProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>;
  getMenuProps: () => React.HTMLAttributes<HTMLUListElement>;
  getItemProps: (item: T, index: number) => React.HTMLAttributes<HTMLLIElement>;
}

function useSelect<T>({
  items,
  value,
  onChange,
  getItemId,
  getItemLabel
}: UseSelectOptions<T>): UseSelectReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedItem = value;

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const selectItem = (item: T) => {
    onChange?.(item);
    closeMenu();
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openMenu();
        else setHighlightedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (isOpen && highlightedIndex >= 0) {
          selectItem(items[highlightedIndex]);
        }
        break;
      case 'Escape':
        closeMenu();
        break;
    }
  };

  // Prop Getters - 접근성 속성 자동 포함
  const getTriggerProps = () => ({
    role: 'combobox' as const,
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox' as const,
    onClick: () => (isOpen ? closeMenu() : openMenu()),
    onKeyDown: handleKeyDown,
  });

  const getMenuProps = () => ({
    role: 'listbox' as const,
    'aria-activedescendant': highlightedIndex >= 0
      ? getItemId(items[highlightedIndex])
      : undefined,
  });

  const getItemProps = (item: T, index: number) => ({
    role: 'option' as const,
    id: getItemId(item),
    'aria-selected': item === selectedItem,
    onClick: () => selectItem(item),
    onMouseEnter: () => setHighlightedIndex(index),
  });

  return {
    isOpen,
    selectedItem,
    highlightedIndex,
    openMenu,
    closeMenu,
    selectItem,
    highlightItem: setHighlightedIndex,
    getTriggerProps,
    getMenuProps,
    getItemProps,
  };
}`
        },
        {
          id: 'headless-select-usage',
          title: 'Headless Select 사용',
          description: '다양한 스타일로 같은 로직 활용',
          language: 'tsx',
          code: `// Headless Select 사용 예시

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'KR', name: '대한민국', flag: '🇰🇷' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
];

// 스타일 1: 기본 드롭다운
function BasicSelect() {
  const [selected, setSelected] = useState<Country | undefined>();

  const select = useSelect({
    items: countries,
    value: selected,
    onChange: setSelected,
    getItemId: (c) => c.code,
    getItemLabel: (c) => c.name,
  });

  return (
    <div className="relative">
      <button {...select.getTriggerProps()} className="basic-trigger">
        {select.selectedItem?.name || '국가 선택'}
      </button>

      {select.isOpen && (
        <ul {...select.getMenuProps()} className="basic-menu">
          {countries.map((country, index) => (
            <li
              key={country.code}
              {...select.getItemProps(country, index)}
              className={\`basic-item \${
                index === select.highlightedIndex ? 'highlighted' : ''
              }\`}
            >
              {country.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 스타일 2: 플래그 포함 카드 스타일
function FancySelect() {
  const [selected, setSelected] = useState<Country | undefined>();

  const select = useSelect({
    items: countries,
    value: selected,
    onChange: setSelected,
    getItemId: (c) => c.code,
    getItemLabel: (c) => c.name,
  });

  return (
    <div className="relative">
      <button {...select.getTriggerProps()} className="fancy-trigger">
        {select.selectedItem ? (
          <span className="flex items-center gap-2">
            <span className="text-2xl">{select.selectedItem.flag}</span>
            <span>{select.selectedItem.name}</span>
          </span>
        ) : (
          '국가를 선택하세요'
        )}
        <ChevronDownIcon className="ml-auto" />
      </button>

      {select.isOpen && (
        <ul {...select.getMenuProps()} className="fancy-menu">
          {countries.map((country, index) => (
            <li
              key={country.code}
              {...select.getItemProps(country, index)}
              className={\`fancy-item \${
                country === select.selectedItem ? 'selected' : ''
              } \${index === select.highlightedIndex ? 'highlighted' : ''}\`}
            >
              <span className="text-2xl">{country.flag}</span>
              <div>
                <div className="font-bold">{country.name}</div>
                <div className="text-sm text-gray-500">{country.code}</div>
              </div>
              {country === select.selectedItem && <CheckIcon />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 동일한 useSelect 로직, 완전히 다른 UI!`
        },
        {
          id: 'datagrid-headless',
          title: 'DataGrid Headless 분석',
          description: '현재 프로젝트 DataGrid 패턴',
          fileName: 'src/components/common/DataGrid/index.tsx',
          language: 'tsx',
          code: `// DataGrid의 Headless 패턴 분석
// 로직(useDataGrid)과 UI(DataGrid)의 분리

// 1. 로직 Hook - Headless
function useDataGrid<T>({
  rows,
  columns,
  pagination,
  sorting,
  selection,
}: UseDataGridOptions<T>) {
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 정렬 상태
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 선택 상태
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // 정렬된 데이터
  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [rows, sortField, sortOrder]);

  // 페이지네이션된 데이터
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  return {
    // 표시할 데이터
    displayRows: paginatedRows,

    // 페이지네이션
    page, pageSize, totalPages: Math.ceil(rows.length / pageSize),
    setPage, setPageSize,

    // 정렬
    sortField, sortOrder,
    handleSort: (field: keyof T) => { ... },

    // 선택
    selectedIds,
    toggleSelection: (id: string | number) => { ... },
    selectAll: () => { ... },
    clearSelection: () => { ... },
  };
}

// 2. UI 컴포넌트 - useDataGrid 사용
function DataGrid<T>({ rows, columns, ...props }: DataGridProps<T>) {
  const grid = useDataGrid({ rows, columns, ...props });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          {columns.map(col => (
            <TableCell
              key={String(col.field)}
              onClick={() => grid.handleSort(col.field)}
            >
              {col.headerName}
              {grid.sortField === col.field && (
                <SortIcon direction={grid.sortOrder} />
              )}
            </TableCell>
          ))}
        </TableHead>
        <TableBody>
          {grid.displayRows.map(row => (
            <TableRow key={row.id}>
              {columns.map(col => (
                <TableCell key={String(col.field)}>
                  {col.renderCell
                    ? col.renderCell(row)
                    : row[col.field as keyof T]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={grid.page}
        totalPages={grid.totalPages}
        onChange={grid.setPage}
      />
    </TableContainer>
  );
}`
        }
      ],
      tips: [
        '✅ Headless 패턴은 디자인 시스템과 독립적인 로직 재사용에 최적입니다.',
        '✅ Prop Getters 패턴으로 접근성 속성을 자동으로 포함하세요.',
        'ℹ️ Radix UI, Headless UI 같은 라이브러리를 참고하세요.',
        '⚠️ 완전한 Headless는 구현 비용이 높습니다. 필요에 따라 수준을 조절하세요.'
      ]
    }
  ],
  references: [
    {
      title: 'React Composition vs Inheritance',
      url: 'https://react.dev/learn/thinking-in-react',
      type: 'documentation'
    },
    {
      title: 'Radix UI - Headless UI Components',
      url: 'https://www.radix-ui.com/',
      type: 'documentation'
    },
    {
      title: 'Patterns.dev - React Patterns',
      url: 'https://www.patterns.dev/react',
      type: 'article'
    }
  ],
  status: 'ready'
};

export default chapter;
