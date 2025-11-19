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
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
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
  const [selectedId, setSelectedId] = useState<string>(value);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
      const expanded: string[] = [];
      const addNodeAndAncestors = (nodeId: string) => {
        if (!expanded.includes(nodeId)) {
          expanded.push(nodeId);
        }
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

      setExpandedItems(expanded);
    } else {
      setExpandedItems([]);
    }
  }, [searchQuery, filteredTree, departments]);

  const handleSelect = (_event: React.SyntheticEvent, itemId: string | null) => {
    if (itemId) {
      setSelectedId(itemId);
    }
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

  const renderTreeItems = (nodes: DepartmentTreeNode[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">
                {getLocalizedValue(node.name, locale)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {node.code}
              </Typography>
            </Box>
          </Box>
        }
        sx={{
          '& .MuiTreeItem-content': {
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.light',
              '&:hover': {
                bgcolor: 'primary.light'
              }
            },
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }
        }}
      >
        {node.children.length > 0 && renderTreeItems(node.children)}
      </TreeItem>
    ));
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

        <DialogContent dividers sx={{ p: 2 }}>
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
            <SimpleTreeView
              selectedItems={selectedId}
              onSelectedItemsChange={handleSelect}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_event, itemIds) => setExpandedItems(itemIds)}
              sx={{
                flexGrow: 1,
                overflowY: 'auto'
              }}
            >
              {renderTreeItems(filteredTree)}
            </SimpleTreeView>
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
