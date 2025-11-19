'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon
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

interface DepartmentTreeSelectProps {
  value: string;
  onChange: (value: string) => void;
  departments: Department[];
  locale?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function DepartmentTreeSelect({
  value,
  onChange,
  departments,
  locale = 'en',
  label = 'Department',
  required = false,
  disabled = false,
  error = false,
  helperText
}: DepartmentTreeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>(value);

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
          // If parent not found, add to root
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

  // Find selected department
  const selectedDepartment = useMemo(() => {
    return departments.find(dept => dept.id === value);
  }, [departments, value]);

  // Filter tree by search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return departmentTree;

    const query = searchQuery.toLowerCase();
    const matchingIds = new Set<string>();

    // Find all matching departments
    departments.forEach(dept => {
      const nameMatch = Object.values(dept.name).some(name =>
        name.toLowerCase().includes(query)
      );
      const codeMatch = dept.code.toLowerCase().includes(query);

      if (nameMatch || codeMatch) {
        matchingIds.add(dept.id);

        // Add all ancestors
        let currentId = dept.parent_id;
        while (currentId) {
          matchingIds.add(currentId);
          const parent = departments.find(d => d.id === currentId);
          currentId = parent?.parent_id || null;
        }
      }
    });

    // Filter tree
    const filterNode = (node: DepartmentTreeNode): DepartmentTreeNode | null => {
      if (!matchingIds.has(node.id)) return null;

      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is DepartmentTreeNode => child !== null);

      return { ...node, children: filteredChildren };
    };

    return departmentTree
      .map(filterNode)
      .filter((node): node is DepartmentTreeNode => node !== null);
  }, [departmentTree, departments, searchQuery]);

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const expanded = new Set<string>();
      const addNodeAndAncestors = (nodeId: string) => {
        expanded.add(nodeId);
        const dept = departments.find(d => d.id === nodeId);
        if (dept?.parent_id) {
          addNodeAndAncestors(dept.parent_id);
        }
      };

      filteredTree.forEach(node => {
        const addAllNodes = (n: DepartmentTreeNode) => {
          addNodeAndAncestors(n.id);
          n.children.forEach(addAllNodes);
        };
        addAllNodes(node);
      });

      setExpandedNodes(expanded);
    }
  }, [searchQuery, filteredTree, departments]);

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

  const handleSelect = (dept: Department) => {
    setSelectedId(dept.id);
  };

  const handleConfirm = () => {
    onChange(selectedId);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedId(value);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedId('');
  };

  const renderTreeNode = (node: DepartmentTreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children.length > 0;
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
            cursor: 'pointer',
            bgcolor: isSelected ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: isSelected ? 'action.selected' : 'action.hover'
            },
            borderRadius: 1
          }}
          onClick={() => handleSelect(node)}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => handleToggleExpand(node.id, e)}
              sx={{ mr: 0.5, p: 0.5 }}
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

          <BusinessIcon
            fontSize="small"
            sx={{ mr: 1, color: 'action.active', opacity: 0.6 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
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

          {isSelected && (
            <Chip
              label="Selected"
              size="small"
              color="primary"
              sx={{ ml: 1, height: 20 }}
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
    <>
      <TextField
        fullWidth
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        value={selectedDepartment ? getLocalizedValue(selectedDepartment.name, locale) : ''}
        placeholder="Select department..."
        onClick={() => !disabled && setOpen(true)}
        InputProps={{
          readOnly: true,
          endAdornment: selectedDepartment && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                disabled={disabled}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '& .MuiInputBase-input': {
            cursor: disabled ? 'default' : 'pointer'
          }
        }}
      />

      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { height: '70vh', maxHeight: '600px' }
        }}
      >
        <DialogTitle>
          {label}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mt: 2 }}
          />
        </DialogTitle>

        <DialogContent dividers sx={{ p: 1 }}>
          {filteredTree.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
              <Typography variant="body2">
                No departments found
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredTree.map(node => renderTreeNode(node))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClear} color="inherit">
            Clear
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!selectedId}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
