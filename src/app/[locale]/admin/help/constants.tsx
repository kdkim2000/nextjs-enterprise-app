'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { HelpContent } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
  { value: 'vi', label: 'Tiếng Việt' }
];

export const STATUS_OPTIONS = [
  { value: 'draft', labelEn: 'Draft', labelKo: '초안', labelZh: '草稿', labelVi: 'Nháp' },
  { value: 'published', labelEn: 'Published', labelKo: '게시됨', labelZh: '已发布', labelVi: 'Đã xuất bản' }
];

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
      width: 100
    },
    {
      field: 'programId',
      headerName: getLocalizedValue({ en: 'Program ID', ko: '프로그램 ID', zh: '程序 ID', vi: 'ID Chương trình' }, locale),
      width: 180
    },
    {
      field: 'title',
      headerName: getLocalizedValue({ en: 'Title', ko: '제목', zh: '标题', vi: 'Tiêu đề' }, locale),
      width: 250,
      flex: 1
    },
    {
      field: 'language',
      headerName: getLocalizedValue({ en: 'Language', ko: '언어', zh: '语言', vi: 'Ngôn ngữ' }, locale),
      width: 100,
      renderCell: (params) => {
        const lang = LANGUAGES.find(l => l.value === params.value);
        return <Chip label={lang?.label || params.value} size="small" />;
      }
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 120,
      renderCell: (params) => {
        const statusOption = STATUS_OPTIONS.find(opt => opt.value === params.value);
        const label = statusOption
          ? getLocalizedValue({ en: statusOption.labelEn, ko: statusOption.labelKo, zh: statusOption.labelZh, vi: statusOption.labelVi }, locale)
          : params.value;
        return (
          <Chip
            label={label}
            size="small"
            color={params.value === 'published' ? 'success' : 'default'}
          />
        );
      }
    },
    {
      field: 'version',
      headerName: getLocalizedValue({ en: 'Version', ko: '버전', zh: '版本', vi: 'Phiên bản' }, locale),
      width: 90,
      type: 'number'
    },
    {
      field: 'updatedAt',
      headerName: getLocalizedValue({ en: 'Last Updated', ko: '최종 수정일', zh: '最后更新', vi: 'Cập nhật lần cuối' }, locale),
      width: 180,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : ''
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
          showMore={false}
        />
      )
    });
  }

  return columns;
};
