'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Alert,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import CodeSelect from '@/components/common/CodeSelect';
import CodeMultiSelect from '@/components/common/CodeMultiSelect';

// Example wrapper component
function ExampleBox({ title, description, children, code }: {
  title: string;
  description: string;
  children: React.ReactNode;
  code: string;
}) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>

      <Box sx={{ mb: 3 }}>
        {children}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Code:
      </Typography>
      <Box
        component="pre"
        sx={{
          bgcolor: 'grey.100',
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
          fontSize: 13,
          fontFamily: 'monospace'
        }}
      >
        <code>{code}</code>
      </Box>
    </Paper>
  );
}

export default function CodeSelectPage() {
  const locale = useCurrentLocale();

  // State for examples
  const [status, setStatus] = useState('active');
  const [role, setRole] = useState('user');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('common');
  const [statusSmall, setStatusSmall] = useState('active');

  // Multi-select states
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['user']);
  const [categories, setCategories] = useState<string[]>([]);

  const codeExamples = {
    basicSelect: `<CodeSelect
  codeType="COMMON_STATUS"
  value={status}
  onChange={setStatus}
  label="Status"
  required
/>`,
    roleSelect: `<CodeSelect
  codeType="USER_ROLE"
  value={role}
  onChange={setRole}
  label="User Role"
  required
/>`,
    departmentEmpty: `<CodeSelect
  codeType="DEPARTMENT"
  value={department}
  onChange={setDepartment}
  label="Department"
  showEmpty
  emptyLabel="None"
/>`,
    categorySelect: `<CodeSelect
  codeType="CODE_TYPE_CATEGORY"
  value={category}
  onChange={setCategory}
  label="Category"
  locale={locale}
/>`,
    smallSize: `<CodeSelect
  codeType="COMMON_STATUS"
  value={statusSmall}
  onChange={setStatusSmall}
  label="Status"
  size="small"
/>`,
    multiDepartments: `<CodeMultiSelect
  codeType="DEPARTMENT"
  value={departments}
  onChange={setDepartments}
  label="Departments"
  showCheckbox
  renderChips
/>`,
    multiRoles: `<CodeMultiSelect
  codeType="USER_ROLE"
  value={selectedRoles}
  onChange={setSelectedRoles}
  label="User Roles"
  showCheckbox
  renderChips
  maxChipsDisplay={2}
/>`,
    multiNoChips: `<CodeMultiSelect
  codeType="CODE_TYPE_CATEGORY"
  value={categories}
  onChange={setCategories}
  label="Categories"
  showCheckbox={false}
  renderChips={false}
/>`
  };

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          CodeSelect & CodeMultiSelect
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Database-driven select components that automatically load options from the code management system.
          Just provide the <code>codeType</code> prop and the component handles the rest.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          코드 관리 시스템에서 자동으로 옵션을 로드하는 Select 컴포넌트입니다.
          <code>codeType</code>만 지정하면 자동으로 옵션이 로드됩니다.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <strong>Key Benefits:</strong> No hardcoded options, automatic multi-language support,
        centralized management through admin panel, and 54% less code compared to traditional Select.
      </Alert>

      {/* CodeSelect Examples */}
      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4, mb: 3 }}>
        CodeSelect (Single Selection)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ExampleBox
            title="1. Basic Usage - Status Select"
            description="Most common use case with COMMON_STATUS code type (active, inactive, pending)"
            code={codeExamples.basicSelect}
          >
            <CodeSelect
              codeType="COMMON_STATUS"
              value={status}
              onChange={setStatus}
              label="Status"
              required
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Current value: <strong>{status}</strong>
            </Typography>
          </ExampleBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <ExampleBox
            title="2. Role Selection"
            description="Select user role using USER_ROLE code type (admin, manager, user, guest)"
            code={codeExamples.roleSelect}
          >
            <CodeSelect
              codeType="USER_ROLE"
              value={role}
              onChange={setRole}
              label="User Role"
              required
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Current value: <strong>{role}</strong>
            </Typography>
          </ExampleBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <ExampleBox
            title="3. With Empty Option"
            description="Department select with optional empty value using showEmpty prop"
            code={codeExamples.departmentEmpty}
          >
            <CodeSelect
              codeType="DEPARTMENT"
              value={department}
              onChange={setDepartment}
              label="Department"
              showEmpty
              emptyLabel="None"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Current value: <strong>{department || '(empty)'}</strong>
            </Typography>
          </ExampleBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <ExampleBox
            title="4. With Locale Support"
            description="Category select with automatic language switching based on locale prop"
            code={codeExamples.categorySelect}
          >
            <CodeSelect
              codeType="CODE_TYPE_CATEGORY"
              value={category}
              onChange={setCategory}
              label="Category"
              locale={locale}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Current value: <strong>{category}</strong> | Locale: <strong>{locale}</strong>
            </Typography>
          </ExampleBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <ExampleBox
            title="5. Small Size"
            description="Compact size variant using size='small' prop"
            code={codeExamples.smallSize}
          >
            <CodeSelect
              codeType="COMMON_STATUS"
              value={statusSmall}
              onChange={setStatusSmall}
              label="Status"
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Current value: <strong>{statusSmall}</strong>
            </Typography>
          </ExampleBox>
        </Grid>
      </Grid>

      {/* CodeMultiSelect Examples */}
      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 6, mb: 3 }}>
        CodeMultiSelect (Multiple Selection)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ExampleBox
            title="1. Basic Multi-Select with Chips"
            description="Select multiple departments with checkboxes and chip rendering"
            code={codeExamples.multiDepartments}
          >
            <CodeMultiSelect
              codeType="DEPARTMENT"
              value={departments}
              onChange={setDepartments}
              label="Departments"
              showCheckbox
              renderChips
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Selected: <strong>{departments.length}</strong> departments
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {departments.map(dept => (
                  <Chip key={dept} label={dept} size="small" color="primary" />
                ))}
              </Box>
            </Box>
          </ExampleBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <ExampleBox
            title="2. With Max Chips Display"
            description="Limit the number of chips shown with maxChipsDisplay prop"
            code={codeExamples.multiRoles}
          >
            <CodeMultiSelect
              codeType="USER_ROLE"
              value={selectedRoles}
              onChange={setSelectedRoles}
              label="User Roles"
              showCheckbox
              renderChips
              maxChipsDisplay={2}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Selected: <strong>{selectedRoles.length}</strong> roles - Shows max 2 chips, rest as "+X more"
            </Typography>
          </ExampleBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <ExampleBox
            title="3. Without Checkboxes and Chips"
            description="Minimal multi-select showing text-based selected values"
            code={codeExamples.multiNoChips}
          >
            <CodeMultiSelect
              codeType="CODE_TYPE_CATEGORY"
              value={categories}
              onChange={setCategories}
              label="Categories"
              showCheckbox={false}
              renderChips={false}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Selected: <strong>{categories.join(', ') || '(none)'}</strong>
            </Typography>
          </ExampleBox>
        </Grid>
      </Grid>

      {/* Props Documentation */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Props Documentation
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
          CodeSelect Props
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Prop</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Required</strong></TableCell>
                <TableCell><strong>Default</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><code>codeType</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Code type identifier (e.g., 'COMMON_STATUS')</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>value</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Currently selected value</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>onChange</code></TableCell>
                <TableCell>(value: string) =&gt; void</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Value change handler</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>label</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Field label</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>required</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>No</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Required field indicator</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>showEmpty</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>No</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Show empty option</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>emptyLabel</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>No</TableCell>
                <TableCell>'All'</TableCell>
                <TableCell>Label for empty option</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>size</code></TableCell>
                <TableCell>'small' | 'medium'</TableCell>
                <TableCell>No</TableCell>
                <TableCell>'medium'</TableCell>
                <TableCell>Input size</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>locale</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>No</TableCell>
                <TableCell>current</TableCell>
                <TableCell>Language for labels</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>disabled</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>No</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Disable input</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
          CodeMultiSelect Props
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Prop</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Required</strong></TableCell>
                <TableCell><strong>Default</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><code>codeType</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Code type identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>value</code></TableCell>
                <TableCell>string[]</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Currently selected values (array)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>onChange</code></TableCell>
                <TableCell>(value: string[]) =&gt; void</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Value change handler</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>label</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Field label</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>showCheckbox</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>No</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Show checkboxes in dropdown</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>renderChips</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>No</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Render selected items as chips</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>maxChipsDisplay</code></TableCell>
                <TableCell>number</TableCell>
                <TableCell>No</TableCell>
                <TableCell>2</TableCell>
                <TableCell>Max chips to display before "+X more"</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>locale</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>No</TableCell>
                <TableCell>current</TableCell>
                <TableCell>Language for labels</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>disabled</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>No</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Disable input</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Available Code Types */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Available Code Types
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Code Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Example Values</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><code>COMMON_STATUS</code></TableCell>
                <TableCell>Common status values</TableCell>
                <TableCell>active, inactive, pending</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>USER_ROLE</code></TableCell>
                <TableCell>User role types</TableCell>
                <TableCell>admin, manager, user, guest</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>DEPARTMENT</code></TableCell>
                <TableCell>Organization departments</TableCell>
                <TableCell>Admin, Design, Engineering, Sales...</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>MESSAGE_CATEGORY</code></TableCell>
                <TableCell>Message categories</TableCell>
                <TableCell>common, validation, auth, user, system</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>MESSAGE_TYPE</code></TableCell>
                <TableCell>Message types</TableCell>
                <TableCell>success, error, warning, info</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>CODE_TYPE_CATEGORY</code></TableCell>
                <TableCell>Code type categories</TableCell>
                <TableCell>user, organization, system, workflow, common</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>PROGRAM_CATEGORY</code></TableCell>
                <TableCell>Program categories</TableCell>
                <TableCell>Various program classifications</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>PROGRAM_TYPE</code></TableCell>
                <TableCell>Program types</TableCell>
                <TableCell>Various program types</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>ICON_TYPE</code></TableCell>
                <TableCell>Material-UI icon types</TableCell>
                <TableCell>Dashboard, Settings, Person...</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>ROLE_CATEGORY</code></TableCell>
                <TableCell>Role categories</TableCell>
                <TableCell>general, management</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>LANGUAGE</code></TableCell>
                <TableCell>Supported languages</TableCell>
                <TableCell>en, ko, zh, vi</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'success.lighter', borderRadius: 2, border: 1, borderColor: 'success.light' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          ✅ Key Benefits
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              54% Code Reduction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              From 13 lines (traditional Select with hardcoded MenuItems) to 6 lines with CodeSelect
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              No Hardcoding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All options come from database - add/edit/remove through admin panel without touching code
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Automatic Multi-Language
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports en, ko, zh, vi - labels automatically switch based on locale
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Auto Loading State
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built-in loading spinner and disabled state during data fetch
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Consistent UX
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All selects across the app use the same styling and behavior from MUI theme
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Easy Maintenance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all dropdown options centrally in database instead of scattered across codebase
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Usage Example in Forms */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'info.lighter', borderRadius: 2, border: 1, borderColor: 'info.light' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          💡 Real-World Form Example
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Here's how to use CodeSelect in a typical form component:
        </Typography>

        <Box
          component="pre"
          sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: 13,
            fontFamily: 'monospace'
          }}
        >
          <code>{`import CodeSelect from '@/components/common/CodeSelect';

function UserForm({ user, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...user, [field]: value });
  };

  return (
    <>
      <TextField
        label="Username"
        value={user.username || ''}
        onChange={(e) => handleChange('username', e.target.value)}
        required
      />

      <CodeSelect
        codeType="USER_ROLE"
        value={user.role || 'user'}
        onChange={(value) => handleChange('role', value)}
        label="Role"
        required
      />

      <CodeSelect
        codeType="DEPARTMENT"
        value={user.department || ''}
        onChange={(value) => handleChange('department', value)}
        label="Department"
        showEmpty
        emptyLabel="None"
      />

      <CodeSelect
        codeType="COMMON_STATUS"
        value={user.status || 'active'}
        onChange={(value) => handleChange('status', value)}
        label="Status"
        required
      />
    </>
  );
}`}</code>
        </Box>
      </Box>
    </PageContainer>
  );
}
