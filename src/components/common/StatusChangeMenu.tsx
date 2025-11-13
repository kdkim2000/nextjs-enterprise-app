'use client';

import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon
} from '@mui/icons-material';

export interface StatusChangeMenuProps<T = any> {
  /**
   * Anchor element for the menu
   */
  anchorEl: null | HTMLElement;

  /**
   * Callback when menu is closed
   */
  onClose: () => void;

  /**
   * Selected item
   */
  selectedItem: T | null;

  /**
   * Current status field name in the item
   * @default "status"
   */
  statusField?: keyof T;

  /**
   * Draft status value
   * @default "draft"
   */
  draftValue?: string;

  /**
   * Published status value
   * @default "published"
   */
  publishedValue?: string;

  /**
   * Callback when edit is clicked
   */
  onEdit?: (item: T) => void;

  /**
   * Callback when status change is requested
   */
  onStatusChange?: (item: T, newStatus: string) => void;

  /**
   * Callback when delete is clicked
   */
  onDelete?: (item: T) => void;

  /**
   * Whether to show edit option
   * @default true
   */
  showEdit?: boolean;

  /**
   * Whether to show status change options
   * @default true
   */
  showStatusChange?: boolean;

  /**
   * Whether to show delete option
   * @default true
   */
  showDelete?: boolean;

  /**
   * Custom menu items to add
   */
  customItems?: React.ReactNode;
}

/**
 * Common Status Change Menu component
 * Provides Edit, Publish/Unpublish, and Delete actions
 */
export default function StatusChangeMenu<T = any>({
  anchorEl,
  onClose,
  selectedItem,
  statusField = 'status' as keyof T,
  draftValue = 'draft',
  publishedValue = 'published',
  onEdit,
  onStatusChange,
  onDelete,
  showEdit = true,
  showStatusChange = true,
  showDelete = true,
  customItems
}: StatusChangeMenuProps<T>) {
  const currentStatus = selectedItem ? (selectedItem[statusField] as string) : null;

  const handleEdit = () => {
    if (selectedItem && onEdit) {
      onEdit(selectedItem);
      onClose();
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedItem && onStatusChange) {
      onStatusChange(selectedItem, newStatus);
      onClose();
    }
  };

  const handleDelete = () => {
    if (selectedItem && onDelete) {
      onDelete(selectedItem);
      onClose();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      {showEdit && onEdit && (
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
      )}

      {showStatusChange && onStatusChange && currentStatus === draftValue && (
        <MenuItem onClick={() => handleStatusChange(publishedValue)}>
          <PublishIcon fontSize="small" sx={{ mr: 1 }} />
          Publish
        </MenuItem>
      )}

      {showStatusChange && onStatusChange && currentStatus === publishedValue && (
        <MenuItem onClick={() => handleStatusChange(draftValue)}>
          <UnpublishedIcon fontSize="small" sx={{ mr: 1 }} />
          Unpublish
        </MenuItem>
      )}

      {customItems}

      {showDelete && onDelete && (
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      )}
    </Menu>
  );
}
