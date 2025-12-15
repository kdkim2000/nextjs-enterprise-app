'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import {
  Code as CodeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import MobileEntityCard from '@/components/mobile/MobileEntityCard';
import { Program } from '../types';

export interface ProgramMobileCardProps {
  program: Program;
  locale: string;
  roleCount?: number;
  onClick?: (program: Program) => void;
  selected?: boolean;
}

export default function ProgramMobileCard({
  program,
  locale,
  roleCount = 0,
  onClick,
  selected = false,
}: ProgramMobileCardProps) {
  const isKorean = locale === 'ko';
  const name = isKorean ? program.name.ko : program.name.en;
  const description = program.description
    ? (isKorean ? program.description.ko : program.description.en)
    : undefined;

  return (
    <MobileEntityCard
      item={program}
      primaryText={name}
      secondaryText={program.code}
      tertiaryText={description}
      status={{
        active: program.status === 'active',
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      onClick={onClick ? () => onClick(program) : undefined}
      selected={selected}
      rightContent={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            icon={<CodeIcon sx={{ fontSize: 12 }} />}
            label={roleCount}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem' }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        </Box>
      }
    />
  );
}
