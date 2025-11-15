'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff, ContentCopy } from '@mui/icons-material';
import { User } from '@/app/[locale]/admin/users/types';

interface ResetPasswordDialogProps {
  open: boolean;
  user: User | null;
  loading: boolean;
  onConfirm: (newPassword: string, useDefault: boolean) => void;
  onCancel: () => void;
}

const DEFAULT_PASSWORD = 'Password123!';

export default function ResetPasswordDialog({
  open,
  user,
  loading,
  onConfirm,
  onCancel
}: ResetPasswordDialogProps) {
  const [resetType, setResetType] = useState<'default' | 'custom'>('default');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setResetType('default');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCopied(false);
    onCancel();
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(DEFAULT_PASSWORD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setError('');

    if (resetType === 'default') {
      // Use default password
      onConfirm(DEFAULT_PASSWORD, true);
      handleClose();
      return;
    }

    // Custom password validation
    if (!newPassword) {
      setError('Password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onConfirm(newPassword, false);
    handleClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && resetType === 'default') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset User Password</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {user && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              You are about to reset the password for user: <strong>{user.username}</strong> ({user.name})
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Choose reset method:
          </Typography>

          <RadioGroup
            value={resetType}
            onChange={(e) => setResetType(e.target.value as 'default' | 'custom')}
          >
            <FormControlLabel
              value="default"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Reset to default password
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quick reset with standard temporary password
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Set custom password
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Manually enter a new password
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>

          {resetType === 'default' ? (
            <Paper
              sx={{
                p: 2,
                mt: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Default temporary password:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    flex: 1
                  }}
                >
                  {DEFAULT_PASSWORD}
                </Typography>
                <IconButton
                  onClick={handleCopyPassword}
                  color={copied ? 'success' : 'primary'}
                  size="small"
                >
                  <ContentCopy />
                </IconButton>
              </Box>
              {copied && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                  Copied to clipboard!
                </Typography>
              )}
              <Alert severity="info" sx={{ mt: 2 }}>
                User should change this password on first login.
              </Alert>
            </Paper>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
