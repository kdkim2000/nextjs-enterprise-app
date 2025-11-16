'use client';

import React from 'react';
import { Box, Typography, Paper, Divider, Alert } from '@mui/material';
import ComponentDemoTemplate from '../ComponentDemoTemplate';
import MessageSystemDemo from '@/components/demo/MessageSystemDemo';
import MessageSystemUsageExample from '@/components/demo/MessageSystemUsageExample';

export default function MessageSystemPage() {
  return (
    <ComponentDemoTemplate
      title="Unified Message System"
      titleKo="통합 메시지 시스템"
      description="Centralized message management system with code-based messages, multi-language support (en, ko, zh, vi), and dynamic parameter substitution. Replace hardcoded messages with reusable, maintainable message codes."
      descriptionKo="코드 기반 메시지, 다국어 지원(영어, 한국어, 중국어, 베트남어), 동적 파라미터 치환을 제공하는 중앙 집중식 메시지 관리 시스템입니다. 하드코딩된 메시지를 재사용 가능하고 유지보수가 쉬운 메시지 코드로 교체할 수 있습니다."
      category="Business Logic"
      tags={['Message', 'i18n', 'Hook', 'Centralized', 'Multi-language']}
      importPath="@/hooks/useMessage"
    >
      {/* Interactive Demo */}
      <MessageSystemDemo />

      <Divider sx={{ my: 4 }} />

      {/* Practical Usage Example */}
      <MessageSystemUsageExample />

      <Divider sx={{ my: 4 }} />

      {/* Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          ✨ Key Features / 주요 기능
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Paper sx={{ p: 2, bgcolor: 'success.lighter' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              📋 Code-Based Messages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Replace hardcoded strings with message codes like <code>CRUD_USER_CREATE_SUCCESS</code>
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              🌍 Multi-Language Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automatic translation in English, Korean, Chinese, and Vietnamese
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'warning.lighter' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              🔄 Dynamic Parameters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Insert dynamic values using placeholders like <code>{'{count}'}</code> or <code>{'{username}'}</code>
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'error.lighter' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              ⚡ Performance Optimized
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built-in caching and preloading for frequently used messages
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Usage Examples */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          📝 Usage Examples / 사용 예제
        </Typography>

        {/* Example 1: Basic Usage */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            1. Basic Usage / 기본 사용법
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, m: 0, whiteSpace: 'pre-wrap' }}>
{`import { useMessage } from '@/hooks/useMessage';

function MyComponent() {
  const { showSuccessMessage, showErrorMessage } = useMessage({
    locale: 'ko'
  });

  const handleSave = async () => {
    try {
      await api.post('/user', userData);
      await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
      // → "사용자가 생성되었습니다"
    } catch (error) {
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
      // → "사용자 저장에 실패했습니다"
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`}
            </Typography>
          </Paper>
        </Box>

        {/* Example 2: Dynamic Parameters */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            2. Dynamic Parameters / 동적 파라미터
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, m: 0, whiteSpace: 'pre-wrap' }}>
{`const { showSuccessMessage } = useMessage({ locale: 'ko' });

// Message: "Successfully deleted {count} user(s)"
await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count: 5 });
// → "5명의 사용자가 삭제되었습니다"

// Message: "Password must be at least {min} characters"
await showErrorMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 });
// → "비밀번호는 최소 8자 이상이어야 합니다"`}
            </Typography>
          </Paper>
        </Box>

        {/* Example 3: Get Message Without Display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            3. Get Message Without Display / 표시하지 않고 조회만
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, m: 0, whiteSpace: 'pre-wrap' }}>
{`const { getMessage } = useMessage({ locale: 'ko' });

// Get message text without showing it
const message = await getMessage('CRUD_USER_CREATE_SUCCESS');
console.log(message); // "사용자가 생성되었습니다"

// Use in custom logic
const confirmMessage = await getMessage('COMMON_CONFIRM_DELETE');
if (window.confirm(confirmMessage)) {
  // Delete logic
}`}
            </Typography>
          </Paper>
        </Box>

        {/* Example 4: Message Display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            4. Message Display in UI / UI에서 메시지 표시
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, m: 0, whiteSpace: 'pre-wrap' }}>
{`import { Alert } from '@mui/material';
import { useMessage } from '@/hooks/useMessage';

function MyPage() {
  const { successMessage, errorMessage } = useMessage({ locale: 'ko' });

  return (
    <div>
      {successMessage && (
        <Alert severity="success">{successMessage}</Alert>
      )}
      {errorMessage && (
        <Alert severity="error">{errorMessage}</Alert>
      )}
      {/* Your page content */}
    </div>
  );
}`}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Message Codes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          📋 Available Message Codes / 사용 가능한 메시지 코드
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          All message codes follow the pattern: <code>{'CATEGORY_ENTITY_ACTION_TYPE'}</code>
        </Typography>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.main">
              ✅ CRUD Operations
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              CRUD_USER_CREATE_SUCCESS<br />
              CRUD_USER_UPDATE_SUCCESS<br />
              CRUD_USER_DELETE_SUCCESS (params: count)<br />
              CRUD_USER_SAVE_FAIL<br />
              CRUD_USER_DELETE_FAIL<br />
              CRUD_USER_LOAD_FAIL<br />
              <br />
              CRUD_ROLE_CREATE_SUCCESS<br />
              CRUD_ROLE_UPDATE_SUCCESS<br />
              CRUD_ROLE_DELETE_SUCCESS (params: count)<br />
              CRUD_ROLE_SAVE_FAIL<br />
              CRUD_ROLE_DELETE_FAIL<br />
              CRUD_ROLE_LOAD_FAIL
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="error.main">
              🔒 Validation
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              VALIDATION_PASSWORD_LENGTH (params: min)<br />
              VALIDATION_PASSWORD_MISMATCH<br />
              VALIDATION_REQUIRED_FIELDS
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="info.main">
              🔐 Authentication
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              AUTH_LOGIN_SUCCESS<br />
              AUTH_LOGIN_FAIL<br />
              AUTH_LOGOUT_SUCCESS<br />
              AUTH_SESSION_EXPIRED<br />
              AUTH_PERMISSION_DENIED
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="warning.main">
              ⚙️ System Operations
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              SYSTEM_EXPORT_SUCCESS<br />
              SYSTEM_EXPORT_FAIL<br />
              SYSTEM_IMPORT_SUCCESS (params: count)<br />
              SYSTEM_IMPORT_FAIL<br />
              NETWORK_ERROR<br />
              SERVER_ERROR
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary.main">
              👤 User Operations
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              USER_PASSWORD_RESET_SUCCESS (params: resetMethod, username)<br />
              USER_PASSWORD_RESET_FAIL<br />
              USER_NOT_FOUND<br />
              USER_ALREADY_EXISTS
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
              📦 Common Messages
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              COMMON_SAVE_SUCCESS<br />
              COMMON_DELETE_SUCCESS<br />
              COMMON_UPDATE_SUCCESS<br />
              COMMON_CREATE_SUCCESS<br />
              COMMON_LOAD_FAIL<br />
              COMMON_SAVE_FAIL<br />
              COMMON_DELETE_FAIL<br />
              COMMON_REQUIRED_FIELD<br />
              COMMON_INVALID_EMAIL<br />
              COMMON_CONFIRM_DELETE<br />
              COMMON_NO_DATA
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          🔧 API Reference / API 레퍼런스
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
          <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, m: 0, whiteSpace: 'pre-wrap' }}>
{`interface UseMessageOptions {
  duration?: number;  // Auto-hide duration (default: 10000ms)
  locale?: string;    // Default locale (default: 'en')
}

