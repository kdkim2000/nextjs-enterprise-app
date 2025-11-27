import { GridColDef } from '@mui/x-data-grid-pro';
import { BoardType } from './types';
import ActionsCell from '@/components/common/ActionsCell';
import { Chip } from '@mui/material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  currentLocale: string,
  handleEdit: (id: string | number) => void,
  handleViewStats: (id: string | number) => void,
  editable: boolean
): GridColDef<BoardType>[] => {
  const columns: GridColDef<BoardType>[] = [
    {
      field: 'id',
      headerName: getLocalizedValue({ en: 'ID', ko: 'ID', zh: 'ID', vi: 'ID' }, currentLocale),
      width: 70
    },
    {
      field: 'code',
      headerName: getLocalizedValue({ en: 'Code', ko: '코드', zh: '代码', vi: 'Mã' }, currentLocale),
      width: 180
    },
    {
      field: 'name',
      headerName: getLocalizedValue({ en: 'Name', ko: '이름', zh: '名称', vi: 'Tên' }, currentLocale),
      flex: 1,
      minWidth: 200,
      valueGetter: (_value, row) => {
        // Backend returns name as an object: { en: 'xxx', ko: 'xxx', zh: 'xxx', vi: 'xxx' }
        if (row.name && typeof row.name === 'object') {
          const nameObj = row.name as unknown as Record<string, string>;
          return nameObj[currentLocale] || nameObj.en || '';
        }
        // Fallback for flat structure
        return row[`name_${currentLocale}` as keyof BoardType] || row.name_en || row.name || '';
      }
    },
    {
      field: 'type',
      headerName: getLocalizedValue({ en: 'Type', ko: '유형', zh: '类型', vi: 'Loại' }, currentLocale),
      width: 120,
      type: 'singleSelect',
      valueOptions: ['normal', 'notice'],
      renderCell: (params) => (
        <Chip
          label={params.value === 'notice' ? getLocalizedValue({ en: 'Notice', ko: '공지', zh: '公告', vi: 'Thông báo' }, currentLocale) : getLocalizedValue({ en: 'Normal', ko: '일반', zh: '普通', vi: 'Thông thường' }, currentLocale)}
          size="small"
          color={params.value === 'notice' ? 'error' : 'primary'}
          variant="outlined"
        />
      )
    },
    {
      field: 'category',
      headerName: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, currentLocale),
      width: 130
    },
    {
      field: 'totalPosts',
      headerName: getLocalizedValue({ en: 'Posts', ko: '게시글', zh: '帖子', vi: 'Bài viết' }, currentLocale),
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_value, row) => row.totalPosts || row.post_count || 0
    },
    {
      field: 'totalViews',
      headerName: getLocalizedValue({ en: 'Views', ko: '조회수', zh: '浏览', vi: 'Lượt xem' }, currentLocale),
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_value, row) => row.totalViews || row.view_count || 0
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, currentLocale),
      width: 100,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
      renderCell: (params) => {
        const isActive = params.value === 'active';
        return (
          <Chip
            label={isActive
              ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, currentLocale)
              : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, currentLocale)
            }
            size="small"
            color={isActive ? 'success' : 'default'}
          />
        );
      }
    }
  ];

  if (editable) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, currentLocale),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          onView={() => handleViewStats(params.row.id)}
          editTooltip={getLocalizedValue({ en: 'Edit Board Type', ko: '게시판 유형 수정', zh: '编辑板类型', vi: 'Sửa loại bảng' }, currentLocale)}
          viewLabel={getLocalizedValue({ en: 'View Statistics', ko: '통계 보기', zh: '查看统计', vi: 'Xem thống kê' }, currentLocale)}
          showMore={false}
        />
      )
    });
  }

  return columns;
};

export const BOARD_TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal Board' },
  { value: 'notice', label: 'Notice Board' }
];

export const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'qa', label: 'Q&A' },
  { value: 'knowledge', label: 'Knowledge Base' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Other' }
];

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
  { value: 'guest', label: 'Guest' }
];
