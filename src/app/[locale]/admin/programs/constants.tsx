'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const PROGRAM_CATEGORIES = ['admin', 'user', 'report', 'system', 'analytics', 'configuration'];
export const PROGRAM_TYPES = ['page', 'function', 'api', 'report'] as const;
export const PROGRAM_STATUS = ['active', 'inactive', 'development'] as const;

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string,
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
      headerName: getLocalizedValue({ en: 'Program Code', ko: '프로그램 코드', zh: '程序代码', vi: 'Mã chương trình' }, locale),
      width: 150
    },
    {
      field: 'name',
      headerName: getLocalizedValue({ en: 'Program Name', ko: '프로그램명', zh: '程序名称', vi: 'Tên chương trình' }, locale),
      width: 200,
      valueGetter: (_value, row) => getLocalizedValue(row.name, locale)
    },
    {
      field: 'category',
      headerName: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, locale),
      width: 120,
      valueGetter: (_value, row) => {
        const categoryLabels: Record<string, { en: string; ko: string; zh: string; vi: string }> = {
          admin: { en: 'Admin', ko: '관리자', zh: '管理', vi: 'Quản trị' },
          user: { en: 'User', ko: '사용자', zh: '用户', vi: 'Người dùng' },
          report: { en: 'Report', ko: '리포트', zh: '报表', vi: 'Báo cáo' },
          system: { en: 'System', ko: '시스템', zh: '系统', vi: 'Hệ thống' },
          analytics: { en: 'Analytics', ko: '분석', zh: '分析', vi: 'Phân tích' },
          configuration: { en: 'Configuration', ko: '설정', zh: '配置', vi: 'Cấu hình' }
        };
        return row.category && categoryLabels[row.category]
          ? getLocalizedValue(categoryLabels[row.category], locale)
          : row.category || '';
      }
    },
    {
      field: 'type',
      headerName: getLocalizedValue({ en: 'Type', ko: '유형', zh: '类型', vi: 'Loại' }, locale),
      width: 100,
      valueGetter: (_value, row) => {
        const typeLabels: Record<string, { en: string; ko: string; zh: string; vi: string }> = {
          page: { en: 'Page', ko: '페이지', zh: '页面', vi: 'Trang' },
          function: { en: 'Function', ko: '기능', zh: '功能', vi: 'Chức năng' },
          api: { en: 'API', ko: 'API', zh: 'API', vi: 'API' },
          report: { en: 'Report', ko: '리포트', zh: '报表', vi: 'Báo cáo' },
          module: { en: 'Module', ko: '모듈', zh: '模块', vi: 'Mô-đun' }
        };
        return row.type && typeLabels[row.type]
          ? getLocalizedValue(typeLabels[row.type], locale)
          : row.type || '';
      }
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale)
      width: 120,
      type: 'singleSelect',
      valueOptions: PROGRAM_STATUS as unknown as string[],
      valueGetter: (_value, row) => {
        const statusLabels: Record<string, { en: string; ko: string; zh: string; vi: string }> = {
          active: { en: 'Active', ko: '활성', zh: '激活', vi: 'Hoạt động' },
          inactive: { en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' },
          development: { en: 'Development', ko: '개발중', zh: '开发中', vi: 'Đang phát triển' }
        };
        return row.status && statusLabels[row.status]
          ? getLocalizedValue(statusLabels[row.status], locale)
          : row.status || '';
      }
    },
    {
      field: 'version',
      headerName: getLocalizedValue({ en: 'Version', ko: '버전', zh: '版本', vi: 'Phiên bản' }, locale),
      width: 100
    },
    {
      field: 'author',
      headerName: getLocalizedValue({ en: 'Author', ko: '작성자', zh: '作者', vi: 'Tác giả' }, locale),
      width: 130
    }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          editTooltip={getLocalizedValue({ en: 'Edit Program', ko: '프로그램 수정', zh: '编辑程序', vi: 'Sửa chương trình' }, locale)}
          showMore={false}
        />
      )
    });
  }

  return columns;
};