const {
  // Message Retrieval
  getMessage: (code: string, params?: Record<string, any>, locale?: string) => Promise<string>,

  // Message Display (with auto-hide)
  showMessage: (code: string, type: 'success' | 'error', params?: Record<string, any>, locale?: string) => Promise<void>,
  showSuccessMessage: (code: string, params?: Record<string, any>, locale?: string) => Promise<void>,
  showErrorMessage: (code: string, params?: Record<string, any>, locale?: string) => Promise<void>,

  // Current Messages
  successMessage: string | null,
  errorMessage: string | null,

  // Message Management
  clearMessages: () => void,
  setSuccessMessage: (message: string | null) => void,
  setErrorMessage: (message: string | null) => void,

  // Cache Management
  clearCache: () => void,
  preloadMessages: (codes: string[]) => Promise<void>,

  // Loading State
  loading: boolean,

  // Legacy Support
  showSuccess: (message: string) => void,
  showError: (message: string) => void
} = useMessage(options);`}
          </Typography>
        </Paper>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Best Practices */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          💡 Best Practices / 베스트 프랙티스
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ✅ DO: Use Message Codes
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
            await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
          </Typography>
        </Alert>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ❌ DON'T: Hardcode Messages
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
            showSuccess('User created successfully');
          </Typography>
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            💡 TIP: Preload Frequently Used Messages
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
            {`useEffect(() => {
  preloadMessages(['CRUD_USER_CREATE_SUCCESS', 'CRUD_USER_UPDATE_SUCCESS']);
}, []);`}
          </Typography>
        </Alert>
        <Alert severity="warning">
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ⚠️ IMPORTANT: Message Management
          </Typography>
          <Typography variant="body2">
            Add new messages in <strong>Admin &gt; Message Management</strong> page. Follow the naming convention: CATEGORY_ENTITY_ACTION_TYPE
          </Typography>
        </Alert>
      </Box>

      {/* Additional Info */}
      <Alert severity="info">
        <Typography variant="body2" gutterBottom>
          <strong>📖 Documentation:</strong> See <code>docs/message-system-guide.md</code> for detailed documentation
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>🔧 Message Management:</strong> Add/Edit messages in <code>/admin/messages</code>
        </Typography>
        <Typography variant="body2">
          <strong>🌐 Backend API:</strong> <code>GET /api/message/code/:code</code>
        </Typography>
      </Alert>
    </ComponentDemoTemplate>
  );
}
