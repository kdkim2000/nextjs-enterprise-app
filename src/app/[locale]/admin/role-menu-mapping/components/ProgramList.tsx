'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import MasterListPanel from '@/components/common/MasterListPanel';
import { Program } from '../types';

interface ProgramListProps {
  programs: Program[];
  selectedProgram: Program | null;
  onProgramSelect: (program: Program) => void;
  roleCounts: Record<string, number>;
  locale: string;
}

export default function ProgramList({
  programs,
  selectedProgram,
  onProgramSelect,
  roleCounts,
  locale
}: ProgramListProps) {
  const isKorean = locale === 'ko';

  // Filter active programs only
  const activePrograms = programs.filter(p => p.status === 'active');

  // Search filter function
  const searchFilter = (program: Program, searchText: string) => {
    const programName = isKorean ? program.name.ko : program.name.en;
    const programDesc = program.description
      ? (isKorean ? program.description.ko : program.description.en)
      : '';

    return (
      program.code.toLowerCase().includes(searchText) ||
      programName.toLowerCase().includes(searchText) ||
      programDesc.toLowerCase().includes(searchText)
    );
  };

  // Render primary text - program name + role count
  const renderPrimary = (program: Program) => {
    const programName = isKorean ? program.name.ko : program.name.en;
    const programDesc = program.description
      ? (isKorean ? program.description.ko : program.description.en)
      : '';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        {/* Program Name */}
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          component="span"
          sx={{ minWidth: 100, maxWidth: 140 }}
        >
          {programName}
        </Typography>

        {/* Description */}
        {programDesc && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            component="span"
            sx={{ flex: 1, minWidth: 0 }}
          >
            {programDesc}
          </Typography>
        )}

        {/* Role count badge */}
        <Chip
          label={roleCounts[program.id] || 0}
          size="small"
          color="default"
          sx={{ height: 18, fontSize: '0.65rem', minWidth: 32, flexShrink: 0 }}
        />
      </Box>
    );
  };

  return (
    <MasterListPanel
      title={isKorean ? '프로그램' : 'Programs'}
      items={activePrograms}
      selectedItem={selectedProgram}
      onSelectItem={onProgramSelect}
      renderPrimary={renderPrimary}
      searchPlaceholder={isKorean ? '프로그램 검색...' : 'Search programs...'}
      searchFilter={searchFilter}
      locale={locale}
    />
  );
}
