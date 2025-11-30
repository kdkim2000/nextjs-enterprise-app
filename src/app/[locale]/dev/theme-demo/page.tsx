'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  Alert,
  Avatar,
  Stack,
  Collapse,
  IconButton
} from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import {
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  AdminPanelSettings,
  Person,
  Star,
  ExpandMore,
  ExpandLess,
  Palette
} from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';
import { themeSections, ThemeSection } from './themeSections';

export default function ThemeDemoPage() {
  const theme = useTheme();
  const t = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(themeSections.map((s) => s.id))
  );

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return themeSections;

    const term = searchTerm.toLowerCase();
    return themeSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.tags.some((tag) => tag.toLowerCase().includes(term)) ||
            section.category.toLowerCase().includes(term)
        )
      }))
      .filter((section) => section.items.length > 0);
  }, [searchTerm]);

  // Count total items
  const totalCount = useMemo(
    () => themeSections.reduce((acc, sec) => acc + sec.items.length, 0),
    []
  );

  const filteredCount = useMemo(
    () => filteredSections.reduce((acc, sec) => acc + sec.items.length, 0),
    [filteredSections]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSearch = useCallback(() => {
    // Client-side filtering - no action needed
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const renderSectionContent = (section: ThemeSection) => {
    switch (section.id) {
      case 'typography':
        return <TypographySection t={t} />;
      case 'status':
        return <StatusColorsSection t={t} theme={theme} />;
      case 'role':
        return <RoleColorsSection t={t} theme={theme} />;
      case 'components':
        return <ComponentOverridesSection t={t} />;
      case 'spacing':
        return <SpacingSection t={t} />;
      case 'usage':
        return <UsageSection t={t} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 10
        }}
      >
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Sticky Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <QuickSearchBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search theme elements by name, description, or tag..."
                showAdvancedButton={false}
              />
            </Box>
            <Chip
              icon={<Palette sx={{ fontSize: 16 }} />}
              label={searchTerm ? `${filteredCount} / ${totalCount}` : `${totalCount} elements`}
              size="small"
              color={searchTerm && filteredCount === 0 ? 'error' : 'default'}
              sx={{ fontWeight: 500, flexShrink: 0 }}
            />
          </Box>
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PageContainer sx={{ py: 2 }}>
          {/* Theme Sections */}
          {filteredSections.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                color: 'text.secondary'
              }}
            >
              <Palette sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No theme elements found
              </Typography>
              <Typography variant="body2">Try searching with different keywords</Typography>
            </Box>
          ) : (
            filteredSections.map((section) => (
              <Box key={section.id} sx={{ mb: 3 }}>
                {/* Section Header */}
                <Card
                  sx={{
                    mb: expandedSections.has(section.id) ? 0 : 0,
                    borderBottomLeftRadius: expandedSections.has(section.id) ? 0 : undefined,
                    borderBottomRightRadius: expandedSections.has(section.id) ? 0 : undefined,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                  onClick={() => toggleSection(section.id)}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          bgcolor: `${section.color}15`,
                          mr: 2
                        }}
                      >
                        <section.icon sx={{ fontSize: 22, color: section.color }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {t(section.categoryKey as Parameters<typeof t>[0]) || section.category}
                          </Typography>
                          <Chip
                            label={section.items.length}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.75rem',
                              bgcolor: `${section.color}20`,
                              color: section.color,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        {expandedSections.has(section.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>

                {/* Section Content */}
                <Collapse in={expandedSections.has(section.id)}>
                  <Card
                    sx={{
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <CardContent>{renderSectionContent(section)}</CardContent>
                  </Card>
                </Collapse>
              </Box>
            ))
          )}

          {/* Theme Strategy Box */}
          {!searchTerm && (
            <Box
              sx={{
                mt: 4,
                p: 2.5,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                border: 1,
                borderColor: 'info.light'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Theme Strategy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    1. Custom Palette
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Status colors, Role colors, Extended palette
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    2. Component Overrides
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Default props, Style overrides, Variants
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    3. Typography System
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Font families, Sizes, Line heights
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </PageContainer>
      </Box>
    </Box>
  );
}

// Typography Section Component
function TypographySection({ t }: { t: ReturnType<typeof useI18n> }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
          {t('themeDemo.typography.headings')}
        </Typography>
        <Grid container spacing={2}>
          {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((variant) => (
            <Grid item xs={12} sm={6} md={4} key={variant}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 1, borderColor: 'primary.main' }
                }}
              >
                <Chip label={variant.toUpperCase()} size="small" sx={{ mb: 1 }} />
                <Typography variant={variant} noWrap>
                  {t(`themeDemo.typography.heading${variant.slice(1)}` as Parameters<typeof t>[0])}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
          {t('themeDemo.typography.bodyText')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 1, borderColor: 'primary.main' }
              }}
            >
              <Chip label="body1" size="small" sx={{ mb: 1 }} />
              <Typography variant="body1">{t('themeDemo.typography.body1')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 1, borderColor: 'primary.main' }
              }}
            >
              <Chip label="body2" size="small" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('themeDemo.typography.body2')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 1, borderColor: 'primary.main' }
              }}
            >
              <Chip label="caption" size="small" sx={{ mb: 1 }} />
              <Typography variant="caption" display="block">
                {t('themeDemo.typography.caption')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}

// Status Colors Section Component
function StatusColorsSection({
  t,
  theme
}: {
  t: ReturnType<typeof useI18n>;
  theme: Theme;
}) {
  const statusItems = [
    { key: 'active', color: theme.palette.status.active, icon: CheckCircle },
    { key: 'inactive', color: theme.palette.status.inactive, icon: ErrorIcon },
    { key: 'pending', color: theme.palette.status.pending, icon: Warning },
    { key: 'info', color: theme.palette.status.info, icon: Info },
    { key: 'success', color: theme.palette.status.success, icon: CheckCircle },
    { key: 'error', color: theme.palette.status.error, icon: ErrorIcon }
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {statusItems.map(({ key, color, icon: Icon }) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <Paper
              sx={{
                p: 2,
                bgcolor: color,
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
              }}
            >
              <Icon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                {t(`themeDemo.statusColors.${key}` as Parameters<typeof t>[0])}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {color}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          {t('themeDemo.statusColors.statusChips')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {statusItems.map(({ key, color, icon: Icon }) => (
            <Chip
              key={key}
              label={t(`themeDemo.statusColors.${key}` as Parameters<typeof t>[0])}
              icon={<Icon />}
              sx={{
                bgcolor: color,
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

// Role Colors Section Component
function RoleColorsSection({
  t,
  theme
}: {
  t: ReturnType<typeof useI18n>;
  theme: Theme;
}) {
  const roleItems = [
    { key: 'admin', color: theme.palette.role.admin, icon: AdminPanelSettings },
    { key: 'manager', color: theme.palette.role.manager, icon: Star },
    { key: 'moderator', color: theme.palette.role.moderator, text: 'M' },
    { key: 'user', color: theme.palette.role.user, icon: Person },
    { key: 'guest', color: theme.palette.role.guest, text: 'G' }
  ];

  return (
    <Grid container spacing={3}>
      {roleItems.map((item) => (
        <Grid item xs={6} sm={4} md={2.4} key={item.key}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: 2, borderColor: item.color }
            }}
          >
            <Avatar
              sx={{
                bgcolor: item.color,
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 1.5,
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              {item.icon ? <item.icon /> : item.text}
            </Avatar>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {t(`themeDemo.roleColors.${item.key}` as Parameters<typeof t>[0])}
            </Typography>
            <Chip
              label={item.color}
              size="small"
              sx={{
                bgcolor: item.color,
                color: 'white',
                fontSize: '0.65rem'
              }}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

// Component Overrides Section Component
function ComponentOverridesSection({
  t
}: {
  t: ReturnType<typeof useI18n>;
}) {
  return (
    <Stack spacing={3}>
      {/* Buttons */}
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
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

      {/* Text Fields */}
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          {t('themeDemo.componentOverrides.textFields')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t('themeDemo.componentOverrides.standardInput')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t('themeDemo.componentOverrides.withHelper')}
              helperText={t('themeDemo.componentOverrides.helperText')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t('themeDemo.componentOverrides.errorState')}
              error
              helperText={t('themeDemo.componentOverrides.errorMessage')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t('themeDemo.componentOverrides.disabled')}
              disabled
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Cards */}
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          {t('themeDemo.componentOverrides.cards')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
              }}
            >
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
            <Card
              elevation={3}
              sx={{
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 }
              }}
            >
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

      {/* Alerts */}
      <Box>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          {t('themeDemo.componentOverrides.alerts')}
        </Typography>
        <Stack spacing={1}>
          <Alert severity="success" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 1 } }}>
            {t('themeDemo.componentOverrides.successAlert')}
          </Alert>
          <Alert severity="info" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 1 } }}>
            {t('themeDemo.componentOverrides.infoAlert')}
          </Alert>
          <Alert severity="warning" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 1 } }}>
            {t('themeDemo.componentOverrides.warningAlert')}
          </Alert>
          <Alert severity="error" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 1 } }}>
            {t('themeDemo.componentOverrides.errorAlert')}
          </Alert>
        </Stack>
      </Box>
    </Stack>
  );
}

// Spacing Section Component
function SpacingSection({ t }: { t: ReturnType<typeof useI18n> }) {
  const spacings = [
    { p: 1, label: 'p={1}', value: '8px' },
    { p: 2, label: 'p={2}', value: '16px' },
    { p: 3, label: 'p={3}', value: '24px' },
    { p: 4, label: 'p={4}', value: '32px' }
  ];

  return (
    <Grid container spacing={2}>
      {spacings.map(({ p, label, value }) => (
        <Grid item xs={12} sm={6} md={3} key={p}>
          <Paper
            variant="outlined"
            sx={{
              transition: 'all 0.2s',
              '&:hover': { boxShadow: 1, borderColor: 'primary.main' }
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p,
                borderRadius: 1,
                m: 1,
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {label}
              </Typography>
              <Typography variant="caption">{value}</Typography>
            </Box>
            <Typography variant="caption" display="block" textAlign="center" sx={{ pb: 1 }}>
              {t(`themeDemo.spacingSystem.padding${p}` as Parameters<typeof t>[0])}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

// Usage Section Component
function UsageSection({ t }: { t: ReturnType<typeof useI18n> }) {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
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
    </Stack>
  );
}
