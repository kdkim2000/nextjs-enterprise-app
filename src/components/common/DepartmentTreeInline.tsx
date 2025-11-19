'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  FormLabel,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderOpenIcon,
  Folder as FolderIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RadioButtonChecked as RadioButtonCheckedIcon
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface Department {
  id: string;
  code: string;
  parent_id: string | null;
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
  currentDepartmentId?: string; // To prevent selecting self or descendants as parent
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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

      if (!dept.parent_id) {
        rootNodes.push(node);
      } else {
        const parent = nodeMap.get(dept.parent_id);
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

  // Get all descendant IDs of current department (to prevent circular reference)
  const disabledIds = useMemo(() => {
    if (!currentDepartmentId) return new Set<string>();

    const descendants = new Set<string>([currentDepartmentId]);

    const findDescendants = (parentId: string) => {
      departments.forEach(dept => {
        if (dept.parent_id === parentId && !descendants.has(dept.id)) {
          descendants.add(dept.id);
          findDescendants(dept.id);
        }
      });
    };

    findDescendants(currentDepartmentId);
    return descendants;
  }, [departments, currentDepartmentId]);

  const handleToggleExpand = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleSelect = (deptId: string) => {
    if (disabled || disabledIds.has(deptId)) return;
    onChange(deptId === value ? '' : deptId);
  };

  const handleSelectNone = () => {
    if (disabled) return;
    onChange('');
  };

  const renderTreeNode = (node: DepartmentTreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = value === node.id;
    const hasChildren = node.children.length > 0;
    const isDisabled = disabledIds.has(node.id);
    const indent = depth * 24;

    return (
      <Box key={node.id}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.75,
            px: 1,
            pl: `${indent + 8}px`,
            cursor: isDisabled || disabled ? 'not-allowed' : 'pointer',
            bgcolor: isSelected ? 'primary.light' : 'transparent',
            opacity: isDisabled ? 0.4 : 1,
            '&:hover': {
              bgcolor: isDisabled || disabled ? 'transparent' : isSelected ? 'primary.light' : 'action.hover'
            },
            borderRadius: 1,
            transition: 'background-color 0.2s'
          }}
          onClick={() => !isDisabled && handleSelect(node.id)}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => handleToggleExpand(node.id, e)}
              sx={{ mr: 0.5, p: 0.5 }}
              disabled={disabled}
            >
              {isExpanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <Box sx={{ width: 28, mr: 0.5 }} />
          )}

          {isExpanded && hasChildren ? (
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

          {isSelected ? (
            <RadioButtonCheckedIcon
              fontSize="small"
              color="primary"
              sx={{ mr: 1 }}
            />
          ) : (
            <RadioButtonUncheckedIcon
              fontSize="small"
              sx={{ mr: 1, color: 'action.active' }}
            />
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
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
              noWrap
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

        {hasChildren && isExpanded && (
          <Box>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.75,
              px: 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
              bgcolor: value === '' ? 'primary.light' : 'transparent',
              '&:hover': {
                bgcolor: disabled ? 'transparent' : value === '' ? 'primary.light' : 'action.hover'
              },
              borderRadius: 1,
              mb: 1,
              transition: 'background-color 0.2s'
            }}
            onClick={handleSelectNone}
          >
            <Box sx={{ width: 28, mr: 0.5 }} />

            <FolderIcon
              fontSize="small"
              sx={{ mr: 1, color: 'action.active' }}
            />

            {value === '' ? (
              <RadioButtonCheckedIcon
                fontSize="small"
                color="primary"
                sx={{ mr: 1 }}
              />
            ) : (
              <RadioButtonUncheckedIcon
                fontSize="small"
                sx={{ mr: 1, color: 'action.active' }}
              />
            )}

            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                fontWeight: value === '' ? 600 : 400,
                color: 'text.secondary'
              }}
            >
              {noneLabel}
            </Typography>
          </Box>
        )}

        <Box>
          {departmentTree.map(node => renderTreeNode(node))}
        </Box>
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
