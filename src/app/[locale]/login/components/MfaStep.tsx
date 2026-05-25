'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

interface MfaStepProps {
  onSuccess: () => void;
  onResend: () => void;
  isLoading?: boolean;
  error?: string | null;
  verifyMfa: (code: string) => Promise<void>;
  email?: string;
  devCode?: string;
}

const DIGIT_COUNT = 6;
const RESEND_SECONDS = 60;

export default function MfaStep({
  onSuccess,
  onResend,
  isLoading = false,
  error,
  verifyMfa,
  email,
  devCode,
}: MfaStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(''));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleResend = () => {
    setTimer(RESEND_SECONDS);
    setDigits(Array(DIGIT_COUNT).fill(''));
    setSubmitError(null);
    onResend();
    // Focus first input
    inputRefs.current[0]?.focus();
  };

  const focusAt = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Handle paste of multi-digit string
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, DIGIT_COUNT);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < DIGIT_COUNT) {
          newDigits[index + i] = pasted[i];
        }
      }
      setDigits(newDigits);
      const nextFocus = Math.min(index + pasted.length, DIGIT_COUNT - 1);
      focusAt(nextFocus);
      return;
    }

    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < DIGIT_COUNT - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Clear current digit
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        focusAt(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight' && index < DIGIT_COUNT - 1) {
      focusAt(index + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < DIGIT_COUNT) return;
    setSubmitError(null);
    try {
      await verifyMfa(code);
      onSuccess();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } }; message?: string };
      setSubmitError(anyErr?.response?.data?.error ?? anyErr?.message ?? 'Verification failed');
    }
  };

  const code = digits.join('');
  const isComplete = code.length === DIGIT_COUNT;
  const displayError = error ?? submitError;

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
      sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}
    >
      <Box>
        <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.12em' }}>
          Step 02 of 02 · Verify
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, lineHeight: 1.2 }}>
          인증 코드를<br />입력하세요.
        </Typography>
        {email && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {email}로 발송된 6자리 코드를 입력하세요.
          </Typography>
        )}
      </Box>

      {devCode && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <strong>Dev Mode:</strong> 코드는 {devCode}
        </Alert>
      )}

      {displayError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {displayError}
        </Alert>
      )}

      {/* 6-digit segmented input */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {digits.map((digit, i) => (
          <Box key={i} sx={{ flex: 1, textAlign: 'center' }}>
            <Box
              component="input"
              ref={(el: HTMLInputElement | null) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(i, e)}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text');
                handleChange(i, pasted);
              }}
              sx={{
                width: '100%',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: 'none',
                borderBottom: '2px solid',
                borderColor: digit ? 'primary.main' : 'divider',
                bgcolor: 'transparent',
                color: 'text.primary',
                py: 1,
                outline: 'none',
                caretColor: 'primary.main',
                transition: 'border-color 0.15s',
                '&:focus': {
                  borderColor: 'primary.main',
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Resend timer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {timer > 0 ? (
            <>
              재발송 가능:{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
              </Box>
            </>
          ) : (
            '코드가 만료되었습니다.'
          )}
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={handleResend}
          disabled={timer > 0 || isLoading}
          sx={{ textTransform: 'none', fontSize: '0.8rem' }}
        >
          코드 재발송
        </Button>
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading || !isComplete}
        endIcon={isLoading ? null : <ArrowForward />}
        sx={{
          height: 56,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : '코드 입력 후 인증 →'}
      </Button>
    </Stack>
  );
}
