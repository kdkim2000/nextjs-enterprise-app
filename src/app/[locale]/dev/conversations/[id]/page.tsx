'use client';

import React, { useState, useEffect, use, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Skeleton,
  Alert,
  IconButton,
  Collapse,
  Button,
  Avatar,
  Tooltip,
  Badge as MuiBadge,
  ClickAwayListener
} from '@mui/material';
import {
  ArrowBack,
  Chat,
  Code,
  Person,
  SmartToy,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  AccountTree,
  Search,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown,
  UnfoldMore,
  UnfoldLess
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { SearchInput, useSearchNavigation } from '@/components/common/SearchInput';
import {
  CategoryBadge,
  DifficultyBadge,
  MetaInfo,
  categoryConfigs,
  difficultyColors
} from '@/components/common/Badge';
import { formatDate } from '@/lib/utils/date';
import axiosInstance from '@/lib/axios';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  content_type: string;
  has_code: boolean;
  created_at: string;
  order: number;
}

interface CodeChange {
  id: string;
  file_path: string;
  file_name: string;
  change_type: string;
  language: string;
  lines_added: number;
  lines_removed: number;
  explanation: string;
}

interface ConversationDetail {
  conversation: {
    id: string;
    title: string;
    category: string;
    difficulty_level: string;
    branch_name: string;
    total_messages: number;
    duration_minutes: number;
    started_at: string;
    ended_at: string;
    summary: string;
    learning_points: string;
    tags: Array<{ id: string; name: string; name_ko: string; color: string }> | null;
  };
  messages: Message[];
  codeChanges: CodeChange[];
}

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const locale = useCurrentLocale();
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [showCodeChanges, setShowCodeChanges] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/conversation/${id}`);
        setData(response.data);
        // Filter out empty messages for initial expansion
        const nonEmptyIndices = response.data.messages
          .map((msg: Message, idx: number) => (msg.content && msg.content.trim() ? idx : -1))
          .filter((idx: number) => idx !== -1);
        setExpandedMessages(new Set<number>(nonEmptyIndices));
      } catch (err) {
        setError('Failed to load conversation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [id]);

  // Filter out empty messages
  const filteredMessages = useMemo(() => {
    if (!data) return [];
    return data.messages
      .map((msg, originalIdx) => ({ ...msg, originalIdx }))
      .filter((msg) => msg.content && msg.content.trim());
  }, [data]);

  // Search functionality
  const matchingMessageIndices = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2 || !filteredMessages.length) return [];
    const term = searchTerm.toLowerCase();
    return filteredMessages
      .map((msg, idx) => (msg.content.toLowerCase().includes(term) ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [searchTerm, filteredMessages]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentMatchIndex(0);
  }, []);

  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchTerm('');
  }, []);

  const navigateMatch = useCallback(
    (direction: 'prev' | 'next') => {
      if (matchingMessageIndices.length === 0) return;

      let newIndex = currentMatchIndex;
      if (direction === 'next') {
        newIndex = (currentMatchIndex + 1) % matchingMessageIndices.length;
      } else {
        newIndex =
          (currentMatchIndex - 1 + matchingMessageIndices.length) % matchingMessageIndices.length;
      }
      setCurrentMatchIndex(newIndex);

      const messageIdx = matchingMessageIndices[newIndex];
      const originalIdx = filteredMessages[messageIdx].originalIdx;
      setExpandedMessages((prev) => new Set([...prev, originalIdx]));

      setTimeout(() => {
        const element = document.getElementById(`message-${messageIdx}`);
        if (element && messagesContainerRef.current) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    },
    [currentMatchIndex, matchingMessageIndices, filteredMessages]
  );

  const toggleMessage = useCallback((originalIdx: number) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(originalIdx)) {
        newSet.delete(originalIdx);
      } else {
        newSet.add(originalIdx);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (filteredMessages.length) {
      setExpandedMessages(new Set<number>(filteredMessages.map((msg) => msg.originalIdx)));
    }
  }, [filteredMessages]);

  const collapseAll = useCallback(() => {
    setExpandedMessages(new Set<number>());
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader useMenu showBreadcrumb />
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} variant="rounded" height={100} sx={{ mb: 2 }} />
        ))}
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <PageHeader useMenu showBreadcrumb />
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Conversation not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push(`/${locale}/dev/conversations`)}
        >
          Back to list
        </Button>
      </PageContainer>
    );
  }

  const { conversation, codeChanges } = data;
  const catConfig = categoryConfigs[conversation.category] || categoryConfigs.general;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Compact Header Area */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: 'white' }}>
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Unified Title Bar with Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5
            }}
          >
            {/* Left: Back + Title */}
            <IconButton
              size="small"
              onClick={() => router.push(`/${locale}/dev/conversations`)}
              sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title + Badges */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'grey.800',
                    minWidth: 0
                  }}
                >
                  {conversation.title}
                </Typography>
                <Chip
                  size="small"
                  label={catConfig.label}
                  sx={{
                    height: 20,
                    bgcolor: `${catConfig.color}15`,
                    color: catConfig.color,
                    fontWeight: 500,
                    fontSize: '0.65rem',
                    flexShrink: 0
                  }}
                />
                <Chip
                  size="small"
                  label={conversation.difficulty_level}
                  sx={{
                    height: 20,
                    bgcolor: `${difficultyColors[conversation.difficulty_level]}15`,
                    color: difficultyColors[conversation.difficulty_level],
                    fontWeight: 500,
                    fontSize: '0.65rem',
                    textTransform: 'capitalize',
                    flexShrink: 0
                  }}
                />
              </Box>
              {/* Meta Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                <MetaInfo icon={<CalendarToday sx={{ fontSize: 11 }} />} value={formatDate(conversation.started_at)} size="small" />
                <MetaInfo icon={<Chat sx={{ fontSize: 11 }} />} value={filteredMessages.length} size="small" />
                {conversation.branch_name && conversation.branch_name !== 'unknown' && (
                  <MetaInfo icon={<AccountTree sx={{ fontSize: 11 }} />} value={conversation.branch_name} size="small" />
                )}
              </Box>
            </Box>

            {/* Right: Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {/* Expandable Search */}
              {searchOpen ? (
                <ClickAwayListener onClickAway={() => !searchTerm && handleSearchClose()}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      pl: 1.5,
                      pr: 0.5,
                      py: 0.5
                    }}
                  >
                    <Search sx={{ fontSize: 18, color: 'grey.500' }} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '0.85rem',
                        width: 150
                      }}
                    />
                    {matchingMessageIndices.length > 0 && (
                      <>
                        <Typography variant="caption" sx={{ color: 'grey.600', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {currentMatchIndex + 1}/{matchingMessageIndices.length}
                        </Typography>
                        <IconButton size="small" onClick={() => navigateMatch('prev')} sx={{ p: 0.25 }}>
                          <KeyboardArrowUp sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => navigateMatch('next')} sx={{ p: 0.25 }}>
                          <KeyboardArrowDown sx={{ fontSize: 16 }} />
                        </IconButton>
                      </>
                    )}
                    <IconButton size="small" onClick={handleSearchClose} sx={{ p: 0.25 }}>
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </ClickAwayListener>
              ) : (
                <Tooltip title="Search (Ctrl+F)">
                  <IconButton
                    size="small"
                    onClick={handleSearchOpen}
                    sx={{
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' }
                    }}
                  >
                    <Search sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Divider */}
              <Box sx={{ width: 1, height: 24, bgcolor: 'grey.200', mx: 0.5 }} />

              {/* Expand/Collapse */}
              <Tooltip title="Expand All">
                <IconButton
                  size="small"
                  onClick={expandAll}
                  sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                >
                  <UnfoldMore sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Collapse All">
                <IconButton
                  size="small"
                  onClick={collapseAll}
                  sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                >
                  <UnfoldLess sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              {/* Code Changes Toggle */}
              {codeChanges.length > 0 && (
                <>
                  <Box sx={{ width: 1, height: 24, bgcolor: 'grey.200', mx: 0.5 }} />
                  <Tooltip title={`Code Changes (${codeChanges.length})`}>
                    <MuiBadge
                      badgeContent={codeChanges.length}
                      color="primary"
                      sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 16, height: 16 } }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setShowCodeChanges(!showCodeChanges)}
                        sx={{
                          bgcolor: showCodeChanges ? 'primary.main' : 'grey.100',
                          color: showCodeChanges ? 'white' : 'inherit',
                          '&:hover': { bgcolor: showCodeChanges ? 'primary.dark' : 'grey.200' }
                        }}
                      >
                        <Code sx={{ fontSize: 18 }} />
                      </IconButton>
                    </MuiBadge>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          {/* Code Changes Panel - Collapsible */}
          <Collapse in={showCodeChanges}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pb: 1.5 }}>
              {codeChanges.map((change) => (
                <Chip
                  key={change.id}
                  size="small"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" fontFamily="monospace" sx={{ fontSize: '0.65rem' }}>
                        {change.file_name}
                      </Typography>
                      {change.lines_added > 0 && (
                        <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.6rem' }}>
                          +{change.lines_added}
                        </Typography>
                      )}
                      {change.lines_removed > 0 && (
                        <Typography variant="caption" sx={{ color: '#ef4444', fontSize: '0.6rem' }}>
                          -{change.lines_removed}
                        </Typography>
                      )}
                    </Box>
                  }
                  variant="outlined"
                  sx={{
                    height: 24,
                    borderColor:
                      change.change_type === 'create'
                        ? '#22c55e'
                        : change.change_type === 'delete'
                          ? '#ef4444'
                          : '#3b82f6',
                    bgcolor: 'grey.50'
                  }}
                />
              ))}
            </Box>
          </Collapse>
        </PageContainer>
      </Box>

      {/* Messages Area - Scrollable */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          bgcolor: 'grey.50'
        }}
      >
        <PageContainer sx={{ py: 2 }}>
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            {filteredMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isExpanded = expandedMessages.has(msg.originalIdx);
              const contentPreview = msg.content.substring(0, 200);
              const hasMore = msg.content.length > 200;
              const isCurrentMatch =
                matchingMessageIndices.length > 0 &&
                matchingMessageIndices[currentMatchIndex] === idx;
              const isMatch = matchingMessageIndices.includes(idx);

              return (
                <Box
                  id={`message-${idx}`}
                  key={msg.id}
                  sx={{
                    mb: 2,
                    transition: 'all 0.2s ease',
                    ...(isCurrentMatch && {
                      transform: 'scale(1.01)',
                      '& > div': {
                        boxShadow: '0 0 0 2px #f59e0b'
                      }
                    })
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        bgcolor: isUser ? '#3b82f6' : '#8b5cf6',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isUser ? (
                        <Person sx={{ fontSize: 18 }} />
                      ) : (
                        <SmartToy sx={{ fontSize: 18 }} />
                      )}
                    </Avatar>

                    {/* Content Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: isMatch && !isCurrentMatch ? '#fef3c7' : 'white',
                        border: '1px solid',
                        borderColor: isUser ? '#e0e7ff' : '#f3e8ff',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Header */}
                      <Box
                        onClick={() => toggleMessage(msg.originalIdx)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.5,
                          py: 1,
                          cursor: 'pointer',
                          userSelect: 'none',
                          bgcolor: isUser ? '#f8faff' : '#faf8ff',
                          borderBottom: isExpanded ? '1px solid' : 'none',
                          borderColor: 'grey.100',
                          '&:hover': {
                            bgcolor: isUser ? '#f0f4ff' : '#f5f0ff'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: isUser ? '#3b82f6' : '#8b5cf6',
                              fontSize: '0.8rem'
                            }}
                          >
                            {isUser ? 'You' : 'Claude'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'grey.400',
                              bgcolor: 'grey.100',
                              px: 0.75,
                              py: 0.125,
                              borderRadius: 0.75,
                              fontSize: '0.65rem'
                            }}
                          >
                            #{msg.originalIdx + 1}
                          </Typography>
                          {msg.has_code && (
                            <Code sx={{ fontSize: 14, color: '#3b82f6' }} />
                          )}
                        </Box>
                        <IconButton size="small" sx={{ color: 'grey.400', p: 0.25 }}>
                          {isExpanded ? (
                            <ExpandLess sx={{ fontSize: 18 }} />
                          ) : (
                            <ExpandMore sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Box>

                      {/* Content */}
                      <Box sx={{ px: 1.5, py: isExpanded ? 1.5 : 1 }}>
                        {isExpanded ? (
                          <MarkdownRenderer content={msg.content} searchTerm={searchTerm} />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'grey.600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.5,
                              fontSize: '0.85rem'
                            }}
                          >
                            {contentPreview}
                            {hasMore && '...'}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              );
            })}

            {/* Bottom Spacer */}
            <Box sx={{ height: 24 }} />
          </Box>
        </PageContainer>
      </Box>
    </Box>
  );
}
