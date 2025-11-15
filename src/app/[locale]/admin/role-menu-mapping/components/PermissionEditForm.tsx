import React from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { PermissionFormData } from '../types';

interface PermissionEditFormProps {
  permission: PermissionFormData | null;
  onChange: (permission: PermissionFormData) => void;
  locale: string;
}

export default function PermissionEditForm({
  permission,
  onChange,
  locale
}: PermissionEditFormProps) {
  const isKorean = locale === 'ko';

  if (!permission) {
    return (
      <Alert severity="info">
        {isKorean ? '권한 정보를 선택하세요.' : 'Select permission to edit.'}
      </Alert>
    );
  }

  const handlePermissionChange = (field: keyof PermissionFormData, value: boolean) => {
    onChange({
      ...permission,
      [field]: value
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Role Information */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {isKorean ? '역할 정보' : 'Role Information'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Chip
            label={permission.roleName}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Typography variant="body2" fontWeight={500}>
            {permission.roleDisplayName}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Program Information */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {isKorean ? '프로그램 정보' : 'Program Information'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Chip
            label={permission.programCode}
            size="small"
            variant="outlined"
            color="secondary"
          />
          <Typography variant="body2" fontWeight={500}>
            {isKorean ? permission.programName.ko : permission.programName.en}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Permissions */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {isKorean ? '권한 설정' : 'Permission Settings'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={permission.canView}
                onChange={(e) => handlePermissionChange('canView', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {isKorean ? '조회 (View)' : 'View'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isKorean
                    ? '프로그램 데이터를 조회할 수 있는 권한'
                    : 'Permission to view program data'}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={permission.canCreate}
                onChange={(e) => handlePermissionChange('canCreate', e.target.checked)}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {isKorean ? '생성 (Create)' : 'Create'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isKorean
                    ? '새로운 데이터를 생성할 수 있는 권한'
                    : 'Permission to create new data'}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={permission.canUpdate}
                onChange={(e) => handlePermissionChange('canUpdate', e.target.checked)}
                color="warning"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {isKorean ? '수정 (Update)' : 'Update'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isKorean
                    ? '기존 데이터를 수정할 수 있는 권한'
                    : 'Permission to update existing data'}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={permission.canDelete}
                onChange={(e) => handlePermissionChange('canDelete', e.target.checked)}
                color="error"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {isKorean ? '삭제 (Delete)' : 'Delete'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isKorean
                    ? '데이터를 삭제할 수 있는 권한'
                    : 'Permission to delete data'}
                </Typography>
              </Box>
            }
          />
        </Box>
      </Box>

      {/* Permission Summary */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {isKorean ? '권한 요약' : 'Permission Summary'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
          {permission.canView && (
            <Chip label={isKorean ? '조회' : 'View'} size="small" color="primary" />
          )}
          {permission.canCreate && (
            <Chip label={isKorean ? '생성' : 'Create'} size="small" color="success" />
          )}
          {permission.canUpdate && (
            <Chip label={isKorean ? '수정' : 'Update'} size="small" color="warning" />
          )}
          {permission.canDelete && (
            <Chip label={isKorean ? '삭제' : 'Delete'} size="small" color="error" />
          )}
          {!permission.canView &&
            !permission.canCreate &&
            !permission.canUpdate &&
            !permission.canDelete && (
              <Typography variant="caption" color="text.secondary">
                {isKorean ? '권한 없음' : 'No permissions'}
              </Typography>
            )}
        </Box>
      </Box>
    </Box>
  );
}
