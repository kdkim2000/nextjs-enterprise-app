import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { api } from '@/lib/axios';
import { Role } from '../types';

export interface RoleSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (roles: Role[], permissions: { canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean }) => void;
  locale: string;
  excludeRoleIds?: string[]; // 이미 매핑된 역할 제외
}

export default function RoleSearchDialog({
  open,
  onClose,
  onConfirm,
  locale,
  excludeRoleIds = []
}: RoleSearchDialogProps) {
  const isKorean = locale === 'ko';

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  // Default permissions
  const [permissions, setPermissions] = useState({
    canView: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      setSearchTerm('');
      setSelectedRoles([]);
      setPermissions({
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      });
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/role');
      const allRoles = response.roles || [];
      // 활성 역할만 필터링 및 이미 매핑된 역할 제외
      const activeRoles = allRoles.filter(
        (role: Role) => role.isActive && !excludeRoleIds.includes(role.id)
      );
      setRoles(activeRoles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles;

    const search = searchTerm.toLowerCase();
    return roles.filter((role) => {
      return (
        role.name.toLowerCase().includes(search) ||
        role.displayName.toLowerCase().includes(search) ||
        role.description?.toLowerCase().includes(search)
      );
    });
  }, [roles, searchTerm]);

  const handleToggleRole = (role: Role) => {
    const isSelected = selectedRoles.some((r) => r.id === role.id);
    if (isSelected) {
      setSelectedRoles(selectedRoles.filter((r) => r.id !== role.id));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleToggleAll = () => {
    if (selectedRoles.length === filteredRoles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(filteredRoles);
    }
  };

  const handleConfirm = () => {
    if (selectedRoles.length > 0) {
      onConfirm(selectedRoles, permissions);
      onClose();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isKorean ? '역할 검색 및 선택' : 'Search and Select Roles'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {/* Search Field */}
        <TextField
          fullWidth
          placeholder={isKorean ? '역할 코드, 이름, 설명으로 검색...' : 'Search by code, name, description...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Selected Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {isKorean
              ? `${selectedRoles.length}개 역할 선택됨 / 총 ${filteredRoles.length}개`
              : `${selectedRoles.length} selected / ${filteredRoles.length} total`}
          </Typography>
          {filteredRoles.length > 0 && (
            <Button size="small" onClick={handleToggleAll}>
              {selectedRoles.length === filteredRoles.length
                ? isKorean ? '전체 해제' : 'Deselect All'
                : isKorean ? '전체 선택' : 'Select All'}
            </Button>
          )}
        </Box>

        {/* Permissions */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {isKorean ? '기본 권한 설정' : 'Default Permissions'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canView}
                  onChange={(e) => setPermissions({ ...permissions, canView: e.target.checked })}
                />
              }
              label={isKorean ? '조회' : 'View'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canCreate}
                  onChange={(e) => setPermissions({ ...permissions, canCreate: e.target.checked })}
                />
              }
              label={isKorean ? '생성' : 'Create'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canUpdate}
                  onChange={(e) => setPermissions({ ...permissions, canUpdate: e.target.checked })}
                />
              }
              label={isKorean ? '수정' : 'Update'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.canDelete}
                  onChange={(e) => setPermissions({ ...permissions, canDelete: e.target.checked })}
                />
              }
              label={isKorean ? '삭제' : 'Delete'}
            />
          </Box>
        </Box>

        {/* Role List */}
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredRoles.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm
                  ? isKorean ? '검색 결과가 없습니다' : 'No roles found'
                  : isKorean ? '사용 가능한 역할이 없습니다' : 'No roles available'}
              </Typography>
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" width={50} />
                  <TableCell width={120}>{isKorean ? '코드' : 'Code'}</TableCell>
                  <TableCell>{isKorean ? '역할명' : 'Name'}</TableCell>
                  <TableCell>{isKorean ? '설명' : 'Description'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles.map((role) => {
                  const isSelected = selectedRoles.some((r) => r.id === role.id);

                  return (
                    <TableRow
                      key={role.id}
                      hover
                      selected={isSelected}
                      onClick={() => handleToggleRole(role)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      <TableCell>
                        <Chip label={role.name} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{role.displayName}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {role.description || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>
          {isKorean ? '취소' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedRoles.length === 0}
        >
          {isKorean
            ? `${selectedRoles.length}개 역할 추가`
            : `Add ${selectedRoles.length} Role${selectedRoles.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
