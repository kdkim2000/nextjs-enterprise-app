'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Paper, Stack, useTheme, alpha } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import InlineEditRow, { ToggleConfig, InlineEditValueType } from '@/components/common/InlineEditRow';

interface MockSetting {
  id: string;
  label: string;
  value: string;
  type: InlineEditValueType;
  description?: string;
  isSensitive?: boolean;
  isReady?: boolean;
  isActive?: boolean;
}

export default function InlineEditRowDemoPage() {
  const theme = useTheme();

  // Mock settings data
  const [settings, setSettings] = useState<MockSetting[]>([
    { id: 'app_name', label: 'app_name', value: 'My Application', type: 'string', description: 'Application display name', isReady: true, isActive: true },
    { id: 'max_users', label: 'max_users', value: '100', type: 'number', description: 'Maximum concurrent users', isReady: true, isActive: false },
    { id: 'debug_mode', label: 'debug_mode', value: 'false', type: 'boolean', description: 'Enable debug mode', isReady: false, isActive: false },
    { id: 'api_config', label: 'api_config', value: '{"timeout": 30, "retries": 3}', type: 'json', description: 'API configuration object', isReady: true, isActive: true },
    { id: 'api_key', label: 'api_key', value: 'sk-1234567890abcdef', type: 'string', description: 'Secret API key', isSensitive: true, isReady: true, isActive: false }
  ]);

  const [saving, setSaving] = useState(false);

  // Save handler
  const handleSave = useCallback(async (id: string, value: string) => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
    setSaving(false);
    console.log(`Saved ${id}: ${value}`);
  }, []);

  // Toggle handlers
  const handleToggleReady = useCallback((id: string, value: boolean) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, isReady: value } : s));
  }, []);

  const handleToggleActive = useCallback((id: string, value: boolean) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, isActive: value } : s));
  }, []);

  // Delete handler
  const handleDelete = useCallback((id: string) => {
    setSettings(prev => prev.filter(s => s.id !== id));
    console.log(`Deleted ${id}`);
  }, []);

  // Get border color based on status
  const getBorderColor = (setting: MockSetting) => {
    if (setting.isActive) return theme.palette.success.main;
    if (setting.isReady) return theme.palette.info.main;
    return theme.palette.grey[400];
  };

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          InlineEditRow
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A reusable inline editing row for key-value pairs with multiple toggle support.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          다중 토글을 지원하는 키-값 인라인 편집 행 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Live Demo */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Live Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try editing values inline. Press Enter to save, Esc to cancel.
          </Typography>

          {/* Column Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 1.5,
              py: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              borderLeft: '3px solid transparent'
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ width: 280, flexShrink: 0 }}>
              Key / Description
            </Typography>
            <Typography variant="caption" fontWeight={600} sx={{ width: 70, flexShrink: 0 }}>
              Type
            </Typography>
            <Typography variant="caption" fontWeight={600} sx={{ flex: 1, minWidth: 200 }}>
              Value
            </Typography>
            <Typography variant="caption" fontWeight={600} sx={{ width: 50, textAlign: 'center', color: 'info.main' }}>
              Ready
            </Typography>
            <Typography variant="caption" fontWeight={600} sx={{ width: 50, textAlign: 'center', color: 'success.main' }}>
              Active
            </Typography>
            <Typography variant="caption" fontWeight={600} sx={{ width: 60, textAlign: 'center' }}>
              Actions
            </Typography>
          </Box>

          {/* Settings List */}
          <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderTop: 'none' }}>
            {settings.map((setting) => {
              const toggles: ToggleConfig[] = [
                {
                  value: setting.isReady || false,
                  onChange: (v) => handleToggleReady(setting.id, v),
                  enabledTooltip: 'Ready',
                  disabledTooltip: 'Not Ready',
                  color: theme.palette.info.main
                },
                {
                  value: setting.isActive || false,
                  onChange: (v) => handleToggleActive(setting.id, v),
                  enabledTooltip: 'Active',
                  disabledTooltip: 'Inactive',
                  disabled: !setting.isReady,
                  color: theme.palette.success.main
                }
              ];

              return (
                <InlineEditRow
                  key={setting.id}
                  id={setting.id}
                  label={setting.label}
                  description={setting.description}
                  value={setting.value}
                  valueType={setting.type}
                  isSensitive={setting.isSensitive}
                  onSave={handleSave}
                  onDelete={() => handleDelete(setting.id)}
                  toggles={toggles}
                  saving={saving}
                  borderColor={getBorderColor(setting)}
                  copyTooltip="Copy key"
                  saveTooltip="Save"
                  revertTooltip="Revert"
                  deleteTooltip="Delete"
                />
              );
            })}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Tip: Edit inline, Enter to save, Esc to cancel. Yellow background indicates unsaved changes.
          </Typography>
        </Paper>

        {/* Basic Usage Code */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import InlineEditRow, { ToggleConfig } from '@/components/common/InlineEditRow';

const handleSave = async (id: string, value: string) => {
  await api.update(id, { value });
};

<InlineEditRow
  id="app_name"
  label="app_name"
  description="Application display name"
  value="My App"
  valueType="string"
  onSave={handleSave}
  onDelete={() => handleDelete('app_name')}
/>`}
          </Box>
        </Paper>

        {/* With Toggle Switches */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Toggle Switches
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add multiple toggle switches for status management.
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`const toggles: ToggleConfig[] = [
  {
    value: isReady,
    onChange: (v) => setIsReady(v),
    enabledTooltip: 'Ready',
    disabledTooltip: 'Not Ready',
    color: theme.palette.info.main
  },
  {
    value: isActive,
    onChange: (v) => setIsActive(v),
    enabledTooltip: 'Active',
    disabledTooltip: 'Inactive',
    disabled: !isReady,  // Disable if not ready
    color: theme.palette.success.main
  }
];

<InlineEditRow
  id="setting_key"
  label="setting_key"
  value="value"
  valueType="string"
  onSave={handleSave}
  toggles={toggles}
  borderColor={isActive ? 'green' : isReady ? 'blue' : 'grey'}
/>`}
          </Box>
        </Paper>

        {/* Value Types */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Value Types
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Supports multiple value types with appropriate input rendering.
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>String (default)</Typography>
              <InlineEditRow
                id="demo_string"
                label="string_value"
                value="Hello World"
                valueType="string"
                onSave={handleSave}
                showType
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Number</Typography>
              <InlineEditRow
                id="demo_number"
                label="number_value"
                value="42"
                valueType="number"
                onSave={handleSave}
                showType
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Boolean (Select)</Typography>
              <InlineEditRow
                id="demo_boolean"
                label="boolean_value"
                value="true"
                valueType="boolean"
                onSave={handleSave}
                showType
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>JSON (Multiline)</Typography>
              <InlineEditRow
                id="demo_json"
                label="json_value"
                value='{"key": "value", "count": 10}'
                valueType="json"
                onSave={handleSave}
                showType
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Sensitive (Password)</Typography>
              <InlineEditRow
                id="demo_sensitive"
                label="api_secret"
                value="secret-key-12345"
                valueType="string"
                isSensitive
                onSave={handleSave}
                showType
              />
            </Box>
          </Stack>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mb: 3
            }}
          >
            {`import InlineEditRow, { ToggleConfig, InlineEditValueType } from '@/components/common/InlineEditRow';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            InlineEditValueType
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>&apos;string&apos;</code> - Text input (default)</li>
            <li><code>&apos;number&apos;</code> - Number input</li>
            <li><code>&apos;boolean&apos;</code> - Select dropdown (true/false)</li>
            <li><code>&apos;json&apos;</code> - Multiline text for JSON</li>
            <li><code>&apos;password&apos;</code> - Password input</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            ToggleConfig Interface
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>value</code>: boolean - Current toggle state</li>
            <li><code>onChange</code>: (value: boolean) =&gt; void - Change handler</li>
            <li><code>enabledTooltip</code>?: string - Tooltip when enabled</li>
            <li><code>disabledTooltip</code>?: string - Tooltip when disabled</li>
            <li><code>disabled</code>?: boolean - Disable the toggle</li>
            <li><code>color</code>?: string - Toggle color when enabled</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            InlineEditRowProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>id</code>: string - Unique identifier</li>
            <li><code>label</code>: string - Display label</li>
            <li><code>description</code>?: string - Description text</li>
            <li><code>value</code>: string - Current value</li>
            <li><code>valueType</code>?: InlineEditValueType - Value type (default: &apos;string&apos;)</li>
            <li><code>isSensitive</code>?: boolean - Mask as password</li>
            <li><code>onSave</code>: (id, value) =&gt; Promise - Save handler</li>
            <li><code>onDelete</code>?: () =&gt; void - Delete handler</li>
            <li><code>toggles</code>?: ToggleConfig[] - Array of toggle configs</li>
            <li><code>saving</code>?: boolean - Loading state</li>
            <li><code>labelWidth</code>?: number | string - Label column width</li>
            <li><code>typeWidth</code>?: number | string - Type badge width</li>
            <li><code>showType</code>?: boolean - Show type badge (default: true)</li>
            <li><code>borderColor</code>?: string - Left border color</li>
            <li><code>copyTooltip</code>?: string - Copy button tooltip</li>
            <li><code>saveTooltip</code>?: string - Save button tooltip</li>
            <li><code>revertTooltip</code>?: string - Revert button tooltip</li>
            <li><code>deleteTooltip</code>?: string - Delete button tooltip</li>
          </Box>
        </Paper>

        {/* Use Cases */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Use Cases
          </Typography>
          <Box component="ul">
            <li>App Settings - Inline configuration editing</li>
            <li>Environment Variables - Key-value pair management</li>
            <li>Feature Flags - Toggle-based feature configuration</li>
            <li>Metadata Editor - Edit properties inline</li>
            <li>Configuration Files - Visual config editing</li>
          </Box>
        </Paper>

        {/* Keyboard Shortcuts */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Keyboard Shortcuts
          </Typography>
          <Box component="ul">
            <li><code>Enter</code> - Save changes</li>
            <li><code>Escape</code> - Revert changes</li>
            <li><code>Click label</code> - Copy key to clipboard</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
