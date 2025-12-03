'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Tabs,
  Tab,
  TextField,
  IconButton,
  InputAdornment,
  Badge,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  DeleteOutline as DeleteOutlineIcon,
  RestoreFromTrash as RestoreIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMailData, FolderType, MailMessage } from '../hooks/useMailData';

// Folder tabs configuration (simplified - no starred)
const FOLDER_TABS = [
  { value: 'inbox' as const, labelKey: 'mail.inbox' as const, icon: <InboxIcon /> },
  { value: 'sent' as const, labelKey: 'mail.sent' as const, icon: <SendIcon /> },
  { value: 'draft' as const, labelKey: 'mail.draft' as const, icon: <DraftsIcon /> },
  { value: 'trash' as const, labelKey: 'mail.trash' as const, icon: <DeleteIcon /> },
] as const;

interface MailPageContentProps {
  initialFolder?: FolderType;
}

export default function MailPageContent({ initialFolder = 'inbox' }: MailPageContentProps) {
  const theme = useTheme();
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n() as unknown as (key: string) => string;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    messages,
    loadingMessages,
    pagination,
    counts,
    currentFolder,
    setCurrentFolder,
    selectedMessage,
    setSelectedMessage,
    selectedMessages,
    toggleMessageSelection,
    selectAllMessages,
    clearSelection,
    fetchMessages,
    getMessage,
    fetchCounts,
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    markAsRead,
    bulkAction
  } = useMailData(initialFolder);

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: FolderType) => {
    setCurrentFolder(newValue);
    const folderPath = newValue === 'inbox' ? '/mail' : `/mail/${newValue}`;
    router.push(`/${locale}${folderPath}`);
  }, [router, locale, setCurrentFolder]);

  const handleCompose = useCallback(() => {
    router.push(`/${locale}/mail/compose`);
  }, [router, locale]);

  const handleSelectMessage = useCallback(async (message: MailMessage) => {
    setLoadingDetail(true);
    try {
      const fullMessage = await getMessage(message.id);
      setSelectedMessage(fullMessage);
      if (isMobile) setMobileView('detail');
    } catch (error) {
      console.error('Failed to load message:', error);
    } finally {
      setLoadingDetail(false);
    }
  }, [getMessage, setSelectedMessage, isMobile]);

  const handleReply = useCallback(() => {
    if (selectedMessage) {
      router.push(`/${locale}/mail/compose?replyTo=${selectedMessage.id}`);
    }
  }, [selectedMessage, router, locale]);

  const handleForward = useCallback(() => {
    if (selectedMessage) {
      router.push(`/${locale}/mail/compose?forward=${selectedMessage.id}`);
    }
  }, [selectedMessage, router, locale]);

  const handleDelete = useCallback(async () => {
    if (selectedMessage) {
      if (currentFolder === 'trash') {
        await deletePermanently(selectedMessage.id);
      } else {
        await moveToTrash(selectedMessage.id);
      }
      setSelectedMessage(null);
      if (isMobile) setMobileView('list');
    }
  }, [selectedMessage, currentFolder, deletePermanently, moveToTrash, setSelectedMessage, isMobile]);

  const handleRestore = useCallback(async () => {
    if (selectedMessage && currentFolder === 'trash') {
      await restoreFromTrash(selectedMessage.id);
      setSelectedMessage(null);
      if (isMobile) setMobileView('list');
    }
  }, [selectedMessage, currentFolder, restoreFromTrash, setSelectedMessage, isMobile]);

  const handleToggleRead = useCallback(async () => {
    if (selectedMessage) {
      await markAsRead(selectedMessage.id, !selectedMessage.is_read);
    }
  }, [selectedMessage, markAsRead]);

  const handleSearch = useCallback(() => {
    fetchMessages(currentFolder, { search: searchInput });
  }, [fetchMessages, currentFolder, searchInput]);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handlePageChange = useCallback((page: number) => {
    fetchMessages(currentFolder, { page, search: searchInput });
  }, [fetchMessages, currentFolder, searchInput]);

  const handleRefresh = useCallback(() => {
    fetchMessages(currentFolder, { search: searchInput });
    fetchCounts();
  }, [fetchMessages, fetchCounts, currentFolder, searchInput]);

  const handleBack = useCallback(() => {
    setMobileView('list');
    setSelectedMessage(null);
  }, [setSelectedMessage]);

  const handleBulkDelete = useCallback(async () => {
    const action = currentFolder === 'trash' ? 'delete' : 'trash';
    await bulkAction(selectedMessages, action);
  }, [selectedMessages, currentFolder, bulkAction]);

  const handleBulkMarkRead = useCallback(async () => {
    await bulkAction(selectedMessages, 'read');
  }, [selectedMessages, bulkAction]);

  const handleBulkMarkUnread = useCallback(async () => {
    await bulkAction(selectedMessages, 'unread');
  }, [selectedMessages, bulkAction]);

  const getUnreadCount = (folder: FolderType): number => {
    return counts?.[folder]?.unread || 0;
  };

  // Helper to get first recipient display name
  const getRecipientDisplay = (message: MailMessage): string => {
    if (!message.recipients || message.recipients.length === 0) {
      return t('mail.noRecipient');
    }
    const toRecipients = message.recipients.filter(r => r.type === 'to');
    const firstRecipient = toRecipients[0] || message.recipients[0];
    return firstRecipient.name || firstRecipient.email || t('mail.noRecipient');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const listWidth = isMobile ? '100%' : selectedMessage ? 400 : '100%';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
      {/* Top Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCompose} sx={{ minWidth: 120 }}>
          {t('mail.compose')}
        </Button>

        <Tabs value={currentFolder} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ flex: 1, minWidth: 0 }}>
          {FOLDER_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              icon={<Badge badgeContent={getUnreadCount(tab.value)} color="error" max={99}>{tab.icon}</Badge>}
              iconPosition="start"
              label={t(tab.labelKey)}
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>

        <TextField
          size="small"
          placeholder={t('common.search')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{ width: 200 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <IconButton onClick={handleRefresh} size="small"><RefreshIcon /></IconButton>
      </Paper>

      {/* Bulk Action Toolbar */}
      {selectedMessages.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.action.selected }}
        >
          <Typography variant="body2" sx={{ mr: 2 }}>{selectedMessages.length} {t('common.selected')}</Typography>
          <Button size="small" onClick={clearSelection}>{t('common.cancel')}</Button>
          <Button size="small" startIcon={<DeleteOutlineIcon />} onClick={handleBulkDelete}>{t('common.delete')}</Button>
          <Button size="small" startIcon={<MarkReadIcon />} onClick={handleBulkMarkRead}>{t('mail.markRead')}</Button>
          <Button size="small" startIcon={<MarkUnreadIcon />} onClick={handleBulkMarkUnread}>{t('mail.markUnread')}</Button>
        </Paper>
      )}

      {/* Mail Content */}
      <Box sx={{ display: 'flex', flex: 1, bgcolor: 'background.default', borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, minHeight: 0 }}>
        {/* Mobile Detail View */}
        {isMobile && mobileView === 'detail' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <IconButton onClick={handleBack}><ArrowBackIcon /></IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {loadingDetail ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : selectedMessage ? (
                <MessageDetail message={selectedMessage} currentFolder={currentFolder} onReply={handleReply} onForward={handleForward} onDelete={handleDelete} onRestore={handleRestore} onToggleRead={handleToggleRead} t={t} formatDate={formatDate} />
              ) : null}
            </Box>
          </Box>
        )}

        {/* Mail List */}
        {(!isMobile || mobileView === 'list') && (
          <Box sx={{ width: listWidth, flexShrink: selectedMessage ? 0 : 1, display: 'flex', flexDirection: 'column', borderRight: selectedMessage && !isMobile ? `1px solid ${theme.palette.divider}` : 'none', transition: 'width 0.2s ease' }}>
            <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={selectedMessages.length === messages.length && messages.length > 0}
                indeterminate={selectedMessages.length > 0 && selectedMessages.length < messages.length}
                onChange={(e) => e.target.checked ? selectAllMessages() : clearSelection()}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>{pagination.total} {t('common.items')}</Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : messages.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">{t('mail.noMessages')}</Typography></Box>
              ) : (
                <List disablePadding>
                  {messages.map((message) => (
                    <React.Fragment key={message.id}>
                      <ListItem disablePadding secondaryAction={
                        <Checkbox checked={selectedMessages.includes(message.id)} onChange={() => toggleMessageSelection(message.id)} onClick={(e) => e.stopPropagation()} size="small" />
                      }>
                        <ListItemButton
                          selected={selectedMessage?.id === message.id}
                          onClick={() => handleSelectMessage(message)}
                          sx={{ bgcolor: message.is_read ? 'transparent' : 'action.hover', '&.Mui-selected': { bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.light' } } }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: message.is_read ? 400 : 600 }} noWrap>
                                  {currentFolder === 'sent' || currentFolder === 'draft' ? getRecipientDisplay(message) : (message.sender_name || message.sender_email || t('mail.unknown'))}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{formatDate(message.sent_at || message.created_at)}</Typography>
                              </Box>
                            }
                            secondary={<Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: message.is_read ? 400 : 500 }}>{message.subject || t('mail.noSubject')}</Typography>}
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>

            {pagination.totalPages > 1 && (
              <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button size="small" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>{t('common.prev')}</Button>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>{pagination.page} / {pagination.totalPages}</Typography>
                <Button size="small" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>{t('common.next')}</Button>
              </Box>
            )}
          </Box>
        )}

        {/* Desktop Detail */}
        {!isMobile && selectedMessage && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {loadingDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <MessageDetail message={selectedMessage} currentFolder={currentFolder} onReply={handleReply} onForward={handleForward} onDelete={handleDelete} onRestore={handleRestore} onToggleRead={handleToggleRead} t={t} formatDate={formatDate} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface MessageDetailProps {
  message: MailMessage;
  currentFolder: FolderType;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onToggleRead: () => void;
  t: any; // useI18n return type
  formatDate: (date: string) => string;
}

function MessageDetail({ message, currentFolder, onReply, onForward, onDelete, onRestore, onToggleRead, t, formatDate }: MessageDetailProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {currentFolder !== 'draft' && (
          <>
            <Button size="small" startIcon={<ReplyIcon />} onClick={onReply}>{t('mail.reply')}</Button>
            <Button size="small" startIcon={<ForwardIcon />} onClick={onForward}>{t('mail.forward')}</Button>
          </>
        )}
        {currentFolder === 'trash' ? (
          <>
            <Button size="small" startIcon={<RestoreIcon />} onClick={onRestore}>{t('mail.restore')}</Button>
            <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={onDelete}>{t('mail.deletePermanently')}</Button>
          </>
        ) : (
          <Button size="small" startIcon={<DeleteOutlineIcon />} onClick={onDelete}>{t('common.delete')}</Button>
        )}
        <Button size="small" startIcon={message.is_read ? <MarkUnreadIcon /> : <MarkReadIcon />} onClick={onToggleRead}>
          {message.is_read ? t('mail.markUnread') : t('mail.markRead')}
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>{message.subject || t('mail.noSubject')}</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">{t('mail.from')}: {message.sender_name || message.sender_email || t('mail.unknown')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('mail.to')}: {message.recipients?.filter(r => r.type === 'to').map(r => r.name || r.email).join(', ') || t('mail.unknown')}
        </Typography>
        {message.recipients?.some(r => r.type === 'cc') && (
          <Typography variant="body2" color="text.secondary">
            CC: {message.recipients.filter(r => r.type === 'cc').map(r => r.name || r.email).join(', ')}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">{t('mail.date')}: {formatDate(message.sent_at || message.created_at)}</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {message.body_html ? (
        <Box sx={{ '& img': { maxWidth: '100%' } }} dangerouslySetInnerHTML={{ __html: message.body_html }} />
      ) : (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.body}</Typography>
      )}
    </Box>
  );
}
