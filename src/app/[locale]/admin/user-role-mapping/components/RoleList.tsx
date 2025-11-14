'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import MasterListPanel from '@/components/common/MasterListPanel';
import { Role } from '../types';

interface RoleListProps {
  roles: Role[];
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
  locale: string;
  userCounts: Record<string, number>;
}

export default function RoleList({
  roles,
  selectedRole,
  onSelectRole,
  locale,
  userCounts
}: RoleListProps) {
  // Search filter function
  const searchFilter = (role: Role, searchText: string) => {
    return (
      role.name.toLowerCase().includes(searchText) ||
      role.displayName.toLowerCase().includes(searchText) ||
      role.description.toLowerCase().includes(searchText)
    );
  };

  // Render primary text - displayName + description 한 줄에 가로 배치
  const renderPrimary = (role: Role) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      {/* displayName */}
      <Typography
        variant="body2"
        fontWeight={500}
        noWrap
        component="span"
        sx={{ minWidth: 100, maxWidth: 120 }}
      >
        {role.displayName}
      </Typography>

      {/* description */}
      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        component="span"
        sx={{ flex: 1, minWidth: 0 }}
      >
        {role.description}
      </Typography>

      {/* Management badge */}
      {role.roleType === 'management' && (
        <Chip
          label={locale === 'ko' ? '관리' : 'Mgmt'}
          size="small"
          color="primary"
          sx={{ height: 18, fontSize: '0.65rem', flexShrink: 0 }}
        />
      )}

      {/* User count badge */}
      <Chip
        label={userCounts[role.id] || 0}
        size="small"
        color="default"
        sx={{ height: 18, fontSize: '0.65rem', minWidth: 32, flexShrink: 0 }}
      />
    </Box>
  );

  return (
    <MasterListPanel
      title={locale === 'ko' ? '역할' : 'Roles'}
      items={roles}
      selectedItem={selectedRole}
      onSelectItem={onSelectRole}
      renderPrimary={renderPrimary}
      searchPlaceholder={locale === 'ko' ? '역할 검색...' : 'Search roles...'}
      searchFilter={searchFilter}
      locale={locale}
    />
  );
}
