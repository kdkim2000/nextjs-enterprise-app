import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createFilterFields = (locale: string): FilterFieldConfig[] => [
  {
    name: 'title',
    label: getLocalizedValue({ en: 'Title', ko: '제목', zh: '标题', vi: 'Tiêu đề' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by title...', ko: '제목으로 검색...', zh: '按标题搜索...', vi: 'Tìm theo tiêu đề...' }, locale)
  },
  {
    name: 'content',
    label: getLocalizedValue({ en: 'Content', ko: '내용', zh: '内容', vi: 'Nội dung' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by content...', ko: '내용으로 검색...', zh: '按内容搜索...', vi: 'Tìm theo nội dung...' }, locale)
  },
  {
    name: 'author_name',
    label: getLocalizedValue({ en: 'Author', ko: '작성자', zh: '作者', vi: 'Tác giả' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by author...', ko: '작성자로 검색...', zh: '按作者搜索...', vi: 'Tìm theo tác giả...' }, locale)
  },
  {
    name: 'tags',
    label: getLocalizedValue({ en: 'Tags', ko: '태그', zh: '标签', vi: 'Thẻ' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by tags...', ko: '태그로 검색...', zh: '按标签搜索...', vi: 'Tìm theo thẻ...' }, locale)
  },
  {
    name: 'category',
    label: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, locale),
    type: 'text',
    placeholder: getLocalizedValue({ en: 'Search by category...', ko: '카테고리로 검색...', zh: '按分类搜索...', vi: 'Tìm theo danh mục...' }, locale)
  },
  {
    name: 'status',
    label: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All Status', ko: '전체 상태', zh: '所有状态', vi: 'Tất cả trạng thái' }, locale) },
      { value: 'published', label: getLocalizedValue({ en: 'Published', ko: '게시됨', zh: '已发布', vi: 'Đã xuất bản' }, locale) },
      { value: 'draft', label: getLocalizedValue({ en: 'Draft', ko: '임시저장', zh: '草稿', vi: 'Bản nháp' }, locale) },
      { value: 'archived', label: getLocalizedValue({ en: 'Archived', ko: '보관됨', zh: '已归档', vi: 'Đã lưu trữ' }, locale) }
    ]
  },
  {
    name: 'is_pinned',
    label: getLocalizedValue({ en: 'Pinned', ko: '고정', zh: '置顶', vi: 'Ghim' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All', ko: '전체', zh: '全部', vi: 'Tất cả' }, locale) },
      { value: 'true', label: getLocalizedValue({ en: 'Pinned Only', ko: '고정만', zh: '仅置顶', vi: 'Chỉ ghim' }, locale) },
      { value: 'false', label: getLocalizedValue({ en: 'Not Pinned', ko: '고정 제외', zh: '未置顶', vi: 'Không ghim' }, locale) }
    ]
  },
  {
    name: 'is_secret',
    label: getLocalizedValue({ en: 'Secret', ko: '비밀글', zh: '保密', vi: 'Bí mật' }, locale),
    type: 'select',
    options: [
      { value: '', label: getLocalizedValue({ en: 'All', ko: '전체', zh: '全部', vi: 'Tất cả' }, locale) },
      { value: 'true', label: getLocalizedValue({ en: 'Secret Only', ko: '비밀글만', zh: '仅保密', vi: 'Chỉ bí mật' }, locale) },
      { value: 'false', label: getLocalizedValue({ en: 'Public', ko: '공개', zh: '公开', vi: 'Công khai' }, locale) }
    ]
  }
];

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '';
  }).length;
};
