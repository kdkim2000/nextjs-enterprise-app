'use client';

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, MoreVert as MoreVertIcon, LockReset as LockResetIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

export interface CustomAction {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface ActionsCellProps {
  /**
   * The row data (for generic typing)
   */
  row?: any;

  /**
   * Callback when edit button is clicked
   */
  onEdit?: () => void;

  /**
   * Callback when view button is clicked
   */
  onView?: () => void;

  /**
   * Callback when reset password button is clicked
   */
  onResetPassword?: () => void;

  /**
   * Callback when more (⋮) button is clicked
   */
  onMore?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Custom action buttons
   */
  customActions?: CustomAction[];

  /**
   * Whether the row is editable (shows edit button)
   * @default true
   */
  editable?: boolean;

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
   * Label for view button
   * @default "View"
   */
  viewLabel?: string;

  /**
   * Tooltip text for reset password button
   * @default "Reset Password"
   */
  resetPasswordTooltip?: string;

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
 * Provides Edit, View, Reset Password, Custom Actions, and More (⋮) action buttons
 */
export default function ActionsCell({
  onEdit,
  onView,
  onResetPassword,
  onMore,
  customActions,
  editable = true,
  showEdit = true,
  showMore = true,
  editTooltip = 'Edit',
  viewLabel = 'View',
  resetPasswordTooltip = 'Reset Password',
  moreTooltip = 'More actions',
  disabled = false
}: ActionsCellProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {showEdit && editable && onEdit && (
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

      {onView && (
        <Tooltip title={viewLabel}>
          <span>
            <IconButton
              size="small"
              onClick={onView}
              color="info"
              disabled={disabled}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {onResetPassword && (
        <Tooltip title={resetPasswordTooltip}>
          <span>
            <IconButton
              size="small"
              onClick={onResetPassword}
              color="warning"
              disabled={disabled}
            >
              <LockResetIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {customActions?.map((action, index) => (
        <Tooltip key={index} title={action.label}>
          <span>
            <IconButton
              size="small"
              onClick={action.onClick}
              color={action.color || 'default'}
              disabled={disabled}
            >
              {action.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}

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
