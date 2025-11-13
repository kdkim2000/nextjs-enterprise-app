'use client';

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

export interface ActionsCellProps {
  /**
   * Callback when edit button is clicked
   */
  onEdit?: () => void;

  /**
   * Callback when more (⋮) button is clicked
   */
  onMore?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Whether to show the edit button
   * @default true
   */
  showEdit?: boolean;

  /**
   * Whether to show the more (⋮) button
   * @default true
   */
  showMore?: boolean;

  /**
   * Tooltip text for edit button
   * @default "Edit"
   */
  editTooltip?: string;

  /**
   * Tooltip text for more button
   * @default "More actions"
   */
  moreTooltip?: string;

  /**
   * Whether to disable the buttons
   * @default false
   */
  disabled?: boolean;
}

/**
 * Common Actions Cell component for DataGrid
 * Provides Edit and More (⋮) action buttons
 */
export default function ActionsCell({
  onEdit,
  onMore,
  showEdit = true,
  showMore = true,
  editTooltip = 'Edit',
  moreTooltip = 'More actions',
  disabled = false
}: ActionsCellProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {showEdit && onEdit && (
        <Tooltip title={editTooltip}>
          <span>
            <IconButton
              size="small"
              onClick={onEdit}
              color="primary"
              disabled={disabled}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {showMore && onMore && (
        <Tooltip title={moreTooltip}>
          <span>
            <IconButton
              size="small"
              onClick={onMore}
              color="default"
              disabled={disabled}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
