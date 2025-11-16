'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Grid,
  Paper,
  Divider,
  Alert,
  Avatar,
  Badge,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  AdminPanelSettings,
  Person,
  Star
} from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';

export default function ThemeDemoPage() {
  const theme = useTheme();
  const t = useI18n();

  return (
    <PageContainer sx={{ height: 'auto', minHeight: '100vh', overflow: 'auto' }}>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          {t('themeDemo.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('themeDemo.description')}
        </Typography>
      </Box>

      {/* Typography Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('themeDemo.typography.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('themeDemo.typography.headings')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="h1">{t('themeDemo.typography.heading1')}</Typography>
                <Typography variant="h2">{t('themeDemo.typography.heading2')}</Typography>
                <Typography variant="h3">{t('themeDemo.typography.heading3')}</Typography>
                <Typography variant="h4">{t('themeDemo.typography.heading4')}</Typography>
                <Typography variant="h5">{t('themeDemo.typography.heading5')}</Typography>
                <Typography variant="h6">{t('themeDemo.typography.heading6')}</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('themeDemo.typography.bodyText')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {t('themeDemo.typography.body1')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('themeDemo.typography.body2')}
                </Typography>
                <Typography variant="caption" display="block">
                  {t('themeDemo.typography.caption')}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Status Colors Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('themeDemo.statusColors.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.status.active,
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{t('themeDemo.statusColors.active')}</Typography>
                <Typography variant="caption">{theme.palette.status.active}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.status.inactive,
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Error sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{t('themeDemo.statusColors.inactive')}</Typography>
                <Typography variant="caption">{theme.palette.status.inactive}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.status.pending,
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Warning sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{t('themeDemo.statusColors.pending')}</Typography>
                <Typography variant="caption">{theme.palette.status.pending}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.status.info,
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Info sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{t('themeDemo.statusColors.info')}</Typography>
                <Typography variant="caption">{theme.palette.status.info}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('themeDemo.statusColors.statusChips')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={t('themeDemo.statusColors.active')}
                icon={<CheckCircle />}
                sx={{ bgcolor: theme.palette.status.active, color: 'white' }}
              />
              <Chip
                label={t('themeDemo.statusColors.inactive')}
                sx={{ bgcolor: theme.palette.status.inactive, color: 'white' }}
              />
              <Chip
                label={t('themeDemo.statusColors.pending')}
                sx={{ bgcolor: theme.palette.status.pending, color: 'white' }}
              />
              <Chip
                label={t('themeDemo.statusColors.success')}
                sx={{ bgcolor: theme.palette.status.success, color: 'white' }}
              />
              <Chip
                label={t('themeDemo.statusColors.error')}
                sx={{ bgcolor: theme.palette.status.error, color: 'white' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Role Colors Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('themeDemo.roleColors.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Stack alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.role.admin,
                    width: 56,
                    height: 56
                  }}
                >
                  <AdminPanelSettings />
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {t('themeDemo.roleColors.admin')}
                </Typography>
                <Chip
                  label={t('themeDemo.roleColors.admin')}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.role.admin,
                    color: 'white'
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Stack alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.role.manager,
                    width: 56,
                    height: 56
                  }}
                >
                  <Star />
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {t('themeDemo.roleColors.manager')}
                </Typography>
                <Chip
                  label={t('themeDemo.roleColors.manager')}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.role.manager,
                    color: 'white'
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Stack alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.role.moderator,
                    width: 56,
                    height: 56
                  }}
                >
                  M
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {t('themeDemo.roleColors.moderator')}
                </Typography>
                <Chip
                  label={t('themeDemo.roleColors.moderator')}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.role.moderator,
                    color: 'white'
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Stack alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.role.user,
                    width: 56,
                    height: 56
                  }}
                >
                  <Person />
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {t('themeDemo.roleColors.user')}
                </Typography>
                <Chip
                  label={t('themeDemo.roleColors.user')}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.role.user,
                    color: 'white'
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Stack alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.role.guest,
                    width: 56,
                    height: 56
                  }}
                >
                  G
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {t('themeDemo.roleColors.guest')}
                </Typography>
                <Chip
                  label={t('themeDemo.roleColors.guest')}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.role.guest,
                    color: 'white'
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Component Overrides Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('themeDemo.componentOverrides.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('themeDemo.componentOverrides.buttons')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button variant="contained">{t('themeDemo.componentOverrides.containedButton')}</Button>
                <Button variant="outlined">{t('themeDemo.componentOverrides.outlinedButton')}</Button>
                <Button variant="text">{t('themeDemo.componentOverrides.textButton')}</Button>
                <Button variant="contained" color="secondary">
                  {t('themeDemo.componentOverrides.secondary')}
                </Button>
                <Button variant="contained" color="error">
                  {t('themeDemo.statusColors.error')}
                </Button>
                <Button variant="contained" color="success">
                  {t('themeDemo.statusColors.success')}
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('themeDemo.componentOverrides.textFields')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField label={t('themeDemo.componentOverrides.standardInput')} sx={{ minWidth: 200 }} />
                <TextField label={t('themeDemo.componentOverrides.withHelper')} helperText={t('themeDemo.componentOverrides.helperText')} sx={{ minWidth: 200 }} />
                <TextField label={t('themeDemo.componentOverrides.errorState')} error helperText={t('themeDemo.componentOverrides.errorMessage')} sx={{ minWidth: 200 }} />
                <TextField label={t('themeDemo.componentOverrides.disabled')} disabled sx={{ minWidth: 200 }} />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('themeDemo.componentOverrides.cards')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('themeDemo.componentOverrides.cardTitle')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('themeDemo.componentOverrides.cardContent')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('themeDemo.componentOverrides.elevatedCard')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('themeDemo.componentOverrides.elevatedCardContent')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('themeDemo.componentOverrides.alerts')}
              </Typography>
              <Stack spacing={1}>
                <Alert severity="success">{t('themeDemo.componentOverrides.successAlert')}</Alert>
                <Alert severity="info">{t('themeDemo.componentOverrides.infoAlert')}</Alert>
                <Alert severity="warning">{t('themeDemo.componentOverrides.warningAlert')}</Alert>
                <Alert severity="error">{t('themeDemo.componentOverrides.errorAlert')}</Alert>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Spacing System */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('themeDemo.spacingSystem.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1 }}>
              {t('themeDemo.spacingSystem.padding1')}
            </Box>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
              {t('themeDemo.spacingSystem.padding2')}
            </Box>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
              {t('themeDemo.spacingSystem.padding3')}
            </Box>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4 }}>
              {t('themeDemo.spacingSystem.padding4')}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Info sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="h6" fontWeight={600}>
              {t('themeDemo.usage.title')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('themeDemo.usage.description')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#1e1e1e',
              p: 3,
              borderRadius: 2,
              overflow: 'auto'
            }}
          >
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily: '"Fira Code", Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.875rem',
                lineHeight: 1.7,
                color: '#d4d4d4'
              }}
            >
              <code>{`import { Button, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const theme = useTheme();

// Use MUI components directly - theme is auto-applied
<Button variant="contained">Click Me</Button>

// Use custom theme colors
<Chip
  label="Active"
  sx={{ bgcolor: theme.palette.status.active, color: 'white' }}
/>`}</code>
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
