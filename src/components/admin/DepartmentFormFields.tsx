'use client';

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CodeSelect from '@/components/common/CodeSelect';
import UserAutocomplete from '@/components/common/UserAutocomplete';

export interface DepartmentFormData {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh: string;
  nameVi: string;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
  parentId: string;
  managerId: string;
  status: 'active' | 'inactive';
  order: number;
}

export interface DepartmentFormFieldsProps {
  department: DepartmentFormData | null;
  onChange: (department: DepartmentFormData) => void;
  onError?: (error: string) => void;
  departments?: Array<{ id: string; name: { en: string; ko: string; zh: string; vi: string } }>;
  locale?: string;
  labels?: {
    code?: string;
    nameEn?: string;
    nameKo?: string;
    nameZh?: string;
    nameVi?: string;
    descriptionEn?: string;
    descriptionKo?: string;
    descriptionZh?: string;
    descriptionVi?: string;
    parentDepartment?: string;
    manager?: string;
    status?: string;
    order?: string;
    none?: string;
  };
}

export default function DepartmentFormFields({
  department,
  onChange,
  departments = [],
  locale = 'en',
  labels = {}
}: DepartmentFormFieldsProps) {
  if (!department) return null;

  const handleChange = (field: keyof DepartmentFormData, value: string | number) => {
    onChange({ ...department, [field]: value });
  };

  // Filter departments to show only top-level (level 0) as parent options
  const topLevelDepartments = departments.filter((d: any) => d.level === 0);

  return (
    <>
      {/* Code */}
      <TextField
        label={labels.code || 'Code'}
        fullWidth
        required
        value={department.code || ''}
        onChange={(e) => handleChange('code', e.target.value)}
        disabled={!!department.id}
        helperText={department.id ? 'Code cannot be changed' : ''}
      />

      {/* Name (English) */}
      <TextField
        label={labels.nameEn || 'Name (English)'}
        fullWidth
        required
        value={department.nameEn || ''}
        onChange={(e) => handleChange('nameEn', e.target.value)}
      />

      {/* Name (Korean) */}
      <TextField
        label={labels.nameKo || 'Name (Korean)'}
        fullWidth
        required
        value={department.nameKo || ''}
        onChange={(e) => handleChange('nameKo', e.target.value)}
      />

      {/* Name (Chinese) */}
      <TextField
        label={labels.nameZh || 'Name (Chinese)'}
        fullWidth
        required
        value={department.nameZh || ''}
        onChange={(e) => handleChange('nameZh', e.target.value)}
      />

      {/* Name (Vietnamese) */}
      <TextField
        label={labels.nameVi || 'Name (Vietnamese)'}
        fullWidth
        required
        value={department.nameVi || ''}
        onChange={(e) => handleChange('nameVi', e.target.value)}
      />

      {/* Description (English) */}
      <TextField
        label={labels.descriptionEn || 'Description (English)'}
        fullWidth
        multiline
        rows={2}
        value={department.descriptionEn || ''}
        onChange={(e) => handleChange('descriptionEn', e.target.value)}
      />

      {/* Description (Korean) */}
      <TextField
        label={labels.descriptionKo || 'Description (Korean)'}
        fullWidth
        multiline
        rows={2}
        value={department.descriptionKo || ''}
        onChange={(e) => handleChange('descriptionKo', e.target.value)}
      />

      {/* Description (Chinese) */}
      <TextField
        label={labels.descriptionZh || 'Description (Chinese)'}
        fullWidth
        multiline
        rows={2}
        value={department.descriptionZh || ''}
        onChange={(e) => handleChange('descriptionZh', e.target.value)}
      />

      {/* Description (Vietnamese) */}
      <TextField
        label={labels.descriptionVi || 'Description (Vietnamese)'}
        fullWidth
        multiline
        rows={2}
        value={department.descriptionVi || ''}
        onChange={(e) => handleChange('descriptionVi', e.target.value)}
      />

      {/* Parent Department */}
      <FormControl fullWidth>
        <InputLabel>{labels.parentDepartment || 'Parent Department'}</InputLabel>
        <Select
          value={department.parentId || ''}
          label={labels.parentDepartment || 'Parent Department'}
          onChange={(e) => handleChange('parentId', e.target.value)}
        >
          <MenuItem value="">
            <em>{labels.none || 'None'}</em>
          </MenuItem>
          {topLevelDepartments.map((dept: any) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name?.[locale as 'en' | 'ko' | 'zh' | 'vi'] || dept.name?.en}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Manager */}
      <UserAutocomplete
        value={department.managerId || null}
        onChange={(userId) => handleChange('managerId', userId || '')}
        label={labels.manager || 'Manager'}
        placeholder="Search by username or name..."
        fullWidth
      />

      {/* Status */}
      <CodeSelect
        codeType="COMMON_STATUS"
        value={department.status || 'active'}
        onChange={(value) => handleChange('status', value as 'active' | 'inactive')}
        label={labels.status || 'Status'}
        required
      />

      {/* Order */}
      <TextField
        label={labels.order || 'Display Order'}
        type="number"
        fullWidth
        value={department.order || 1}
        onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
        inputProps={{ min: 1 }}
      />
    </>
  );
}
