'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Tooltip
} from '@mui/material';
import { Chat, Schedule, CalendarToday, AccountTree, Delete, DeleteSweep } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import CardGrid, { CardWrapper } from '@/components/common/CardGrid';
import {
  CategoryBadge,
  DifficultyBadge,
  MetaInfo,
  BranchBadge,
  categoryConfigs,
  difficultyColors
} from '@/components/common/Badge';
import { formatDate } from '@/lib/utils/date';
import axiosInstance from '@/lib/axios';

// Types
interface Conversation {
  id: string;
  title: string;
  category: string;
  difficulty_level: string;
  branch_name: string;
  total_messages: number;
  duration_minutes: number;
  started_at: string;
  tags: Array<{ id: string; name: string; color: string }> | null;
}

interface Stats {
  total: number;
  avgDuration: number;
  avgMessages: number;
  totalMessages: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  byMonth: Record<string, number>;
}

interface FilterOptions {
  categories: string[];
  difficulties: string[];
  branches: string[];
}

// Conversation Card Component - using common Badge components
function ConversationCard({
  conversation,
  onClick,
  selectionMode = false,
  selected = false,
  onSelect,
  onDelete
}: {
  conversation: Conversation;
  onClick: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(conversation.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(conversation.id);
  };

  return (
    <CardWrapper onClick={selectionMode ? () => onSelect?.(conversation.id) : onClick}>
      {/* Header - Category & Difficulty + Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectionMode && (
            <Checkbox
              checked={selected}
              onClick={handleCheckboxClick}
              size="small"
              sx={{ p: 0, mr: 0.5 }}
            />
          )}
          <CategoryBadge category={conversation.category} size="small" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DifficultyBadge difficulty={conversation.difficulty_level} size="small" />
          {!selectionMode && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  ml: 0.5,
                  p: 0.5,
                  color: 'grey.400',
                  '&:hover': { color: 'error.main', bgcolor: 'error.lighter' }
                }}
              >
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Title */}
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{
          mb: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.4,
          minHeight: 42,
          color: 'grey.800'
        }}
      >
        {conversation.title}
      </Typography>

      {/* Meta Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <MetaInfo icon={<Chat sx={{ fontSize: 14 }} />} value={conversation.total_messages} />
        {conversation.duration_minutes > 0 && (
          <MetaInfo icon={<Schedule sx={{ fontSize: 14 }} />} value={`${conversation.duration_minutes}m`} />
        )}
      </Box>

      {/* Footer - Date & Branch */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'grey.100'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.400' }}>
          <CalendarToday sx={{ fontSize: 12 }} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
            {formatDate(conversation.started_at)}
          </Typography>
        </Box>
        <BranchBadge branch={conversation.branch_name} size="small" />
      </Box>
    </CardWrapper>
  );
}

export default function ConversationsPage() {
  const locale = useCurrentLocale();
  const router = useRouter();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Advanced filter panel state
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // Delete functionality state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch filter options and stats
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsRes, filtersRes] = await Promise.all([
          axiosInstance.get('/conversation/stats'),
          axiosInstance.get('/conversation/filters')
        ]);
        setStats(statsRes.data);
        setFilterOptions(filtersRes.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (branch) params.append('branch', branch);

      const response = await axiosInstance.get(`/conversation?${params.toString()}`);
      setConversations(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, category, difficulty, branch]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Reset page when filters or page size change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, difficulty, branch, pageSize]);

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
  };

  // Handle card click
  const handleCardClick = (id: string) => {
    router.push(`/${locale}/dev/conversations/${id}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setBranch('');
  };

  // Quick search handler
  const handleQuickSearch = () => {
    fetchConversations();
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (difficulty) count++;
    if (branch) count++;
    return count;
  }, [category, difficulty, branch]);

  // Selection handlers
  const handleToggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === conversations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(conversations.map((c) => c.id)));
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds(new Set());
  };

  // Delete handlers
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`/conversation/${deleteTargetId}`);
      setSnackbar({ open: true, message: 'Conversation deleted successfully', severity: 'success' });
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setSnackbar({ open: true, message: 'Failed to delete conversation', severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleBatchDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;

    setDeleting(true);
    try {
      await axiosInstance.delete('/conversation/batch', { data: { ids: Array.from(selectedIds) } });
      setSnackbar({
        open: true,
        message: `${selectedIds.size} conversation(s) deleted successfully`,
        severity: 'success'
      });
      setSelectedIds(new Set());
      setSelectionMode(false);
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversations:', err);
      setSnackbar({ open: true, message: 'Failed to delete conversations', severity: 'error' });
    } finally {
      setDeleting(false);
      setBatchDeleteDialogOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 10
        }}
      >
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Sticky Search Bar */}
          <Box sx={{ pb: 2 }}>
            <QuickSearchBar
              searchValue={search}
              onSearchChange={setSearch}
              onSearch={handleQuickSearch}
              onClear={clearFilters}
              onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
              placeholder="Search conversations..."
              searching={loading}
              activeFilterCount={activeFilterCount}
              showAdvancedButton={true}
            />

            {/* Advanced Filter Panel */}
            {advancedFilterOpen && (
              <SearchFilterPanel
                title="Filters"
                activeFilterCount={activeFilterCount}
                onApply={handleQuickSearch}
                onClear={clearFilters}
                onClose={() => setAdvancedFilterOpen(false)}
                mode="advanced"
                expanded={true}
                showHeader={false}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Category */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {filterOptions?.categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: categoryConfigs[cat]?.color }}>{categoryConfigs[cat]?.icon}</Box>
                            <Typography variant="body2">{categoryConfigs[cat]?.label || cat}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Difficulty */}
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={difficulty}
                      label="Difficulty"
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {filterOptions?.difficulties.map((diff) => (
                        <MenuItem key={diff} value={diff}>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: `${difficultyColors[diff]}15`,
                              color: difficultyColors[diff],
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              textTransform: 'capitalize'
                            }}
                          >
                            {diff}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Branch */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={branch}
                      label="Branch"
                      onChange={(e) => setBranch(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {filterOptions?.branches.map((br) => (
                        <MenuItem key={br} value={br}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccountTree sx={{ fontSize: 14, color: 'grey.500' }} />
                            <Typography variant="body2">{br}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Category Quick Filters */}
                {stats && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {Object.entries(stats.byCategory).map(([cat, count]) => (
                      <Chip
                        key={cat}
                        icon={categoryConfigs[cat]?.icon as React.ReactElement}
                        label={`${categoryConfigs[cat]?.label || cat} (${count})`}
                        onClick={() => setCategory(category === cat ? '' : cat)}
                        size="small"
                        sx={{
                          bgcolor: category === cat ? categoryConfigs[cat]?.color : 'white',
                          color: category === cat ? 'white' : categoryConfigs[cat]?.color,
                          borderColor: categoryConfigs[cat]?.color,
                          border: '1px solid',
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            color: category === cat ? 'white' : categoryConfigs[cat]?.color
                          },
                          '&:hover': {
                            bgcolor: category === cat ? categoryConfigs[cat]?.color : `${categoryConfigs[cat]?.color}10`
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </SearchFilterPanel>
            )}
          </Box>
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PageContainer sx={{ py: 2 }}>
          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Selection Toolbar */}
          {selectionMode && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                p: 1.5,
                bgcolor: 'primary.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={selectedIds.size === conversations.length && conversations.length > 0}
                  indeterminate={selectedIds.size > 0 && selectedIds.size < conversations.length}
                  onChange={handleSelectAll}
                  size="small"
                />
                <Typography variant="body2" fontWeight={500}>
                  {selectedIds.size} selected
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleSelectionMode}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteSweep />}
                  disabled={selectedIds.size === 0}
                  onClick={() => setBatchDeleteDialogOpen(true)}
                >
                  Delete ({selectedIds.size})
                </Button>
              </Box>
            </Box>
          )}

          {/* Bulk Selection Toggle Button */}
          {!selectionMode && conversations.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteSweep />}
                onClick={toggleSelectionMode}
                sx={{ color: 'grey.600', borderColor: 'grey.300' }}
              >
                Select Multiple
              </Button>
            </Box>
          )}

          {/* Conversations Grid */}
          <CardGrid
            items={conversations}
            loading={loading}
            skeletonCount={pageSize}
            columns={{ xs: 12, sm: 6, md: 4 }}
            renderCard={(conv) => (
              <ConversationCard
                conversation={conv}
                onClick={() => handleCardClick(conv.id)}
                selectionMode={selectionMode}
                selected={selectedIds.has(conv.id)}
                onSelect={handleToggleSelection}
                onDelete={handleDeleteClick}
              />
            )}
            pagination={{
              page,
              totalPages,
              onChange: setPage
            }}
            pageSize={{
              value: pageSize,
              onChange: handlePageSizeChange
            }}
            totalCount={total}
            emptyIcon={<Chat sx={{ fontSize: 64 }} />}
            emptyTitle="No conversations found"
            emptyDescription="Try adjusting your search or filters"
          />
        </PageContainer>
      </Box>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action cannot be undone.
            All messages and related data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)}>
        <DialogTitle>Delete Multiple Conversations</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedIds.size} conversation(s)?
            This action cannot be undone. All messages and related data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleBatchDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : `Delete ${selectedIds.size} Conversation(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
