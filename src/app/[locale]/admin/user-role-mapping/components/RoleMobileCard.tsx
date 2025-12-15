'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import {
  Group as GroupIcon,
  ChevronRight as ChevronRightIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import MobileEntityCard from '@/components/mobile/MobileEntityCard';
import { Role } from '../types';

export interface RoleMobileCardProps {
  role: Role;
  locale: string;
  userCount?: number;
  onClick?: (role: Role) => void;
  selected?: boolean;
}

export default function RoleMobileCard({
  role,
  locale,
  userCount = 0,
  onClick,
  selected = false,
}: RoleMobileCardProps) {
  const isKorean = locale === 'ko';

  return (
    <MobileEntityCard
      item={role}
      primaryText={role.displayName}
      secondaryText={role.name}
      tertiaryText={role.description}
      status={{
        active: role.isActive,
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      onClick={onClick ? () => onClick(role) : undefined}
      selected={selected}
      rightContent={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {role.roleType === 'management' && (
            <Chip
              icon={<AdminIcon sx={{ fontSize: 12 }} />}
              label={isKorean ? '관리' : 'Mgmt'}
              size="small"
              color="primary"
              sx={{ height: 22, fontSize: '0.65rem' }}
            />
          )}
          <Chip
            icon={<GroupIcon sx={{ fontSize: 12 }} />}
            label={userCount}
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
