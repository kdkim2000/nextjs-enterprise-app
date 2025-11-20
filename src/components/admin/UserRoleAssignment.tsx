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
  Stack,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { Add as AddIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
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
  mode?: 'realtime' | 'batch'; // realtime: 실시간 저장, batch: 일괄 저장
}

export default function UserRoleAssignment({
  userId,
  onRolesChange,
  disabled = false,
  mode = 'realtime'
}: UserRoleAssignmentProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleMapping[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]); // Multiple selection
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

  const handleAddRoles = async () => {
    if (selectedRoleIds.length === 0 || !userId) return;

    // Filter out already assigned roles
    const newRoleIds = selectedRoleIds.filter(
      roleId => !userRoles.some(ur => ur.roleId === roleId)
    );

    if (newRoleIds.length === 0) {
      setError('All selected roles are already assigned');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add multiple roles
      await Promise.all(
        newRoleIds.map(roleId =>
          api.post('/user-role-mapping', {
            userId,
            roleId,
            isActive: true
          })
        )
      );

      // Refresh user roles
      const data = await api.get<{ mappings: UserRoleMapping[] }>('/user-role-mapping', {
        params: { userId, includeDetails: 'true' }
      });
      const activeMappings = (data.mappings || []).filter(m => m.isActive);
      setUserRoles(activeMappings);

      setSelectedRoleIds([]);
      setSuccessMessage(`${newRoleIds.length} role(s) assigned successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign roles');
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
          icon={<CheckCircleIcon />}
        >
          {successMessage}
        </Alert>
      )}

      {/* Current Roles */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Assigned Roles
          </Typography>
          {userRoles.length > 0 && (
            <Chip
              label={`${userRoles.length} role${userRoles.length > 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {loading && userRoles.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : userRoles.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No roles assigned yet. Add roles using the selector below.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {userRoles.map((ur) => (
              <Chip
                key={ur.id}
                label={ur.roleDisplayName || ur.roleName || ur.roleId}
                onDelete={disabled ? undefined : () => handleRemoveRole(ur.id, ur.roleDisplayName || ur.roleName || '')}
                color="primary"
                disabled={loading}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* Add New Roles - MultiSelect */}
      {!disabled && availableRoles.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Add New Roles
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="add-roles-label">Select roles to add (multiple selection)</InputLabel>
            <Select
              labelId="add-roles-label"
              multiple
              value={selectedRoleIds}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRoleIds(typeof value === 'string' ? value.split(',') : value);
              }}
              input={<OutlinedInput label="Select roles to add (multiple selection)" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No roles selected
                    </Typography>
                  ) : (
                    selected.map((roleId) => {
                      const role = availableRoles.find(r => r.id === roleId);
                      return (
                        <Chip
                          key={roleId}
                          label={role?.displayName || roleId}
                          size="small"
                          color="secondary"
                        />
                      );
                    })
                  )}
                </Box>
              )}
              disabled={loading}
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Checkbox checked={selectedRoleIds.indexOf(role.id) > -1} />
                  <ListItemText
                    primary={role.displayName}
                    secondary={role.name}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRoles}
            disabled={selectedRoleIds.length === 0 || loading}
            sx={{ mt: 2, minWidth: 120 }}
            fullWidth
          >
            {selectedRoleIds.length === 0
              ? 'Select roles to add'
              : `Add ${selectedRoleIds.length} Role${selectedRoleIds.length > 1 ? 's' : ''}`}
          </Button>
        </Paper>
      )}

      {!disabled && availableRoles.length === 0 && userRoles.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          All available roles have been assigned
        </Typography>
      )}
    </Box>
  );
}
