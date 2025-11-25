'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormLabel,
  Chip,
  Button
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface Department {
  id: string;
  code: string;
  parent_id?: string | null;
  parentId?: string | null;
  name: {
    en: string;
    ko: string;
    zh: string;
    vi: string;
  };
  level: number;
}

interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}

interface DepartmentTreeInlineProps {
  value: string;
  onChange: (value: string) => void;
  departments: Department[];
  locale?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  allowNone?: boolean;
  noneLabel?: string;
  currentDepartmentId?: string;
}

export default function DepartmentTreeInline({
  value,
  onChange,
  departments,
  locale = 'en',
  label = 'Parent Department',
  required = false,
  disabled = false,
  error = false,
  helperText,
  allowNone = true,
  noneLabel = 'None (Top Level)',
  currentDepartmentId
}: DepartmentTreeInlineProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Helper function to get parent ID (supports both snake_case and camelCase)
  const getParentId = (dept: Department): string | null => {
    return dept.parent_id ?? dept.parentId ?? null;
  };

  // Build tree structure from flat department list
  const departmentTree = useMemo(() => {
    const nodeMap = new Map<string, DepartmentTreeNode>();
    const rootNodes: DepartmentTreeNode[] = [];

    // Create nodes
    departments.forEach(dept => {
      nodeMap.set(dept.id, { ...dept, children: [] });
    });

    // Build tree
    departments.forEach(dept => {
      const node = nodeMap.get(dept.id);
      if (!node) return;

      const parentId = getParentId(dept);
      if (!parentId) {
        rootNodes.push(node);
      } else {
        const parent = nodeMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    });

    // Sort children by code
    const sortChildren = (node: DepartmentTreeNode) => {
      node.children.sort((a, b) => a.code.localeCompare(b.code));
      node.children.forEach(sortChildren);
    };
    rootNodes.forEach(sortChildren);

    return rootNodes;
  }, [departments]);

  // Get all descendant IDs of current department
  const disabledIds = useMemo(() => {
    if (!currentDepartmentId) return new Set<string>();

    const descendants = new Set<string>([currentDepartmentId]);

    const findDescendants = (parentIdToFind: string) => {
      departments.forEach(dept => {
        const deptParentId = getParentId(dept);
        if (deptParentId === parentIdToFind && !descendants.has(dept.id)) {
          descendants.add(dept.id);
          findDescendants(dept.id);
        }
      });
    };

    findDescendants(currentDepartmentId);
    return descendants;
  }, [departments, currentDepartmentId]);

  const handleSelect = (_event: React.SyntheticEvent | null, itemId: string | null) => {
    if (itemId && !disabled && !disabledIds.has(itemId)) {
      onChange(itemId === value ? '' : itemId);
    }
  };

  const handleSelectNone = () => {
    if (!disabled) {
      onChange('');
    }
  };

  const isItemDisabled = (itemId: string): boolean => {
    return disabledIds.has(itemId);
  };

  const renderTreeItems = (nodes: DepartmentTreeNode[]) => {
    return nodes.map((node) => {
      const isDisabled = isItemDisabled(node.id);
      const isSelected = value === node.id;

      return (
        <TreeItem
          key={node.id}
          itemId={node.id}
          disabled={isDisabled}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
              {node.children.length > 0 ? (
                <FolderOpenIcon
                  fontSize="small"
                  sx={{ mr: 1, color: 'primary.main' }}
                />
              ) : (
                <FolderIcon
                  fontSize="small"
                  sx={{ mr: 1, color: 'action.active' }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 600 : 400,
                    color: isDisabled ? 'text.disabled' : 'text.primary'
                  }}
                >
                  {getLocalizedValue(node.name, locale)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {node.code}
                </Typography>
              </Box>
              {isDisabled && currentDepartmentId && (
                <Chip
                  label="Cannot select"
                  size="small"
                  color="warning"
                  sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          }
          sx={{
            '& .MuiTreeItem-content': {
              borderRadius: 1,
              my: 0.25,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.light'
                }
              },
              '&:hover': {
                bgcolor: isDisabled ? 'transparent' : 'action.hover'
              },
              '&.Mui-disabled': {
                opacity: 0.4
              }
            }
          }}
        >
          {node.children.length > 0 && renderTreeItems(node.children)}
        </TreeItem>
      );
    });
  };

  return (
    <Box>
      <FormLabel
        required={required}
        error={error}
        disabled={disabled}
        sx={{ mb: 1, display: 'block', fontSize: '0.875rem' }}
      >
        {label}
      </FormLabel>

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          maxHeight: 400,
          overflow: 'auto',
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          borderColor: error ? 'error.main' : 'divider',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'action.hover',
            borderRadius: 1
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.disabled',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.active'
            }
          }
        }}
      >
        {allowNone && (
          <Button
            fullWidth
            variant={value === '' ? 'contained' : 'outlined'}
            size="small"
            onClick={handleSelectNone}
            disabled={disabled}
            startIcon={<FolderIcon />}
            sx={{
              justifyContent: 'flex-start',
              mb: 1,
              textTransform: 'none',
              fontStyle: 'italic'
            }}
          >
            {noneLabel}
          </Button>
        )}

        <SimpleTreeView
          selectedItems={value || null}
          onSelectedItemsChange={handleSelect}
          expandedItems={expandedItems}
          onExpandedItemsChange={(_event, itemIds) => setExpandedItems(itemIds)}
          sx={{
            flexGrow: 1,
            overflowY: 'auto'
          }}
        >
          {renderTreeItems(departmentTree)}
        </SimpleTreeView>
      </Paper>

      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, ml: 1.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
