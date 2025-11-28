'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Search,
  Chat,
  Schedule,
  Code,
  BugReport,
  Build,
  Psychology,
  Speed,
  Refresh,
  CalendarToday,
  AccountTree,
  Clear
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import CardGrid, { CardWrapper, StatCard } from '@/components/common/CardGrid';
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

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'bug-fix': { icon: <BugReport sx={{ fontSize: 18 }} />, color: '#ef4444', label: 'Bug Fix' },
  feature: { icon: <Build sx={{ fontSize: 18 }} />, color: '#22c55e', label: 'Feature' },
  refactor: { icon: <Code sx={{ fontSize: 18 }} />, color: '#a855f7', label: 'Refactor' },
  debugging: { icon: <Psychology sx={{ fontSize: 18 }} />, color: '#f97316', label: 'Debugging' },
  performance: { icon: <Speed sx={{ fontSize: 18 }} />, color: '#06b6d4', label: 'Performance' },
  general: { icon: <Chat sx={{ fontSize: 18 }} />, color: '#6b7280', label: 'General' }
};

// Difficulty colors
const difficultyColors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444'
};

// Conversation Card Component
function ConversationCard({
  conversation,
  onClick
}: {
  conversation: Conversation;
  onClick: () => void;
}) {
  const catConfig = categoryConfig[conversation.category] || categoryConfig.general;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <CardWrapper onClick={onClick}>
      {/* Header - Category & Difficulty */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: `${catConfig.color}10`,
            color: catConfig.color
          }}
        >
          {catConfig.icon}
          <Typography variant="caption" fontWeight={600}>
            {catConfig.label}
          </Typography>
        </Box>
        <Chip
          label={conversation.difficulty_level}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 600,
            bgcolor: `${difficultyColors[conversation.difficulty_level]}15`,
            color: difficultyColors[conversation.difficulty_level],
            textTransform: 'capitalize',
            border: 'none'
          }}
        />
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
          <Chat sx={{ fontSize: 14 }} />
          <Typography variant="caption">{conversation.total_messages}</Typography>
        </Box>
        {conversation.duration_minutes > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}>
            <Schedule sx={{ fontSize: 14 }} />
            <Typography variant="caption">{conversation.duration_minutes}m</Typography>
          </Box>
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
        {conversation.branch_name && conversation.branch_name !== 'unknown' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: 'grey.100',
              color: 'grey.600'
            }}
          >
            <AccountTree sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              {conversation.branch_name}
            </Typography>
          </Box>
        )}
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
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
      params.append('limit', '12');
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
  }, [page, debouncedSearch, category, difficulty, branch]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, difficulty, branch]);

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

  const hasActiveFilters = search || category || difficulty || branch;

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="grey.800">
              Claude Conversations
            </Typography>
            <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>
              Browse and search conversation history
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchConversations}
              sx={{
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatCard value={stats.total} label="Total Sessions" color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard value={stats.totalMessages.toLocaleString()} label="Total Messages" color="success" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard value={stats.avgMessages} label="Avg Messages" color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard value={`${stats.avgDuration}m`} label="Avg Duration" color="info" />
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 280 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 2,
                '& fieldset': { borderColor: 'grey.200' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Category */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions?.categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: categoryConfig[cat]?.color }}>{categoryConfig[cat]?.icon}</Box>
                    <Typography variant="body2">{categoryConfig[cat]?.label || cat}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Difficulty */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
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
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branch}
              label="Branch"
              onChange={(e) => setBranch(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
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

          <Box sx={{ flex: 1 }} />

          {/* Results count & Clear */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {hasActiveFilters && (
              <Chip
                label="Clear filters"
                size="small"
                onClick={clearFilters}
                onDelete={clearFilters}
                sx={{ bgcolor: 'white' }}
              />
            )}
            <Typography variant="body2" color="grey.500">
              {total} results
            </Typography>
          </Box>
        </Box>

        {/* Category Quick Filters */}
        {stats && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <Chip
                key={cat}
                icon={categoryConfig[cat]?.icon as React.ReactElement}
                label={`${categoryConfig[cat]?.label || cat} (${count})`}
                onClick={() => setCategory(category === cat ? '' : cat)}
                size="small"
                sx={{
                  bgcolor: category === cat ? categoryConfig[cat]?.color : 'white',
                  color: category === cat ? 'white' : categoryConfig[cat]?.color,
                  borderColor: categoryConfig[cat]?.color,
                  border: '1px solid',
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: category === cat ? 'white' : categoryConfig[cat]?.color
                  },
                  '&:hover': {
                    bgcolor: category === cat ? categoryConfig[cat]?.color : `${categoryConfig[cat]?.color}10`
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Conversations Grid */}
      <CardGrid
        items={conversations}
        loading={loading}
        skeletonCount={6}
        columns={{ xs: 12, sm: 6, md: 4 }}
        renderCard={(conv) => (
          <ConversationCard conversation={conv} onClick={() => handleCardClick(conv.id)} />
        )}
        pagination={{
          page,
          totalPages,
          onChange: setPage
        }}
        emptyIcon={<Chat sx={{ fontSize: 64 }} />}
        emptyTitle="No conversations found"
        emptyDescription="Try adjusting your search or filters"
      />
    </PageContainer>
  );
}
