'use client';

import React from 'react';
import { Typography } from '@mui/material';
import MasterListPanel from '@/components/common/MasterListPanel';
import { CodeType } from '../types';

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
      codeType.name.en.toLowerCase().includes(searchText) ||
      codeType.name.ko.toLowerCase().includes(searchText) ||
      codeType.description.en.toLowerCase().includes(searchText) ||
      codeType.description.ko.toLowerCase().includes(searchText)
    );
  };

  // Render primary text
  const renderPrimary = (codeType: CodeType) => (
    <Typography variant="body2" fontWeight={500} noWrap>
      {locale === 'ko' ? codeType.name.ko : codeType.name.en}
      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        ({codeType.code})
      </Typography>
    </Typography>
  );

  return (
    <MasterListPanel
      title={locale === 'ko' ? '코드 타입' : 'Code Types'}
      items={codeTypes}
      selectedItem={selectedCodeType}
      onSelectItem={onSelectCodeType}
      onAddItem={onAddCodeType}
      onEditItem={onEditCodeType}
      onDeleteItem={onDeleteCodeType}
      renderPrimary={renderPrimary}
      searchPlaceholder={locale === 'ko' ? '코드 타입 검색...' : 'Search code types...'}
      searchFilter={searchFilter}
      locale={locale}
    />
  );
}
