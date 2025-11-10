'use client';

import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Edit, Delete, MoreVert } from '@mui/icons-material';

export interface ActionsCellProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  editTooltip?: string;
  deleteTooltip?: string;
  moreTooltip?: string;
  disabled?: boolean;
}

export default function ActionsCell({
  onEdit,
  onDelete,
  onMore,
  editTooltip = 'Edit',
  deleteTooltip = 'Delete',
  moreTooltip = 'More actions',
  disabled = false
}: ActionsCellProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onEdit && (
        <Tooltip title={editTooltip}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={disabled}
            color="primary"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={disabled}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip title={moreTooltip}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMore();
            }}
            disabled={disabled}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
