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
  Alert
} from '@mui/material';
import { Chat, Schedule, CalendarToday, AccountTree } from '@mui/icons-material';
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
  onClick
}: {
  conversation: Conversation;
  onClick: () => void;
}) {
  return (
    <CardWrapper onClick={onClick}>
      {/* Header - Category & Difficulty */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <CategoryBadge category={conversation.category} size="small" />
        <DifficultyBadge difficulty={conversation.difficulty_level} size="small" />
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

          {/* Conversations Grid */}
          <CardGrid
            items={conversations}
            loading={loading}
            skeletonCount={pageSize}
            columns={{ xs: 12, sm: 6, md: 4 }}
            renderCard={(conv) => (
              <ConversationCard conversation={conv} onClick={() => handleCardClick(conv.id)} />
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
    </Box>
  );
}
