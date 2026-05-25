'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material';
import { useForm } from 'react-hook-form';

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginStepProps {
  onSuccess: (credentials: { username: string; password: string }) => void;
  onSsoClick?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// Underline-style input — Form Dialect
function UnderlineField({
  label,
  type = 'text',
  error: fieldError,
  endAdornment,
  inputRef,
  ...inputProps
}: {
  label: string;
  type?: string;
  error?: boolean;
  endAdornment?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5, letterSpacing: '0.1em', fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Box
          component="input"
          ref={inputRef}
          type={type}
          {...inputProps}
          sx={{
            width: '100%',
            border: 'none',
            borderBottom: '1px solid',
            borderColor: fieldError ? 'error.main' : 'divider',
            bgcolor: 'transparent',
            fontSize: '1rem',
            fontFamily: 'inherit',
            color: 'text.primary',
            py: 1,
            pr: endAdornment ? 4 : 0,
            outline: 'none',
            '&:focus': {
              borderColor: fieldError ? 'error.main' : 'primary.main',
            },
          }}
        />
        {endAdornment && (
          <Box sx={{ position: 'absolute', right: 0 }}>
            {endAdornment}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function LoginStep({ onSuccess, onSsoClick, isLoading = false, error }: LoginStepProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const { ref: usernameRef, ...usernameRegister } = register('username', {
    required: true,
  });
  const { ref: passwordRef, ...passwordRegister } = register('password', {
    required: true,
  });

  const onSubmit = (data: LoginFormValues) => {
    onSuccess(data);
  };

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}
    >
      <Box>
        <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.12em' }}>
          Step 01 of 02 · Sign in
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, lineHeight: 1.2 }}>
          엔터프라이즈에<br />로그인하세요.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <UnderlineField
        label="USERNAME"
        autoComplete="username"
        disabled={isLoading}
        inputRef={usernameRef}
        error={!!errors.username}
        {...usernameRegister}
      />

      <UnderlineField
        label="PASSWORD"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        disabled={isLoading}
        inputRef={passwordRef}
        error={!!errors.password}
        endAdornment={
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
            size="small"
            tabIndex={-1}
            sx={{ color: 'text.secondary' }}
          >
            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        }
        {...passwordRegister}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        endIcon={isLoading ? null : <ArrowForward />}
        sx={{
          mt: 1,
          height: 56,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : '다음 →'}
      </Button>

      {onSsoClick && (
        <>
          <Divider>
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Button
            type="button"
            variant="outlined"
            size="large"
            onClick={onSsoClick}
            disabled={isLoading}
            sx={{
              height: 56,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            SSO 로그인
          </Button>
        </>
      )}
    </Stack>
  );
}
