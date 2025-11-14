'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import { Search, Add, Edit, Delete } from '@mui/icons-material';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import EmptyState from '@/components/common/EmptyState';

export interface MasterItem {
  id: string;
  [key: string]: any;
}

interface MasterListPanelProps<T extends MasterItem> {
  title: string;
  items: T[];
  selectedItem: T | null;
  onSelectItem: (item: T) => void;
  onAddItem?: () => void;
  onEditItem?: (item: T) => void;
  onDeleteItem?: (item: T) => void;
  renderPrimary: (item: T) => ReactNode;
  renderSecondary?: (item: T) => ReactNode;
  searchPlaceholder?: string;
  searchFilter: (item: T, searchText: string) => boolean;
  locale: string;
  showCount?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
}

export default function MasterListPanel<T extends MasterItem>({
  title,
  items,
  selectedItem,
  onSelectItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
  renderPrimary,
  renderSecondary,
  searchPlaceholder,
  searchFilter,
  locale,
  showCount = true,
  showSearch = true,
  showActions = true
}: MasterListPanelProps<T>) {
  const [searchText, setSearchText] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter items based on search text
  const filteredItems = useMemo(() => {
    if (!searchText) return items;
    return items.filter((item) => searchFilter(item, searchText.toLowerCase()));
  }, [items, searchText, searchFilter]);

  // Handle item click
  const handleItemClick = (item: T) => {
    onSelectItem(item);
  };

  // Handle delete
  const handleDelete = (item: T, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDeleteItem) {
      onDeleteItem(item);
    }
  };

  // Handle edit
  const handleEdit = (item: T, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onEditItem) {
      onEditItem(item);
    }
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header with Title and Add Button */}
      <Box sx={{ p: 1.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {onAddItem && (
          <Tooltip title={locale === 'ko' ? '추가' : 'Add'}>
            <IconButton
              size="small"
              onClick={onAddItem}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.50' }
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Quick Search Bar */}
      {showSearch && (
        <Box sx={{ px: 1.5, pb: 1 }}>
          <QuickSearchBar
            searchValue={searchText}
            onSearchChange={setSearchText}
            onSearch={() => {}}
            onClear={() => setSearchText('')}
            placeholder={searchPlaceholder || (locale === 'ko' ? '검색...' : 'Search...')}
            searching={false}
            activeFilterCount={0}
            showAdvancedButton={false}
          />
        </Box>
      )}

      {/* Count Badge */}
      {showCount && (
        <Box sx={{ px: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: 'primary.50',
              borderRadius: 1,
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem'
            }}
          >
            {searchText && filteredItems.length !== items.length
              ? locale === 'ko'
                ? `총 ${filteredItems.length.toLocaleString()} 건 / ${items.length.toLocaleString()} 건`
                : `Total ${filteredItems.length.toLocaleString()} / ${items.length.toLocaleString()}`
              : locale === 'ko'
              ? `총 ${items.length.toLocaleString()} 건`
              : `Total ${items.length.toLocaleString()}`}
          </Box>
        </Box>
      )}

      <Divider />

      {/* List */}
      {filteredItems.length === 0 && items.length > 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <EmptyState
            icon={Search}
            title={locale === 'ko' ? '검색 결과가 없습니다' : 'No results found'}
            description={
              locale === 'ko'
                ? '다른 검색어로 시도해보세요'
                : 'Try a different search term'
            }
          />
        </Box>
      ) : filteredItems.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <EmptyState
            icon={Search}
            title={locale === 'ko' ? '항목이 없습니다' : 'No items'}
            description={
              locale === 'ko'
                ? '새로운 항목을 추가해보세요'
                : 'Add a new item to get started'
            }
          />
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem
                disablePadding
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                secondaryAction={
                  showActions &&
                  (hoveredId === item.id || selectedItem?.id === item.id) && (
                    <Stack direction="row" spacing={0.5}>
                      {onEditItem && (
                        <Tooltip title={locale === 'ko' ? '수정' : 'Edit'}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleEdit(item, e)}
                            sx={{ color: 'action.active' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDeleteItem && (
                        <Tooltip title={locale === 'ko' ? '삭제' : 'Delete'}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(item, e)}
                            sx={{ color: 'error.main' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  )
                }
              >
                <ListItemButton
                  selected={selectedItem?.id === item.id}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    py: 1,
                    px: 2,
                    minHeight: 48,
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      borderLeft: '3px solid',
                      borderLeftColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.100'
                      }
                    }
                  }}
                >
                  <ListItemText
                    primary={renderPrimary(item)}
                    secondary={renderSecondary ? renderSecondary(item) : undefined}
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
}
