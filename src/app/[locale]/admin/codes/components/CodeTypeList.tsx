'use client';

import React from 'react';
import { Typography } from '@mui/material';
import MasterListPanel from '@/components/common/MasterListPanel';
import { CodeType } from '../types';
import { getLocalizedValue, searchMultiLangField } from '@/lib/i18n/multiLang';

interface CodeTypeListProps {
  codeTypes: CodeType[];
  selectedCodeType: CodeType | null;
  onSelectCodeType: (codeType: CodeType) => void;
  onAddCodeType: () => void;
  onEditCodeType: (codeType: CodeType) => void;
  onDeleteCodeType: (codeType: CodeType) => void;
  locale: string;
}

export default function CodeTypeList({
  codeTypes,
  selectedCodeType,
  onSelectCodeType,
  onAddCodeType,
  onEditCodeType,
  onDeleteCodeType,
  locale
}: CodeTypeListProps) {
  // Search filter function
  const searchFilter = (codeType: CodeType, searchText: string) => {
    return (
      codeType.code.toLowerCase().includes(searchText) ||
      searchMultiLangField(codeType.name, searchText) ||
      searchMultiLangField(codeType.description, searchText)
    );
  };

  // Render primary text
  const renderPrimary = (codeType: CodeType) => (
    <Typography variant="body2" fontWeight={500} noWrap>
      {getLocalizedValue(codeType.name, locale)}
      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        ({codeType.code})
      </Typography>
    </Typography>
  );

  const title = getLocalizedValue({ en: 'Code Types', ko: '코드 타입', zh: '代码类型', vi: 'Loại mã' }, locale);
  const searchPlaceholder = getLocalizedValue({ en: 'Search code types...', ko: '코드 타입 검색...', zh: '搜索代码类型...', vi: 'Tìm kiếm loại mã...' }, locale);

  return (
    <MasterListPanel
      title={title}
      items={codeTypes}
      selectedItem={selectedCodeType}
      onSelectItem={onSelectCodeType}
      onAddItem={onAddCodeType}
      onEditItem={onEditCodeType}
      onDeleteItem={onDeleteCodeType}
      renderPrimary={renderPrimary}
      searchPlaceholder={searchPlaceholder}
      searchFilter={searchFilter}
      locale={locale}
    />
  );
}
