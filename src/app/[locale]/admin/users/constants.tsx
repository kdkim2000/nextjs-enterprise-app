'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Box, Avatar } from '@mui/material';
import { getAvatarUrl } from '@/lib/config';
import ActionsCell from '@/components/common/ActionsCell';
import { User } from './types';

export const DEPARTMENTS = [
  'Admin', 'Design', 'Engineering', 'Finance', 'HR', 'IT',
  'Legal', 'Marketing', 'Operations', 'Product', 'Sales', 'Support'
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  handleEdit: (id: string | number) => void,
  handleResetPassword?: (id: string | number) => void
): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'avatarUrl',
    headerName: 'Avatar',
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const user = params.row as User;
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <Avatar
            src={getAvatarUrl(user.avatarUrl)}
            alt={user.name}
            sx={{ width: 32, height: 32 }}
          >
            {!user.avatarUrl && user.name?.substring(0, 2).toUpperCase()}
          </Avatar>
        </Box>
      );
    }
  },
  { field: 'username', headerName: t('auth.username'), width: 130 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'email', headerName: t('auth.email'), width: 200 },
  {
    field: 'role',
    headerName: 'Role',
    width: 120,
    type: 'singleSelect',
    valueOptions: ['admin', 'manager', 'user']
  },
  { field: 'department', headerName: 'Department', width: 130 },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    type: 'singleSelect',
    valueOptions: ['active', 'inactive']
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      console.log('[UserManagement] Rendering actions for user:', params.row.username, 'hasResetPassword:', !!handleResetPassword);
      return (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          onResetPassword={handleResetPassword ? () => handleResetPassword(params.row.id) : undefined}
          editTooltip="Edit User"
          resetPasswordTooltip="Reset Password"
          showMore={false}
        />
      );
    }
  }
];
