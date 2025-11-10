'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  LinearProgress,
  Tooltip as MuiTooltip,
  Alert as MuiAlert,
  AlertTitle,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  Switch as MuiSwitch,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  Badge as MuiBadge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab as MuiTab,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Stepper as MuiStepper,
  Step,
  StepLabel,
  Menu as MuiMenu,
  Skeleton,
  IconButton,
  Divider,
  Card as MuiCard,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  Home,
  Settings,
  Person,
  ExpandMore,
  Close,
  MoreVert,
  Inbox
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';

// Keep business logic components
import Status from '@/components/common/Status';
import PermissionGuard from '@/components/common/PermissionGuard';
import RoleBadge from '@/components/common/RoleBadge';
import NotificationCenter from '@/components/common/Notification';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UIComponentsDemo() {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const selectOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          UI Components - MUI Direct Usage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          All components now use MUI directly without unnecessary wrappers. Theme system provides consistent styling.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Loading Indicators */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Loading Indicators" />
            <CardContent>
              <Box display="flex" gap={3} alignItems="center" flexDirection="column">
                <Box display="flex" gap={2} alignItems="center">
                  <CircularProgress size={30} />
                  <CircularProgress size={40} />
                  <CircularProgress size={50} />
                </Box>
                <Box width="100%">
                  <LinearProgress sx={{ mb: 2 }} />
                  <LinearProgress variant="determinate" value={60} />
                </Box>
                <Box width="100%">
                  <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                  <Skeleton variant="rectangular" height={60} sx={{ my: 1 }} />
                  <Skeleton variant="rounded" height={60} />
                </Box>
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Tooltip */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Tooltips (MUI)" />
            <CardContent>
              <Box display="flex" gap={2} flexWrap="wrap">
                <MuiTooltip title="Default Tooltip" arrow>
                  <Button variant="outlined">Hover me</Button>
                </MuiTooltip>
                <MuiTooltip title="Top placement" placement="top" arrow>
                  <Button variant="outlined">Top</Button>
                </MuiTooltip>
                <MuiTooltip title="Right placement" placement="right" arrow>
                  <Button variant="outlined">Right</Button>
                </MuiTooltip>
                <MuiTooltip title="Bottom placement" placement="bottom" arrow>
                  <Button variant="outlined">Bottom</Button>
                </MuiTooltip>
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Alerts (MUI)" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <MuiAlert severity="success">
                  <AlertTitle>Success</AlertTitle>
                  This is a success alert — check it out!
                </MuiAlert>
                <MuiAlert severity="info">
                  <AlertTitle>Info</AlertTitle>
                  This is an info alert — check it out!
                </MuiAlert>
                <MuiAlert severity="warning">
                  <AlertTitle>Warning</AlertTitle>
                  This is a warning alert — check it out!
                </MuiAlert>
                <MuiAlert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  This is an error alert — check it out!
                </MuiAlert>
                <MuiAlert
                  severity="info"
                  onClose={() => {}}
                  action={
                    <IconButton size="small" aria-label="close" color="inherit">
                      <Close fontSize="small" />
                    </IconButton>
                  }
                >
                  Alert with close button
                </MuiAlert>
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Form Inputs */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Text Input (MUI TextField)" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Standard Input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="With Helper Text"
                  helperText="This is helper text"
                  fullWidth
                />
                <TextField
                  label="Error State"
                  error
                  helperText="This field has an error"
                  fullWidth
                />
                <TextField
                  label="Disabled"
                  disabled
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                />
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Select */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Select Dropdown (MUI)" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Choose option</InputLabel>
                  <MuiSelect
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    label="Choose option"
                  >
                    {selectOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>With Icons</InputLabel>
                  <MuiSelect label="With Icons" defaultValue="home">
                    <MenuItem value="home">
                      <Box display="flex" gap={1} alignItems="center">
                        <Home fontSize="small" />
                        <span>Home</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="settings">
                      <Box display="flex" gap={1} alignItems="center">
                        <Settings fontSize="small" />
                        <span>Settings</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="person">
                      <Box display="flex" gap={1} alignItems="center">
                        <Person fontSize="small" />
                        <span>Person</span>
                      </Box>
                    </MenuItem>
                  </MuiSelect>
                </FormControl>
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Switch & Checkbox */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Switch & Checkbox (MUI)" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <MuiSwitch
                      checked={switchChecked}
                      onChange={(e) => setSwitchChecked(e.target.checked)}
                    />
                  }
                  label="Enable feature"
                />
                <FormControlLabel
                  control={<MuiSwitch defaultChecked />}
                  label="Default checked"
                />
                <FormControlLabel
                  control={<MuiSwitch disabled />}
                  label="Disabled"
                />
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <MuiCheckbox
                      checked={checkboxChecked}
                      onChange={(e) => setCheckboxChecked(e.target.checked)}
                    />
                  }
                  label="Accept terms"
                />
                <FormControlLabel
                  control={<MuiCheckbox defaultChecked />}
                  label="Default checked"
                />
                <FormControlLabel
                  control={<MuiCheckbox disabled />}
                  label="Disabled"
                />
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Badges & Chips */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Badges & Chips (MUI)" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <Chip label="Default" />
                  <Chip label="Primary" color="primary" />
                  <Chip label="Secondary" color="secondary" />
                  <Chip label="Success" color="success" />
                  <Chip label="Error" color="error" />
                  <Chip label="Warning" color="warning" />
                  <Chip label="Info" color="info" />
                </Box>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <Chip label="Outlined" variant="outlined" />
                  <Chip label="Deletable" onDelete={() => {}} />
                  <Chip label="Clickable" onClick={() => {}} />
                  <Chip label="With Icon" icon={<Settings />} />
                </Box>
                <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
                  <MuiBadge badgeContent={4} color="primary">
                    <Inbox />
                  </MuiBadge>
                  <MuiBadge badgeContent={10} color="secondary">
                    <Inbox />
                  </MuiBadge>
                  <MuiBadge badgeContent={99} color="error">
                    <Inbox />
                  </MuiBadge>
                  <MuiBadge variant="dot" color="success">
                    <Inbox />
                  </MuiBadge>
                </Box>
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Business Logic Components (Keep these) */}
        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Status (Business Logic Component)" />
            <CardContent>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Status type="active" />
                <Status type="pending" />
                <Status type="error" />
                <Status type="inactive" />
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <MuiCard>
            <CardHeader title="Role Badge (Business Logic)" />
            <CardContent>
              <Box display="flex" gap={2} flexWrap="wrap">
                <RoleBadge role="admin" />
                <RoleBadge role="manager" />
                <RoleBadge role="user" />
                <RoleBadge role="guest" />
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Tabs (MUI)" />
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <MuiTab label="Tab 1" />
                  <MuiTab label="Tab 2" />
                  <MuiTab label="Tab 3" />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <Typography>Content for Tab 1</Typography>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Typography>Content for Tab 2</Typography>
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Typography>Content for Tab 3</Typography>
              </TabPanel>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Table */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Table (MUI)" />
            <CardContent>
              <TableContainer>
                <MuiTable>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <Chip label={row.role} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </MuiTable>
              </TableContainer>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Accordion */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Accordion (MUI)" />
            <CardContent>
              <MuiAccordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Section 1</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Content for section 1. This is an example of accordion content using MUI components directly.
                  </Typography>
                </AccordionDetails>
              </MuiAccordion>
              <MuiAccordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Section 2</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Content for section 2. Notice how theme styles are automatically applied.
                  </Typography>
                </AccordionDetails>
              </MuiAccordion>
              <MuiAccordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Section 3</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Content for section 3. All styling comes from the theme system.
                  </Typography>
                </AccordionDetails>
              </MuiAccordion>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Stepper */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Stepper (MUI)" />
            <CardContent>
              <MuiStepper activeStep={1}>
                <Step>
                  <StepLabel>
                    <Typography variant="body2">Step 1</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select campaign settings
                    </Typography>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel>
                    <Typography variant="body2">Step 2</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create an ad group
                    </Typography>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel>
                    <Typography variant="body2">Step 3</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create an ad
                    </Typography>
                  </StepLabel>
                </Step>
              </MuiStepper>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Modals & Menus */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Modals, Dialogs & Menus (MUI)" />
            <CardContent>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" onClick={() => setModalOpen(true)}>
                  Open Dialog
                </Button>
                <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)}>
                  Confirm Action
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<MoreVert />}
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                  Open Menu
                </Button>
                <NotificationCenter
                  notifications={[
                    {
                      id: '1',
                      title: 'New message',
                      message: 'You have a new message',
                      timestamp: '5 min ago',
                      read: false,
                      type: 'info'
                    },
                    {
                      id: '2',
                      title: 'Task completed',
                      message: 'Your task has been completed',
                      timestamp: '1 hour ago',
                      read: true,
                      type: 'success'
                    }
                  ]}
                />
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Permission Guard (Business Logic) */}
        <Grid item xs={12}>
          <MuiCard>
            <CardHeader title="Permission Guard (Business Logic Component)" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <PermissionGuard
                  permission="admin"
                  userPermissions={['admin', 'user']}
                  fallback={
                    <MuiAlert severity="warning">
                      You need admin permission to view this content
                    </MuiAlert>
                  }
                >
                  <MuiAlert severity="success">
                    <AlertTitle>Access Granted</AlertTitle>
                    You have admin permission and can view this content!
                  </MuiAlert>
                </PermissionGuard>

                <PermissionGuard
                  permission="admin"
                  userPermissions={['user']}
                  fallback={
                    <MuiAlert severity="error">
                      Access denied - Admin permission required
                    </MuiAlert>
                  }
                >
                  <MuiAlert severity="success">This should not be visible</MuiAlert>
                </PermissionGuard>
              </Box>
            </CardContent>
          </MuiCard>
        </Grid>
      </Grid>

      {/* Modal Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Sample Dialog</Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            This is a MUI Dialog component used directly. No wrapper needed!
            Theme styles are automatically applied for consistent look and feel.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setModalOpen(false)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to proceed? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              alert('Confirmed!');
              setConfirmOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <MuiMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { alert('Edit'); setMenuAnchor(null); }}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { alert('Delete'); setMenuAnchor(null); }}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </MuiMenu>

      {/* Info Banner */}
      <MuiAlert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>Migration Complete</AlertTitle>
        All components now use MUI directly. Simple wrapper components have been removed.
        Business logic components (Status, RoleBadge, PermissionGuard, NotificationCenter) are retained
        as they provide project-specific functionality beyond simple UI rendering.
      </MuiAlert>
    </PageContainer>
  );
}
