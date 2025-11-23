'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { Department } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const STATUS_OPTIONS = [
  { value: 'active', labelEn: 'Active', labelKo: '활성' },
  { value: 'inactive', labelEn: 'Inactive', labelKo: '비활성' }
];

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string,
  allDepartments: Department[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allUsers: any[],
  handleEdit: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: getLocalizedValue({ en: 'ID', ko: 'ID', zh: 'ID', vi: 'ID' }, locale),
    width: 70
  },
  {
    field: 'code',
    headerName: getLocalizedValue({ en: 'Code', ko: '코드', zh: '代码', vi: 'Mã' }, locale),
    width: 120,
    sortable: true
  },
  {
    field: 'name',
    headerName: getLocalizedValue({ en: 'Name', ko: '이름', zh: '名称', vi: 'Tên' }, locale),
    width: 200,
    sortable: true,
    valueGetter: (_value, row) => {
      return getLocalizedValue(row.name, locale);
    }
  },
  {
    field: 'description',
    headerName: getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale),
    width: 250,
    sortable: false,
    valueGetter: (_value, row) => {
      return getLocalizedValue(row.description, locale);
    }
  },
  {
    field: 'parentId',
    headerName: getLocalizedValue({ en: 'Parent Department', ko: '상위 부서', zh: '上级部门', vi: 'Phòng ban cấp trên' }, locale),
    width: 180,
    sortable: true,
    valueGetter: (_value, row) => {
      if (!row.parentId) return '-';
      const parent = allDepartments.find(d => d.id === row.parentId);
      return parent ? getLocalizedValue(parent.name, locale) : '-';
    }
  },
  {
    field: 'managerId',
    headerName: getLocalizedValue({ en: 'Manager', ko: '담당자', zh: '负责人', vi: 'Quản lý' }, locale),
    width: 150,
    sortable: true,
    valueGetter: (_value, row) => {
      if (!row.managerId) return '-';
      const manager = allUsers.find(u => u.id === row.managerId);
      return manager ? manager.name : '-';
    }
  },
  {
    field: 'level',
    headerName: getLocalizedValue({ en: 'Level', ko: '레벨', zh: '级别', vi: 'Cấp độ' }, locale),
    width: 80,
    sortable: true,
    align: 'center',
    headerAlign: 'center'
  },
  {
    field: 'status',
    headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    width: 100,
    sortable: true,
    type: 'singleSelect',
    valueOptions: ['active', 'inactive'],
    renderCell: (params) => {
      const status = params.value as string;
      const color = status === 'active' ? 'success' : 'default';
      const label = STATUS_OPTIONS.find(opt => opt.value === status);
      const labelText = label ? getLocalizedValue({ en: label.labelEn, ko: label.labelKo, zh: label.labelEn, vi: label.labelEn }, locale) : status;
      return (
        <Chip
          label={labelText}
          color={color}
          size="small"
        />
      );
    }
  }
];

  // Add actions column only if user has update permission
  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          editTooltip={getLocalizedValue({ en: 'Edit Department', ko: '부서 수정', zh: '编辑部门', vi: 'Sửa phòng ban' }, locale)}
          showMore={false}
        />
      )
    });
  }

  return columns;
};
