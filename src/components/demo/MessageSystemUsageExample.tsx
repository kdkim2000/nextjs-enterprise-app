'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { useMessage } from '@/hooks/useMessage';

/**
 * Practical example showing how to use the message system in a real CRUD scenario
 * 실제 CRUD 시나리오에서 메시지 시스템 사용법을 보여주는 실용적인 예제
 */
export default function MessageSystemUsageExample() {
  const [locale, setLocale] = useState<string>('ko');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize message system with locale
  const {
    showSuccessMessage,
    showErrorMessage,
    successMessage,
    errorMessage,
    clearMessages
  } = useMessage({ locale, duration: 8000 });

  // Simulate user creation
  const handleCreate = async () => {
    // Clear previous messages
    clearMessages();

    // Validation
    if (!username || !email || !password) {
      await showErrorMessage('VALIDATION_REQUIRED_FIELDS');
      return;
    }

    if (password.length < 8) {
      await showErrorMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 });
      return;
    }

    if (password !== confirmPassword) {
      await showErrorMessage('VALIDATION_PASSWORD_MISMATCH');
      return;
    }

    // Simulate API call
    setLoading(true);
    try {
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success
      await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  // Simulate user update
  const handleUpdate = async () => {
    clearMessages();

    if (!username || !email) {
      await showErrorMessage('VALIDATION_REQUIRED_FIELDS');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await showSuccessMessage('CRUD_USER_UPDATE_SUCCESS');
    } catch (error) {
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  // Simulate bulk delete
  const handleBulkDelete = async (count: number) => {
    clearMessages();

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count });
    } catch (error) {
      await showErrorMessage('CRUD_USER_DELETE_FAIL');
    } finally {
      setLoading(false);
    }
  };

  // Simulate load failure
  const handleLoadError = async () => {
    clearMessages();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await showErrorMessage('CRUD_USER_LOAD_FAIL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          🎯 Practical Usage Example / 실용적인 사용 예제
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This example demonstrates how to use the message system in a real CRUD scenario with validation.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이 예제는 검증이 포함된 실제 CRUD 시나리오에서 메시지 시스템을 사용하는 방법을 보여줍니다.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Left: Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                User Form / 사용자 폼
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={locale}
                  label="Language"
                  onChange={(e) => setLocale(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                  <MenuItem value="vi">Tiếng Việt</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="john.doe"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="john.doe@example.com"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="At least 8 characters"
                helperText="Minimum 8 characters"
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Confirm your password"
              />

              <Divider />

              <Button
                variant="contained"
                color="primary"
                onClick={handleCreate}
                disabled={loading}
                fullWidth
              >
                Create User / 사용자 생성
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpdate}
                disabled={loading}
                fullWidth
              >
                Update User / 사용자 수정
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Message Display & Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Message Display / 메시지 표시
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
                Messages will appear here when you perform actions.
                <br />
                액션을 수행하면 여기에 메시지가 표시됩니다.
              </Alert>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Test Other Messages / 다른 메시지 테스트
            </Typography>
            <Stack spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleBulkDelete(3)}
                disabled={loading}
              >
                Delete 3 Users (With Count Parameter)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleBulkDelete(10)}
                disabled={loading}
              >
                Delete 10 Users (With Count Parameter)
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleLoadError}
                disabled={loading}
              >
                Simulate Load Error
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Code Example */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          💻 Source Code / 소스 코드
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
          <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, m: 0, whiteSpace: 'pre-wrap' }}>
{`const { showSuccessMessage, showErrorMessage } = useMessage({
  locale: '${locale}'
});

// Validation
if (!username || !email || !password) {
  await showErrorMessage('VALIDATION_REQUIRED_FIELDS');
  return;
}

if (password.length < 8) {
  await showErrorMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 });
  return;
}

if (password !== confirmPassword) {
  await showErrorMessage('VALIDATION_PASSWORD_MISMATCH');
  return;
}

// Create user
try {
  await api.post('/user', userData);
  await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
} catch (error) {
  await showErrorMessage('CRUD_USER_SAVE_FAIL');
}

// Delete multiple users
await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count: 5 });`}
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
}
