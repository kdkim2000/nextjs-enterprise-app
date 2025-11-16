'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useMessage } from '@/hooks/useMessage';

/**
 * Message System Demo Component
 * 통합 메시지 시스템의 사용법을 보여주는 데모 컴포넌트
 */
export default function MessageSystemDemo() {
  const [locale, setLocale] = useState<string>('ko');
  const [messageCode, setMessageCode] = useState<string>('CRUD_USER_CREATE_SUCCESS');
  const [paramKey, setParamKey] = useState<string>('count');
  const [paramValue, setParamValue] = useState<string>('5');
  const [retrievedMessage, setRetrievedMessage] = useState<string>('');

  const {
    showSuccessMessage,
    showErrorMessage,
    getMessage,
    successMessage,
    errorMessage,
    clearMessages,
    loading
  } = useMessage({ locale, duration: 10000 });

  // 사전 정의된 예제 메시지
  const exampleMessages = [
    { code: 'CRUD_USER_CREATE_SUCCESS', label: 'User Create Success', params: {} },
    { code: 'CRUD_USER_DELETE_SUCCESS', label: 'User Delete Success', params: { count: 5 } },
    { code: 'CRUD_ROLE_UPDATE_SUCCESS', label: 'Role Update Success', params: {} },
    { code: 'VALIDATION_PASSWORD_LENGTH', label: 'Password Length Validation', params: { min: 8 } },
    { code: 'VALIDATION_PASSWORD_MISMATCH', label: 'Password Mismatch', params: {} },
    { code: 'SYSTEM_EXPORT_SUCCESS', label: 'Export Success', params: {} },
    { code: 'SYSTEM_IMPORT_SUCCESS', label: 'Import Success', params: { count: 10 } },
    { code: 'USER_PASSWORD_RESET_SUCCESS', label: 'Password Reset Success', params: { resetMethod: 'default', username: 'john.doe' } },
    { code: 'AUTH_LOGIN_FAIL', label: 'Login Failure', params: {} },
    { code: 'COMMON_NO_DATA', label: 'No Data Available', params: {} }
  ];

  const handleShowSuccess = async () => {
    const params = paramKey && paramValue ? { [paramKey]: paramValue } : undefined;
    await showSuccessMessage(messageCode, params, locale);
  };

  const handleShowError = async () => {
    const params = paramKey && paramValue ? { [paramKey]: paramValue } : undefined;
    await showErrorMessage(messageCode, params, locale);
  };

  const handleGetMessage = async () => {
    const params = paramKey && paramValue ? { [paramKey]: paramValue } : undefined;
    const message = await getMessage(messageCode, params, locale);
    setRetrievedMessage(message);
  };

  const handleQuickTest = async (code: string, params: Record<string, any>, type: 'success' | 'error') => {
    if (type === 'success') {
      await showSuccessMessage(code, params, locale);
    } else {
      await showErrorMessage(code, params, locale);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎯 통합 메시지 시스템 데모
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        이 페이지는 통합 메시지 시스템의 기능을 테스트하고 사용법을 학습하기 위한 데모입니다.
      </Typography>

      <Grid container spacing={3}>
        {/* 왼쪽: 컨트롤 패널 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📝 메시지 테스트
            </Typography>

            <Stack spacing={3}>
              {/* 로케일 선택 */}
              <FormControl fullWidth>
                <InputLabel>언어 / Language</InputLabel>
                <Select
                  value={locale}
                  label="언어 / Language"
                  onChange={(e) => setLocale(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                  <MenuItem value="vi">Tiếng Việt</MenuItem>
                </Select>
              </FormControl>

              {/* 메시지 코드 입력 */}
              <TextField
                fullWidth
                label="메시지 코드"
                value={messageCode}
                onChange={(e) => setMessageCode(e.target.value)}
                placeholder="CRUD_USER_CREATE_SUCCESS"
                helperText="사용 가능한 메시지 코드를 입력하세요"
              />

              {/* 파라미터 입력 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  동적 파라미터 (선택사항)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="키"
                    value={paramKey}
                    onChange={(e) => setParamKey(e.target.value)}
                    placeholder="count"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="값"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    placeholder="5"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* 액션 버튼 */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleShowSuccess}
                  disabled={loading}
                  fullWidth
                >
                  ✅ 성공 메시지 표시
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleShowError}
                  disabled={loading}
                  fullWidth
                >
                  ❌ 오류 메시지 표시
                </Button>
              </Stack>

              <Button
                variant="outlined"
                onClick={handleGetMessage}
                disabled={loading}
                fullWidth
              >
                📥 메시지 조회만 하기 (표시 안 함)
              </Button>

              {retrievedMessage && (
                <Alert severity="info">
                  <Typography variant="subtitle2">조회된 메시지:</Typography>
                  <Typography variant="body2">{retrievedMessage}</Typography>
                </Alert>
              )}

              <Button
                variant="outlined"
                color="secondary"
                onClick={clearMessages}
                fullWidth
              >
                🗑️ 메시지 지우기
              </Button>
            </Stack>
          </Paper>

          {/* 메시지 표시 영역 */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              💬 메시지 표시 영역
            </Typography>
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            {!successMessage && !errorMessage && (
              <Alert severity="info">
                메시지가 여기에 표시됩니다. 위의 버튼을 눌러 테스트하세요.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* 오른쪽: 빠른 테스트 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ⚡ 빠른 테스트
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              사전 정의된 메시지를 클릭하여 빠르게 테스트하세요
            </Typography>

            <Stack spacing={2}>
              {exampleMessages.map((example) => (
                <Card key={example.code} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {example.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {example.code}
                    </Typography>
                    {Object.keys(example.params).length > 0 && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Params: {JSON.stringify(example.params)}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleQuickTest(example.code, example.params, 'success')}
                    >
                      Success
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleQuickTest(example.code, example.params, 'error')}
                    >
                      Error
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          </Paper>

          {/* 사용 가능한 메시지 코드 목록 */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 사용 가능한 메시지 코드
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              COMMON_*: 공통 메시지
              <br />
              CRUD_USER_*: 사용자 CRUD
              <br />
              CRUD_ROLE_*: 역할 CRUD
              <br />
              VALIDATION_*: 검증 메시지
              <br />
              SYSTEM_*: 시스템 메시지
              <br />
              AUTH_*: 인증 메시지
              <br />
              USER_*: 사용자 작업
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => window.open('/admin/messages', '_blank')}
            >
              메시지 관리 페이지 열기
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
