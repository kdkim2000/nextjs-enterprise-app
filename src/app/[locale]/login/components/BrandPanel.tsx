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
          sx={{ letterSpacing: '0.16em' }}
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
            fontStyle: 'italic',
            color: 'error.main',
            fontWeight: 500,
            fontSize: 'inherit',
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
        fontSize: '0.75rem',
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        <span>v1.0.0.0</span>
        <span>SSO ENABLED</span>
      </Box>
    </Box>
  );
}
