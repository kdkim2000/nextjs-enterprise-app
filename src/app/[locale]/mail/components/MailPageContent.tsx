'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  IconButton,
  InputBase,
  Badge,
  Typography,
  Checkbox,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Create as ComposeIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMailData, FolderType, MailMessage } from '../hooks/useMailData';

// Folder configuration
const FOLDERS: { value: FolderType; icon: React.ReactNode }[] = [
  { value: 'inbox', icon: <InboxIcon fontSize="small" /> },
  { value: 'sent', icon: <SendIcon fontSize="small" /> },
  { value: 'draft', icon: <DraftsIcon fontSize="small" /> },
  { value: 'trash', icon: <DeleteIcon fontSize="small" /> },
];

interface MailPageContentProps {
  initialFolder?: FolderType;
}

export default function MailPageContent({ initialFolder = 'inbox' }: MailPageContentProps) {
  const theme = useTheme();
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n() as unknown as (key: string) => string;

  const {
    messages,
    loadingMessages,
    pagination,
    counts,
    currentFolder,
    setCurrentFolder,
    selectedMessages,
    toggleMessageSelection,
    selectAllMessages,
    clearSelection,
    fetchMessages,
    fetchCounts,
    bulkAction
  } = useMailData(initialFolder);

  const [searchInput, setSearchInput] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleFolderChange = useCallback((folder: FolderType) => {
    setCurrentFolder(folder);
    const folderPath = folder === 'inbox' ? '/mail/inbox' : `/mail/${folder}`;
    router.push(`/${locale}${folderPath}`);
  }, [router, locale, setCurrentFolder]);

  const handleCompose = useCallback(() => {
    router.push(`/${locale}/mail/compose`);
  }, [router, locale]);

  // Navigate to detail page instead of inline view
  const handleOpenMessage = useCallback((message: MailMessage) => {
    if (currentFolder === 'draft') {
      // Draft messages go to compose page for editing
      router.push(`/${locale}/mail/compose?draft=${message.id}`);
    } else {
      // Other messages go to view page
      router.push(`/${locale}/mail/view/${message.id}?folder=${currentFolder}`);
    }
  }, [router, locale, currentFolder]);

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
    const name = firstRecipient.name || firstRecipient.email || t('mail.noRecipient');
    // Add count if multiple recipients
    const count = message.recipients.length;
    return count > 1 ? `${name} (+${count - 1})` : name;
  };

  // Get sender display for inbox/trash
  const getSenderDisplay = (message: MailMessage): string => {
    return message.sender_name || message.sender_email || t('mail.unknown');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    // Same year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString(locale, { year: '2-digit', month: 'short', day: 'numeric' });
  };

  // Icon button style
  const iconBtnSx = {
    borderRadius: 1,
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
  };

  const activeFolderSx = {
    bgcolor: alpha(theme.palette.primary.main, 0.12),
    color: 'primary.main',
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.5 }}>
      {/* Minimal Top Toolbar */}
      <Paper
        elevation={0}
        sx={{
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: 1,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {/* Compose Button */}
        <Tooltip title={t('mail.compose')}>
          <IconButton
            onClick={handleCompose}
            sx={{
              ...iconBtnSx,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              mr: 1
            }}
          >
            <ComposeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Folder Icons */}
        {FOLDERS.map((folder) => (
          <Tooltip key={folder.value} title={t(`mail.${folder.value}`)}>
            <IconButton
              onClick={() => handleFolderChange(folder.value)}
              sx={{
                ...iconBtnSx,
                ...(currentFolder === folder.value && activeFolderSx)
              }}
            >
              <Badge
                badgeContent={getUnreadCount(folder.value)}
                color="error"
                max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
              >
                {folder.icon}
              </Badge>
            </IconButton>
          </Tooltip>
        ))}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Bulk Actions (shown when items selected) */}
        {selectedMessages.length > 0 ? (
          <>
            <Typography variant="caption" sx={{ mx: 1, color: 'text.secondary' }}>
              {selectedMessages.length}
            </Typography>
            <Tooltip title={t('common.delete')}>
              <IconButton onClick={handleBulkDelete} sx={iconBtnSx} size="small">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('mail.markRead')}>
              <IconButton onClick={handleBulkMarkRead} sx={iconBtnSx} size="small">
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('mail.markUnread')}>
              <IconButton onClick={handleBulkMarkUnread} sx={iconBtnSx} size="small">
                <MarkUnreadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.cancel')}>
              <IconButton onClick={clearSelection} sx={iconBtnSx} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} sx={iconBtnSx} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Search */}
        {searchExpanded ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.action.selected, 0.5),
            borderRadius: 1,
            px: 1,
            py: 0.25
          }}>
            <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
            <InputBase
              placeholder={t('common.search')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              autoFocus
              sx={{ fontSize: 14, width: 160 }}
            />
            <IconButton
              size="small"
              onClick={() => { setSearchExpanded(false); setSearchInput(''); handleRefresh(); }}
              sx={{ ml: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Tooltip title={t('common.search')}>
            <IconButton onClick={() => setSearchExpanded(true)} sx={iconBtnSx} size="small">
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Pagination Info */}
        {pagination.totalPages > 0 && (
          <>
            <Typography variant="caption" sx={{ mx: 1, color: 'text.secondary' }}>
              {pagination.total > 0 ? `${((pagination.page - 1) * pagination.pageSize) + 1}-${Math.min(pagination.page * pagination.pageSize, pagination.total)} / ${pagination.total}` : '0'}
            </Typography>
            <IconButton
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              sx={iconBtnSx}
              size="small"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              sx={iconBtnSx}
              size="small"
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Paper>

      {/* Gmail-style Mail List */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          minHeight: 0
        }}
      >
        {/* List Header with Select All */}
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <Checkbox
            checked={selectedMessages.length === messages.length && messages.length > 0}
            indeterminate={selectedMessages.length > 0 && selectedMessages.length < messages.length}
            onChange={(e) => e.target.checked ? selectAllMessages() : clearSelection()}
            size="small"
            sx={{ p: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {currentFolder === 'sent' || currentFolder === 'draft' ? t('mail.to') : t('mail.from')}
          </Typography>
        </Box>

        {/* Message List */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {loadingMessages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
              <CircularProgress size={32} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200, gap: 1 }}>
              <InboxIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">{t('mail.noMessages')}</Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <GmailStyleRow
                key={message.id}
                message={message}
                currentFolder={currentFolder}
                isSelected={selectedMessages.includes(message.id)}
                onToggleSelect={() => toggleMessageSelection(message.id)}
                onClick={() => handleOpenMessage(message)}
                getSenderDisplay={getSenderDisplay}
                getRecipientDisplay={getRecipientDisplay}
                formatDate={formatDate}
                t={t}
              />
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}

// Gmail-style single row component
interface GmailStyleRowProps {
  message: MailMessage;
  currentFolder: FolderType;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  getSenderDisplay: (message: MailMessage) => string;
  getRecipientDisplay: (message: MailMessage) => string;
  formatDate: (dateStr: string) => string;
  t: (key: string) => string;
}

function GmailStyleRow({
  message,
  currentFolder,
  isSelected,
  onToggleSelect,
  onClick,
  getSenderDisplay,
  getRecipientDisplay,
  formatDate,
  t
}: GmailStyleRowProps) {
  const theme = useTheme();
  const isUnread = !message.is_read;

  // Determine who to display (sender for inbox/trash, recipient for sent/draft)
  const displayName = currentFolder === 'sent' || currentFolder === 'draft'
    ? getRecipientDisplay(message)
    : getSenderDisplay(message);

  // Subject and preview
  const subject = message.subject || t('mail.noSubject');
  const preview = message.body ? message.body.substring(0, 100).replace(/\s+/g, ' ') : '';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: isUnread ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:hover': {
          bgcolor: alpha(theme.palette.action.hover, 0.5)
        }
      }}
      onClick={onClick}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        size="small"
        sx={{ p: 0.5, mr: 0.5 }}
      />

      {/* Sender/Recipient - Fixed width */}
      <Typography
        variant="body2"
        sx={{
          width: 180,
          minWidth: 180,
          fontWeight: isUnread ? 600 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          mr: 2
        }}
      >
        {displayName}
      </Typography>

      {/* Subject + Preview - Flexible */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isUnread ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            maxWidth: '40%'
          }}
        >
          {subject}
        </Typography>
        {preview && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>-</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0
              }}
            >
              {preview}
            </Typography>
          </>
        )}
      </Box>

      {/* Attachment indicator */}
      {message.attachment_id && (
        <AttachFileIcon
          sx={{ fontSize: 16, color: 'text.secondary', mx: 0.5 }}
        />
      )}

      {/* Date - Fixed width */}
      <Typography
        variant="caption"
        sx={{
          width: 70,
          textAlign: 'right',
          color: isUnread ? 'text.primary' : 'text.secondary',
          fontWeight: isUnread ? 600 : 400,
          flexShrink: 0
        }}
      >
        {formatDate(message.sent_at || message.created_at)}
      </Typography>
    </Box>
  );
}
