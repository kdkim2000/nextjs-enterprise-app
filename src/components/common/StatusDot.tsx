'use client';
import { Box, Typography, useTheme } from '@mui/material';

type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export default function StatusDot({ status, label }: { status: Status; label?: string }) {
  const theme = useTheme();
  const colorMap: Record<Status, string | undefined> = {
    active: (theme.palette as any).status?.success,
    inactive: (theme.palette as any).status?.neutral,
    pending: (theme.palette as any).status?.warning,
    suspended: (theme.palette as any).status?.error,
  };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 6, height: 6, bgcolor: colorMap[status] ?? 'text.secondary', borderRadius: '50%' }} />
      <Typography variant="caption" color="text.secondary">
        {label ?? status}
      </Typography>
    </Box>
  );
}
