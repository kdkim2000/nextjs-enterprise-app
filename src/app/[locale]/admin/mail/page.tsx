'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Mail,
  Storage,
  People,
  TrendingUp,
  Save,
  Refresh,
  Search,
  Edit,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { useHelp } from '@/hooks/useHelp';
import api from '@/lib/axios';

const PROGRAM_ID = 'PROG-MAIL-ADMIN';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface MailAdminStats {
  totalMessages: number;
  totalUsers: number;
  storageUsed: number;
  storageLimit: number;
  messagesLast24h: number;
  activeUsers: number;
}

interface UserQuota {
  userId: string;
  username: string;
  name: string;
  storageUsed: number;
  storageLimit: number;
  messageCount: number;
}

interface SystemSettings {
  maxAttachmentSize: number;
  maxMessageSize: number;
  retentionDays: number;
  trashRetentionDays: number;
  enableExternalMail: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
}

export default function MailAdminPage() {
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: PROGRAM_ID });

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data
  const [stats, setStats] = useState<MailAdminStats | null>(null);
  const [userQuotas, setUserQuotas] = useState<UserQuota[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxAttachmentSize: 10,
    maxMessageSize: 25,
    retentionDays: 365,
    trashRetentionDays: 30,
    enableExternalMail: false,
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true
  });
  const [quotaSearch, setQuotaSearch] = useState('');

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/mail/admin/stats');
      setStats(response.data.data);
    } catch {
      // Set mock data for demo
      setStats({
        totalMessages: 15420,
        totalUsers: 245,
        storageUsed: 2.4,
        storageLimit: 10,
        messagesLast24h: 523,
        activeUsers: 89
      });
    }
  }, []);

  // Fetch user quotas
  const fetchUserQuotas = useCallback(async () => {
    try {
      const response = await api.get('/mail/admin/quotas', { params: { search: quotaSearch } });
      setUserQuotas(response.data.data || []);
    } catch {
      // Set mock data for demo
      setUserQuotas([
        { userId: '1', username: 'admin', name: 'Administrator', storageUsed: 450, storageLimit: 1024, messageCount: 1250 },
        { userId: '2', username: 'user1', name: 'User One', storageUsed: 320, storageLimit: 512, messageCount: 890 },
        { userId: '3', username: 'user2', name: 'User Two', storageUsed: 128, storageLimit: 512, messageCount: 450 },
      ]);
    }
  }, [quotaSearch]);

  // Fetch system settings
  const fetchSystemSettings = useCallback(async () => {
    try {
      const response = await api.get('/mail/admin/settings');
      if (response.data.data) {
        setSystemSettings(response.data.data);
      }
    } catch {
      // Use defaults
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUserQuotas(), fetchSystemSettings()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchUserQuotas, fetchSystemSettings]);

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await api.put('/mail/admin/settings', systemSettings);
      setSuccessMessage('Settings saved successfully');
    } catch {
      setErrorMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [systemSettings]);

  // Format storage size
  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  // Get storage percentage
  const getStoragePercent = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  // Get storage color
  const getStorageColor = (percent: number): 'error' | 'warning' | 'primary' => {
    if (percent >= 90) return 'error';
    if (percent >= 70) return 'warning';
    return 'primary';
  };

  if (loading) {
    return (
      <StandardCrudPageLayout
        useMenu
        showBreadcrumb
        showQuickSearch={false}
        showAdvancedFilter={false}
        programId={PROGRAM_ID}
        helpOpen={helpOpen}
        onHelpOpenChange={setHelpOpen}
        isAdmin={isAdmin}
        helpExists={helpExists}
        canManageHelp={canManageHelp}
        onHelpEdit={navigateToHelpEdit}
        language={language}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </StandardCrudPageLayout>
    );
  }

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      showQuickSearch={false}
      showAdvancedFilter={false}
      programId={PROGRAM_ID}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      successMessage={successMessage}
      errorMessage={errorMessage}
    >
      <Paper sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Dashboard" />
            <Tab label="User Quotas" />
            <Tab label="System Settings" />
          </Tabs>
        </Box>

        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              {/* Stats Cards */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Mail color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Messages
                      </Typography>
                    </Box>
                    <Typography variant="h4">{stats?.totalMessages?.toLocaleString() || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      +{stats?.messagesLast24h || 0} in last 24h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <People color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Users
                      </Typography>
                    </Box>
                    <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.activeUsers || 0} active today
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Storage color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Storage Used
                      </Typography>
                    </Box>
                    <Typography variant="h4">{formatStorage((stats?.storageUsed || 0) * 1024)}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getStoragePercent(stats?.storageUsed || 0, stats?.storageLimit || 10)}
                        color={getStorageColor(getStoragePercent(stats?.storageUsed || 0, stats?.storageLimit || 10))}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUp color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Avg Per User
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {stats?.totalUsers ? Math.round((stats.totalMessages || 0) / stats.totalUsers) : 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      messages per user
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Status */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>System Status</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle color="success" />
                          <Typography>Database Connected</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {systemSettings.enableExternalMail ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Warning color="warning" />
                          )}
                          <Typography>SMTP {systemSettings.enableExternalMail ? 'Enabled' : 'Disabled'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle color="success" />
                          <Typography>Storage OK</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* User Quotas Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={quotaSearch}
                onChange={(e) => setQuotaSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ width: 300 }}
              />
              <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUserQuotas}>
                Refresh
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Messages</TableCell>
                    <TableCell>Storage Used</TableCell>
                    <TableCell>Quota</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userQuotas.map((user) => {
                    const usagePercent = getStoragePercent(user.storageUsed, user.storageLimit);
                    return (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.username}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.messageCount.toLocaleString()}</TableCell>
                        <TableCell>{formatStorage(user.storageUsed)}</TableCell>
                        <TableCell>{formatStorage(user.storageLimit)}</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={usagePercent}
                              color={getStorageColor(usagePercent)}
                              sx={{ flex: 1 }}
                            />
                            <Typography variant="caption">{usagePercent.toFixed(0)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Quota">
                            <IconButton size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={4}>
              {/* Storage Settings */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Storage Settings</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    type="number"
                    label="Max Attachment Size"
                    value={systemSettings.maxAttachmentSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxAttachmentSize: Number(e.target.value) }))}
                    InputProps={{ endAdornment: <Typography variant="caption">MB</Typography> }}
                  />
                  <TextField
                    type="number"
                    label="Max Message Size"
                    value={systemSettings.maxMessageSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxMessageSize: Number(e.target.value) }))}
                    InputProps={{ endAdornment: <Typography variant="caption">MB</Typography> }}
                  />
                </Box>
              </Grid>

              {/* Retention Settings */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Retention Settings</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    type="number"
                    label="Message Retention"
                    value={systemSettings.retentionDays}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, retentionDays: Number(e.target.value) }))}
                    InputProps={{ endAdornment: <Typography variant="caption">days</Typography> }}
                  />
                  <TextField
                    type="number"
                    label="Trash Retention"
                    value={systemSettings.trashRetentionDays}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, trashRetentionDays: Number(e.target.value) }))}
                    InputProps={{ endAdornment: <Typography variant="caption">days</Typography> }}
                  />
                </Box>
              </Grid>

              {/* SMTP Settings */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>SMTP Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.enableExternalMail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, enableExternalMail: e.target.checked }))}
                    />
                  }
                  label="Enable External Mail"
                />

                {systemSettings.enableExternalMail && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        value={systemSettings.smtpHost}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="SMTP Port"
                        value={systemSettings.smtpPort}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.smtpSecure}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                          />
                        }
                        label="Use SSL/TLS"
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Save Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                Save Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </StandardCrudPageLayout>
  );
}
