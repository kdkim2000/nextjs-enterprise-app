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

export default function ThemeDemoPage() {
  const theme = useTheme();

  return (
    <PageContainer sx={{ height: 'auto', minHeight: '100vh', overflow: 'auto' }}>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Theme System Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Demonstration of the comprehensive MUI Theme system with custom colors, typography, and component overrides.
        </Typography>
      </Box>

      {/* Typography Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            1. Typography System
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Headings
              </Typography>
              <Stack spacing={1}>
                <Typography variant="h1">Heading 1 - 2.5rem / 700</Typography>
                <Typography variant="h2">Heading 2 - 2rem / 700</Typography>
                <Typography variant="h3">Heading 3 - 1.75rem / 600</Typography>
                <Typography variant="h4">Heading 4 - 1.5rem / 600</Typography>
                <Typography variant="h5">Heading 5 - 1.25rem / 600</Typography>
                <Typography variant="h6">Heading 6 - 1rem / 600</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Body Text
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  Body 1 - 1rem (16px) - Default body text with comfortable reading size
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Body 2 - 0.875rem (14px) - Secondary information text
                </Typography>
                <Typography variant="caption" display="block">
                  Caption - 0.75rem (12px) - Small supplementary text
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
            2. Custom Status Colors
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
                <Typography variant="h6">Active</Typography>
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
                <Typography variant="h6">Inactive</Typography>
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
                <Typography variant="h6">Pending</Typography>
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
                <Typography variant="h6">Info</Typography>
                <Typography variant="caption">{theme.palette.status.info}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Status Chips:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="Active"
                icon={<CheckCircle />}
                sx={{ bgcolor: theme.palette.status.active, color: 'white' }}
              />
              <Chip
                label="Inactive"
                sx={{ bgcolor: theme.palette.status.inactive, color: 'white' }}
              />
              <Chip
                label="Pending"
                sx={{ bgcolor: theme.palette.status.pending, color: 'white' }}
              />
              <Chip
                label="Success"
                sx={{ bgcolor: theme.palette.status.success, color: 'white' }}
              />
              <Chip
                label="Error"
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
            3. Custom Role Colors
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
                  Admin
                </Typography>
                <Chip
                  label="Admin"
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
                  Manager
                </Typography>
                <Chip
                  label="Manager"
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
                  Moderator
                </Typography>
                <Chip
                  label="Moderator"
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
                  User
                </Typography>
                <Chip
                  label="User"
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
                  Guest
                </Typography>
                <Chip
                  label="Guest"
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
            4. Component Overrides (Auto-Applied)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Buttons (borderRadius: 8, no elevation, textTransform: none)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button variant="contained">Contained Button</Button>
                <Button variant="outlined">Outlined Button</Button>
                <Button variant="text">Text Button</Button>
                <Button variant="contained" color="secondary">
                  Secondary
                </Button>
                <Button variant="contained" color="error">
                  Error
                </Button>
                <Button variant="contained" color="success">
                  Success
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Text Fields (size: small, borderRadius: 8)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField label="Standard Input" sx={{ minWidth: 200 }} />
                <TextField label="With Helper" helperText="Helper text" sx={{ minWidth: 200 }} />
                <TextField label="Error State" error helperText="Error message" sx={{ minWidth: 200 }} />
                <TextField label="Disabled" disabled sx={{ minWidth: 200 }} />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cards (borderRadius: 12, subtle shadow)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Card Title
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Card content with automatic theme styling applied.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Elevated Card
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Card with custom elevation.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Alerts (automatic styling)
              </Typography>
              <Stack spacing={1}>
                <Alert severity="success">Success alert with theme colors</Alert>
                <Alert severity="info">Info alert with theme colors</Alert>
                <Alert severity="warning">Warning alert with theme colors</Alert>
                <Alert severity="error">Error alert with theme colors</Alert>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Spacing System */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            5. Spacing System (8px base unit)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1 }}>
              p: 1 = 8px padding
            </Box>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
              p: 2 = 16px padding
            </Box>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
              p: 3 = 24px padding
            </Box>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4 }}>
              p: 4 = 32px padding
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
              How to Use the Theme System
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            All theme features are automatically applied when using MUI components. No wrapper components needed!
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
