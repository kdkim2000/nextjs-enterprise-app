'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '@/lib/axios';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

interface UserRoleMapping {
  id: string;
  userId: string;
  roleId: string;
  isActive: boolean;
  roleName?: string;
  roleDisplayName?: string;
}

interface UserRoleAssignmentProps {
  userId?: string;
  onRolesChange?: (roleIds: string[]) => void;
  disabled?: boolean;
}

export default function UserRoleAssignment({
  userId,
  onRolesChange,
  disabled = false
}: UserRoleAssignmentProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleMapping[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.get<{ roles: Role[] }>('/role');
        const activeRoles = (data.roles || []).filter(r => r.isActive);
        setAllRoles(activeRoles);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to load roles');
      }
    };

    fetchRoles();
  }, []);

  // Fetch user's current role mappings
  useEffect(() => {
    if (userId) {
      const fetchUserRoles = async () => {
        try {
          setLoading(true);
          const data = await api.get<{ mappings: UserRoleMapping[] }>('/user-role-mapping', {
            params: { userId, includeDetails: 'true' }
          });
          console.log('[UserRoleAssignment] Fetched mappings:', data);
          const activeMappings = (data.mappings || []).filter(m => m.isActive);
          console.log('[UserRoleAssignment] Active mappings:', activeMappings);
          setUserRoles(activeMappings);
        } catch (err) {
          console.error('Failed to fetch user roles:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserRoles();
    }
  }, [userId]);

  // Notify parent of role changes
  useEffect(() => {
    if (onRolesChange) {
      const roleIds = userRoles.map(ur => ur.roleId);
      onRolesChange(roleIds);
    }
  }, [userRoles, onRolesChange]);

  const handleAddRole = async () => {
    if (!selectedRoleId || !userId) return;

    // Check if role already assigned
    if (userRoles.some(ur => ur.roleId === selectedRoleId)) {
      setError('This role is already assigned');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/user-role-mapping', {
        userId,
        roleId: selectedRoleId,
        isActive: true
      });

      // Refresh user roles
      const data = await api.get<{ mappings: UserRoleMapping[] }>('/user-role-mapping', {
        params: { userId, includeDetails: 'true' }
      });
      const activeMappings = (data.mappings || []).filter(m => m.isActive);
      setUserRoles(activeMappings);

      setSelectedRoleId('');
      setSuccessMessage('Role assigned successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign role');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (mappingId: string, roleName: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      await api.delete('/user-role-mapping', {
        params: { id: mappingId }
      });

      // Update local state
      setUserRoles(prev => prev.filter(ur => ur.id !== mappingId));

      setSuccessMessage(`Removed role: ${roleName}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove role');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Get available roles (not yet assigned)
  const availableRoles = allRoles.filter(
    role => !userRoles.some(ur => ur.roleId === role.id)
  );

  // For new users (no userId yet)
  if (!userId) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="body2" color="text.secondary">
          Role assignment will be available after creating the user.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        Role Assignment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Current Roles */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Current Roles:
        </Typography>

        {loading && userRoles.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : userRoles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No roles assigned yet
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {userRoles.map((ur) => (
              <Chip
                key={ur.id}
                label={ur.roleDisplayName || ur.roleName || ur.roleId}
                onDelete={disabled ? undefined : () => handleRemoveRole(ur.id, ur.roleDisplayName || ur.roleName || '')}
                color="primary"
                variant="outlined"
                disabled={loading}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* Add New Role */}
      {!disabled && availableRoles.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Add Role</InputLabel>
            <Select
              value={selectedRoleId}
              label="Add Role"
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Select a role...</em>
              </MenuItem>
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.displayName} ({role.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRole}
            disabled={!selectedRoleId || loading}
            sx={{ minWidth: 100 }}
          >
            Add
          </Button>
        </Box>
      )}

      {!disabled && availableRoles.length === 0 && userRoles.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          All available roles have been assigned
        </Typography>
      )}
    </Box>
  );
}
