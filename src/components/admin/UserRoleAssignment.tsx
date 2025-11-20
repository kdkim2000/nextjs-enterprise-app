'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
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
  const [loading, setLoading] = useState(false);
  const [addingRoleId, setAddingRoleId] = useState<string | null>(null);
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.get<{ roles: Role[] }>('/role');
        const activeRoles = (data.roles || []).filter(r => r.isActive);
        console.log('[UserRoleAssignment] Fetched roles:', activeRoles.length);
        setAllRoles(activeRoles);
      } catch (err) {
        console.error('[UserRoleAssignment] Failed to fetch roles:', err);
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

  const handleAddRole = async (roleId: string) => {
    if (!userId) return;

    // Check if role already assigned
    if (userRoles.some(ur => ur.roleId === roleId)) {
      setError('This role is already assigned');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setAddingRoleId(roleId);
      setError(null);

      await api.post('/user-role-mapping', {
        userId,
        roleId,
        isActive: true
      });

      // Refresh user roles
      const data = await api.get<{ mappings: UserRoleMapping[] }>('/user-role-mapping', {
        params: { userId, includeDetails: 'true' }
      });
      const activeMappings = (data.mappings || []).filter(m => m.isActive);
      setUserRoles(activeMappings);

      const role = allRoles.find(r => r.id === roleId);
      setSuccessMessage(`Added role: ${role?.displayName || roleId}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign role');
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingRoleId(null);
    }
  };

  const handleRemoveRole = async (mappingId: string, roleName: string) => {
    if (!userId) return;

    try {
      setRemovingRoleId(mappingId);
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
      setRemovingRoleId(null);
    }
  };

  // Get available roles (not yet assigned)
  const availableRoles = allRoles.filter(
    role => !userRoles.some(ur => ur.roleId === role.id)
  );

  // Get assigned role IDs for quick lookup
  const assignedRoleIds = new Set(userRoles.map(ur => ur.roleId));

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

      {/* Statistics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip
          label={`${userRoles.length} Assigned`}
          color="primary"
          variant="filled"
        />
        <Chip
          label={`${availableRoles.length} Available`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${allRoles.length} Total`}
          color="default"
          variant="outlined"
        />
      </Box>

      {/* Role List */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
          <Typography variant="subtitle2" fontWeight={600}>
            All Roles (Click + to add, click trash to remove)
          </Typography>
        </Box>

        <Divider />

        {loading && allRoles.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {allRoles.map((role, index) => {
              const isAssigned = assignedRoleIds.has(role.id);
              const userRole = userRoles.find(ur => ur.roleId === role.id);
              const isAdding = addingRoleId === role.id;
              const isRemoving = removingRoleId === userRole?.id;

              return (
                <React.Fragment key={role.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      bgcolor: isAssigned ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: isAssigned ? 'action.selected' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight={isAssigned ? 600 : 400}>
                            {role.displayName}
                          </Typography>
                          {isAssigned && (
                            <Chip
                              label="Assigned"
                              size="small"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={role.name}
                    />
                    <ListItemSecondaryAction>
                      {isAssigned ? (
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveRole(userRole!.id, role.displayName)}
                          disabled={disabled || isRemoving}
                          color="error"
                          size="small"
                        >
                          {isRemoving ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      ) : (
                        <IconButton
                          edge="end"
                          onClick={() => handleAddRole(role.id)}
                          disabled={disabled || isAdding}
                          color="primary"
                          size="small"
                        >
                          {isAdding ? (
                            <CircularProgress size={20} />
                          ) : (
                            <AddIcon />
                          )}
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
