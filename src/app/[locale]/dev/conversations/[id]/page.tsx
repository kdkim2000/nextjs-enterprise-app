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
  TextField,
  InputAdornment,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  Chat,
  Schedule,
  Code,
  Person,
  SmartToy,
  ExpandMore,
  ExpandLess,
  BugReport,
  Build,
  Psychology,
  Speed,
  CalendarToday,
  AccountTree,
  Search,
  Clear,
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

// Category config
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'bug-fix': { icon: <BugReport />, color: '#ef4444', label: 'Bug Fix' },
  feature: { icon: <Build />, color: '#22c55e', label: 'Feature' },
  refactor: { icon: <Code />, color: '#a855f7', label: 'Refactor' },
  debugging: { icon: <Psychology />, color: '#f97316', label: 'Debugging' },
  performance: { icon: <Speed />, color: '#06b6d4', label: 'Performance' },
  general: { icon: <Chat />, color: '#6b7280', label: 'General' }
};

const difficultyColors: Record<string, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444'
};

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const locale = useCurrentLocale();
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [showCodeChanges, setShowCodeChanges] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
  const catConfig = categoryConfig[conversation.category] || categoryConfig.general;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box sx={{ flexShrink: 0 }}>
        <PageContainer sx={{ pb: 0 }}>
          <PageHeader useMenu showBreadcrumb />

          {/* Title Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => router.push(`/${locale}/dev/conversations`)}
              sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
            >
              <ArrowBack />
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'grey.800'
                  }}
                >
                  {conversation.title}
                </Typography>
                <Chip
                  size="small"
                  label={catConfig.label}
                  sx={{
                    bgcolor: `${catConfig.color}15`,
                    color: catConfig.color,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
                <Chip
                  size="small"
                  label={conversation.difficulty_level}
                  sx={{
                    bgcolor: `${difficultyColors[conversation.difficulty_level]}15`,
                    color: difficultyColors[conversation.difficulty_level],
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}
                >
                  <CalendarToday sx={{ fontSize: 12 }} />
                  {formatDateTime(conversation.started_at)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}
                >
                  <Chat sx={{ fontSize: 12 }} />
                  {filteredMessages.length} messages
                </Typography>
                {conversation.branch_name && conversation.branch_name !== 'unknown' && (
                  <Typography
                    variant="caption"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.500' }}
                  >
                    <AccountTree sx={{ fontSize: 12 }} />
                    {conversation.branch_name}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'grey.50',
              borderRadius: 2
            }}
          >
            <TextField
              size="small"
              placeholder="Search in conversation..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{
                width: 280,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'grey.200' },
                  '&:hover fieldset': { borderColor: 'grey.300' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'grey.400', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearch('')}>
                      <Clear sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {matchingMessageIndices.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                  {currentMatchIndex + 1} / {matchingMessageIndices.length}
                </Typography>
                <IconButton size="small" onClick={() => navigateMatch('prev')} sx={{ p: 0.5 }}>
                  <KeyboardArrowUp sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" onClick={() => navigateMatch('next')} sx={{ p: 0.5 }}>
                  <KeyboardArrowDown sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            )}

            <Box sx={{ flex: 1 }} />

            {codeChanges.length > 0 && (
              <Badge
                badgeContent={codeChanges.length}
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}
              >
                <Button
                  size="small"
                  variant={showCodeChanges ? 'contained' : 'outlined'}
                  startIcon={<Code sx={{ fontSize: 16 }} />}
                  onClick={() => setShowCodeChanges(!showCodeChanges)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    ...(showCodeChanges
                      ? {}
                      : {
                          borderColor: 'grey.300',
                          color: 'grey.600',
                          '&:hover': { borderColor: 'grey.400' }
                        })
                  }}
                >
                  Code
                </Button>
              </Badge>
            )}

            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
              <Tooltip title="Expand All">
                <IconButton
                  size="small"
                  onClick={expandAll}
                  sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}
                >
                  <UnfoldMore sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Collapse All">
                <IconButton
                  size="small"
                  onClick={collapseAll}
                  sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}
                >
                  <UnfoldLess sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Code Changes Panel */}
          <Collapse in={showCodeChanges}>
            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {codeChanges.map((change) => (
                  <Chip
                    key={change.id}
                    size="small"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          fontFamily="monospace"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {change.file_name}
                        </Typography>
                        {change.lines_added > 0 && (
                          <Typography
                            variant="caption"
                            sx={{ color: '#22c55e', fontSize: '0.65rem' }}
                          >
                            +{change.lines_added}
                          </Typography>
                        )}
                        {change.lines_removed > 0 && (
                          <Typography
                            variant="caption"
                            sx={{ color: '#ef4444', fontSize: '0.65rem' }}
                          >
                            -{change.lines_removed}
                          </Typography>
                        )}
                      </Box>
                    }
                    variant="outlined"
                    sx={{
                      borderColor:
                        change.change_type === 'create'
                          ? '#22c55e'
                          : change.change_type === 'delete'
                            ? '#ef4444'
                            : '#3b82f6',
                      bgcolor: 'white'
                    }}
                  />
                ))}
              </Box>
            </Paper>
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
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        bgcolor: isUser ? '#3b82f6' : '#8b5cf6',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isUser ? (
                        <Person sx={{ fontSize: 20 }} />
                      ) : (
                        <SmartToy sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>

                    {/* Content Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        borderRadius: 3,
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
                          px: 2,
                          py: 1.5,
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
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: isUser ? '#3b82f6' : '#8b5cf6'
                            }}
                          >
                            {isUser ? 'You' : 'Claude'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'grey.400',
                              bgcolor: 'grey.100',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.7rem'
                            }}
                          >
                            #{msg.originalIdx + 1}
                          </Typography>
                          {msg.has_code && (
                            <Chip
                              size="small"
                              icon={<Code sx={{ fontSize: '12px !important' }} />}
                              label="Code"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                bgcolor: '#dbeafe',
                                color: '#1d4ed8',
                                '& .MuiChip-icon': { color: '#1d4ed8' }
                              }}
                            />
                          )}
                        </Box>
                        <IconButton size="small" sx={{ color: 'grey.400' }}>
                          {isExpanded ? (
                            <ExpandLess sx={{ fontSize: 20 }} />
                          ) : (
                            <ExpandMore sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </Box>

                      {/* Content */}
                      <Box sx={{ px: 2, py: isExpanded ? 2 : 1.5 }}>
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
                              lineHeight: 1.6
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
            <Box sx={{ height: 40 }} />
          </Box>
        </PageContainer>
      </Box>
    </Box>
  );
}
