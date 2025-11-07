'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function AutoLogoutWarning() {
  const { showWarning, remainingTime, extendSession, logout } = useAutoLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 2 * 60 * 1000 // 2 minutes warning
  });

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          <span>Session Timeout Warning</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Your session will expire in <strong>{remainingTime}</strong> seconds due to
          inactivity.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Click &quot;Stay Logged In&quot; to continue your session, or &quot;Logout Now&quot; to logout
          immediately.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={logout} color="error">
          Logout Now
        </Button>
        <Button onClick={extendSession} variant="contained" autoFocus>
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
}
