# Login / MFA page redesign

The current `src/app/[locale]/login/page.tsx` (20 KB, 600+ lines) presents auth as a single centered MUI card on a gradient. The new pattern splits the screen into a brand panel + step-aware auth panel — this gives MFA, SSO, and password-reset steps room to breathe and signals "you're inside an enterprise product" the moment a user lands.

## Goals

1. **Two-pane layout** at md+ breakpoint. Single-pane stack on mobile.
2. **Step-aware** — Login → MFA → Success. Each step is a separate visual stage, not a re-rendered form.
3. **Brand panel** — small dot + wordmark, large editorial quote, version stamp at bottom.
4. **Auth panel** — breadcrumb-style step indicator, minimal underline inputs (Form Dialect), single primary button.
5. **MFA**: 6-digit segmented input. Each digit auto-advances. Resend timer in monospace.

## Drop-in structure

Create three components, each ~120 lines, instead of one 600-line page:

```
src/app/[locale]/login/
  page.tsx              ← orchestrates step state + auth API
  components/
    BrandPanel.tsx      ← left side — quote, brand, version
    LoginStep.tsx       ← username + password
    MfaStep.tsx         ← 6-digit OTP + resend timer
    SuccessStep.tsx     ← optional, brief celebration → redirect
```

## BrandPanel.tsx

```tsx
'use client';
import { Box, Typography } from '@mui/material';

export default function BrandPanel() {
  return (
    <Box sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'space-between',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      p: 6,
      minHeight: '100vh',
    }}>
      {/* Top — wordmark */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 10, height: 10, bgcolor: 'primary.main', borderRadius: '50%' }} />
        <Typography
          variant="overline"
          sx={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.16em' }}
        >
          ENTERPRISE
        </Typography>
      </Box>

      {/* Middle — editorial quote */}
      <Typography sx={{
        fontSize: '2rem',
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
        maxWidth: 380,
      }}>
        엔터프라이즈를 다시,{' '}
        <Typography
          component="em"
          sx={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: 'error.main',
            fontWeight: 500,
          }}
        >
          조용하게
        </Typography>{' '}
        설계합니다.
      </Typography>

      {/* Bottom — version + SSO indicator */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'text.tertiary',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        <span>v1.0.0.0</span>
        <span>SSO ENABLED</span>
      </Box>
    </Box>
  );
}
```

## LoginStep.tsx (excerpt)

```tsx
'use client';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';

export default function LoginStep({ onNext }: { onNext: (creds: any) => void }) {
  const { register, handleSubmit } = useForm();
  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onNext)}
      sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}
    >
      <Box>
        <Typography variant="overline" color="primary">
          Step 01 of 02 · Sign in
        </Typography>
        <Typography variant="h2" sx={{ mt: 1 }}>
          엔터프라이즈에<br />로그인하세요.
        </Typography>
      </Box>

      {/* Underline-style fields — Form Dialect */}
      <UnderlineField label="USERNAME" {...register('username')} />
      <UnderlineField label="PASSWORD" type="password" {...register('password')} />

      <Button type="submit" variant="contained" size="large">
        다음 →
      </Button>
    </Stack>
  );
}

// Tiny helper — underline input
function UnderlineField({ label, ...inputProps }: any) {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.tertiary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        {label}
      </Typography>
      <Box
        component="input"
        {...inputProps}
        sx={{
          width: '100%',
          border: 'none',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'transparent',
          fontSize: '1rem',
          fontFamily: 'inherit',
          color: 'text.primary',
          py: 1,
          outline: 'none',
          '&:focus': { borderColor: 'primary.main', borderWidth: 1 },
        }}
      />
    </Box>
  );
}
```

## MfaStep.tsx — segmented OTP input

The 6-digit pattern is the visual signature of the new auth flow. Each digit is a column with a 2px bottom rule that activates when filled.

Key UX details:
- Auto-advance on each digit
- Backspace returns focus to previous digit
- Paste a 6-digit code spreads across all inputs
- Resend timer in monospace, decrements per second
- "코드 입력 후 인증 →" primary button stays at bottom of stack

See full implementation in the existing MFA code path — preserve the auth logic, replace only the UI.

---

## Reference layout

The full page composes like:

```tsx
export default function LoginPage() {
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [creds, setCreds] = useState(null);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, minHeight: '100vh' }}>
      <BrandPanel />
      <Box sx={{ p: { xs: 4, md: 8 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {step === 'login' && <LoginStep onNext={(c) => { setCreds(c); setStep('mfa'); }} />}
        {step === 'mfa' && <MfaStep creds={creds} />}
      </Box>
    </Box>
  );
}
```

Login background uses `bgcolor: 'background.default'` (warm off-white). No gradient. No card. The brand panel sits directly on `background.paper` with a hairline divider to its right.

Mobile (xs–sm): brand panel hides, full-width auth stack with a small wordmark at top.
