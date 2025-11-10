'use client';

import React, { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { Home, Settings, Person } from '@mui/icons-material';

// Import all components
import Loading from '@/components/common/Loading';
import Tooltip from '@/components/common/Tooltip';
import Breadcrumb from '@/components/common/Breadcrumb';
import Progress from '@/components/common/Progress';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { Checkbox } from '@/components/common/Checkbox';
import Switch from '@/components/common/Switch';
import Alert from '@/components/common/Alert';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Confirmation from '@/components/common/Confirmation';
import Tab from '@/components/common/Tab';
import Table from '@/components/common/Table';
import Status from '@/components/common/Status';
import PermissionGuard from '@/components/common/PermissionGuard';
import RoleBadge from '@/components/common/RoleBadge';
import Stepper from '@/components/common/Stepper';
import Accordion from '@/components/common/Accordion';
import Menu from '@/components/common/Menu';
import NotificationCenter from '@/components/common/Notification';

export default function UIComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const breadcrumbItems = [
    { label: 'Dev', href: '/dev' },
    { label: 'Components', href: '/dev/components' },
    { label: 'UI Components' }
  ];

  const selectOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' }
  ];

  const tabs = [
    { label: 'Tab 1', value: '1', content: <Box p={2}>Tab 1 Content</Box> },
    { label: 'Tab 2', value: '2', content: <Box p={2}>Tab 2 Content</Box> },
    { label: 'Tab 3', value: '3', content: <Box p={2}>Tab 3 Content</Box> }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
  ];

  const tableColumns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role' }
  ];

  const accordionItems = [
    { id: '1', title: 'Section 1', content: 'Content for section 1' },
    { id: '2', title: 'Section 2', content: 'Content for section 2' }
  ];

  const menuItems = [
    { id: '1', label: 'Edit', icon: <Settings />, onClick: () => alert('Edit') },
    { id: '2', label: 'Delete', icon: <Person />, onClick: () => alert('Delete'), color: 'error' as const }
  ];

  const notifications = [
    { id: '1', title: 'New message', message: 'You have a new message', timestamp: '5 min ago', read: false, type: 'info' as const },
    { id: '2', title: 'Task completed', message: 'Your task has been completed', timestamp: '1 hour ago', read: true, type: 'success' as const }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>UI Components Library</Typography>
      <Breadcrumb items={breadcrumbItems} />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Loading */}
        <Grid item xs={12} md={6}>
          <Card title="Loading" content={<Loading size="medium" />} />
        </Grid>

        {/* Progress */}
        <Grid item xs={12} md={6}>
          <Card title="Progress" content={<Progress value={60} showLabel />} />
        </Grid>

        {/* Tooltip */}
        <Grid item xs={12} md={6}>
          <Card title="Tooltip" content={
            <Tooltip title="This is a tooltip">
              <Button>Hover me</Button>
            </Tooltip>
          } />
        </Grid>

        {/* Alert */}
        <Grid item xs={12} md={6}>
          <Card title="Alert" content={
            <Alert type="success" message="This is a success alert!" />
          } />
        </Grid>

        {/* Input */}
        <Grid item xs={12} md={6}>
          <Card title="Input" content={
            <Input
              label="Enter text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          } />
        </Grid>

        {/* Select */}
        <Grid item xs={12} md={6}>
          <Card title="Select" content={
            <Select
              label="Choose option"
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            />
          } />
        </Grid>

        {/* Switch */}
        <Grid item xs={12} md={6}>
          <Card title="Switch" content={
            <Switch
              label="Enable feature"
              checked={switchChecked}
              onChange={setSwitchChecked}
            />
          } />
        </Grid>

        {/* Checkbox */}
        <Grid item xs={12} md={6}>
          <Card title="Checkbox" content={
            <Checkbox label="Accept terms" />
          } />
        </Grid>

        {/* Badge */}
        <Grid item xs={12} md={6}>
          <Card title="Badge" content={
            <Box display="flex" gap={1} alignItems="center">
              <Badge label="New" color="primary" />
              <Badge label="Hot" color="error" />
              <Badge type="dot" color="success" count={5}>
                <Typography>With dot</Typography>
              </Badge>
            </Box>
          } />
        </Grid>

        {/* Status */}
        <Grid item xs={12} md={6}>
          <Card title="Status" content={
            <Box display="flex" gap={1}>
              <Status type="active" />
              <Status type="pending" />
              <Status type="error" />
            </Box>
          } />
        </Grid>

        {/* Role Badge */}
        <Grid item xs={12} md={6}>
          <Card title="Role Badge" content={
            <Box display="flex" gap={1}>
              <RoleBadge role="admin" />
              <RoleBadge role="user" />
              <RoleBadge role="manager" />
            </Box>
          } />
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Card title="Tabs" content={<Tab tabs={tabs} />} />
        </Grid>

        {/* Table */}
        <Grid item xs={12}>
          <Card title="Table" content={
            <Table columns={tableColumns} data={tableData} />
          } />
        </Grid>

        {/* Accordion */}
        <Grid item xs={12}>
          <Card title="Accordion" content={<Accordion items={accordionItems} />} />
        </Grid>

        {/* Stepper */}
        <Grid item xs={12}>
          <Card title="Stepper" content={
            <Stepper
              steps={[
                { label: 'Step 1', description: 'Select campaign settings' },
                { label: 'Step 2', description: 'Create an ad group' },
                { label: 'Step 3', description: 'Create an ad' }
              ]}
            />
          } />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Card title="Modals & Dialogs" content={
            <Box display="flex" gap={2}>
              <Button variant="contained" onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)}>
                Confirm Action
              </Button>
              <Menu
                items={menuItems}
                trigger={<Button variant="outlined">Open Menu</Button>}
              />
              <NotificationCenter notifications={notifications} />
            </Box>
          } />
        </Grid>

        {/* Permission Guard */}
        <Grid item xs={12}>
          <Card title="Permission Guard" content={
            <PermissionGuard
              permission="admin"
              userPermissions={['user']}
              fallback={<Alert type="warning" message="You need admin permission" />}
            >
              <Alert type="success" message="You have access!" />
            </PermissionGuard>
          } />
        </Grid>
      </Grid>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Modal"
        actions={
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        }
      >
        <Typography>This is modal content</Typography>
      </Modal>

      {/* Confirmation */}
      <Confirmation
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          alert('Confirmed!');
          setConfirmOpen(false);
        }}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
      />
    </Box>
  );
}
