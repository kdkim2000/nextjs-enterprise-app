'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  RestoreFromTrash as RestoreIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Inbox as InboxIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useAttachment, formatFileSize, AttachmentFile } from '@/hooks/useAttachment';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMailData, MailMessage, FolderType } from '../../hooks/useMailData';
import { commonApi } from '@/lib/axios';

export default function MailViewPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n() as unknown as (key: string) => string;

  const messageId = params.id as string;
  const folder = (searchParams.get('folder') || 'inbox') as FolderType;

  const {
    messages,
    fetchMessages,
    getMessage,
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    markAsRead
  } = useMailData(folder);

  const [message, setMessage] = useState<MailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);

  // Attachment hook for downloading files
  const { downloadFile } = useAttachment({
    attachmentTypeCode: 'MAIL'
  });

  // Load message (getMessage already marks as read on backend)
  useEffect(() => {
    const loadMessage = async () => {
      setLoading(true);
      try {
        const fullMessage = await getMessage(messageId, folder);
        setMessage(fullMessage);
      } catch (error) {
        console.error('Failed to load message:', error);
      } finally {
        setLoading(false);
      }
    };

    if (messageId) {
      loadMessage();
    }
  }, [messageId, folder, getMessage]);

  // Find index in messages list (separate effect to avoid dependency loops)
  useEffect(() => {
    const idx = messages.findIndex(m => m.id === messageId);
    setCurrentIndex(idx);
  }, [messageId, messages]);

  // Load attachments when message has attachment_id
  useEffect(() => {
    const loadAttachments = async () => {
      if (message?.attachment_id) {
        try {
          const response = await commonApi.get(`/attachments/${message.attachment_id}`);
          if (response.attachment?.files) {
            setAttachmentFiles(response.attachment.files);
          }
        } catch (error) {
          console.error('Failed to load attachments:', error);
          setAttachmentFiles([]);
        }
      } else {
        setAttachmentFiles([]);
      }
    };

    loadAttachments();
  }, [message?.attachment_id]);

  // Ensure messages are loaded for navigation
  useEffect(() => {
    if (messages.length === 0) {
      fetchMessages(folder);
    }
  }, [folder, fetchMessages, messages.length]);

  const handleBack = useCallback(() => {
    router.push(`/${locale}/mail/${folder}`);
  }, [router, locale, folder]);

  const handleReply = useCallback(() => {
    router.push(`/${locale}/mail/compose?replyTo=${messageId}`);
  }, [router, locale, messageId]);

  const handleForward = useCallback(() => {
    router.push(`/${locale}/mail/compose?forward=${messageId}`);
  }, [router, locale, messageId]);

  const handleDelete = useCallback(async () => {
    if (folder === 'trash') {
      await deletePermanently(messageId);
    } else {
      await moveToTrash(messageId);
    }
    // Navigate to next message or back to list
    if (currentIndex >= 0 && currentIndex < messages.length - 1) {
      const nextMessage = messages[currentIndex + 1];
      router.push(`/${locale}/mail/view/${nextMessage.id}?folder=${folder}`);
    } else if (currentIndex > 0) {
      const prevMessage = messages[currentIndex - 1];
      router.push(`/${locale}/mail/view/${prevMessage.id}?folder=${folder}`);
    } else {
      handleBack();
    }
  }, [folder, messageId, deletePermanently, moveToTrash, currentIndex, messages, router, locale, handleBack]);

  const handleRestore = useCallback(async () => {
    await restoreFromTrash(messageId);
    handleBack();
  }, [messageId, restoreFromTrash, handleBack]);

  const handleToggleRead = useCallback(async () => {
    if (message) {
      await markAsRead(messageId, !message.is_read);
      setMessage(prev => prev ? { ...prev, is_read: !prev.is_read } : null);
    }
  }, [message, messageId, markAsRead]);

  const handlePrevMessage = useCallback(() => {
    if (currentIndex > 0) {
      const prevMessage = messages[currentIndex - 1];
      router.push(`/${locale}/mail/view/${prevMessage.id}?folder=${folder}`);
    }
  }, [currentIndex, messages, router, locale, folder]);

  const handleNextMessage = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < messages.length - 1) {
      const nextMessage = messages[currentIndex + 1];
      router.push(`/${locale}/mail/view/${nextMessage.id}?folder=${folder}`);
    }
  }, [currentIndex, messages, router, locale, folder]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const iconBtnSx = {
    borderRadius: 1,
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
  };

  if (loading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!message) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <InboxIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography color="text.secondary">{t('mail.messageNotFound')}</Typography>
        <IconButton onClick={handleBack} sx={iconBtnSx}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < messages.length - 1;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: 0,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Tooltip title={t('common.back')}>
          <IconButton onClick={handleBack} sx={iconBtnSx} size="small">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {folder !== 'draft' && (
          <>
            <Tooltip title={t('mail.reply')}>
              <IconButton onClick={handleReply} sx={iconBtnSx} size="small">
                <ReplyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('mail.forward')}>
              <IconButton onClick={handleForward} sx={iconBtnSx} size="small">
                <ForwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}

        {folder === 'trash' ? (
          <>
            <Tooltip title={t('mail.restore')}>
              <IconButton onClick={handleRestore} sx={iconBtnSx} size="small">
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('mail.deletePermanently')}>
              <IconButton onClick={handleDelete} sx={{ ...iconBtnSx, color: 'error.main' }} size="small">
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title={t('common.delete')}>
            <IconButton onClick={handleDelete} sx={iconBtnSx} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={message.is_read ? t('mail.markUnread') : t('mail.markRead')}>
          <IconButton onClick={handleToggleRead} sx={iconBtnSx} size="small">
            {message.is_read ? <MarkUnreadIcon fontSize="small" /> : <MarkReadIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        {/* Navigation */}
        {messages.length > 1 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>
              {currentIndex + 1} / {messages.length}
            </Typography>
            <Tooltip title={t('common.previous')}>
              <span>
                <IconButton onClick={handlePrevMessage} disabled={!hasPrev} sx={iconBtnSx} size="small">
                  <PrevIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('common.next')}>
              <span>
                <IconButton onClick={handleNextMessage} disabled={!hasNext} sx={iconBtnSx} size="small">
                  <NextIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </Paper>

      {/* Message Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Subject */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
          {message.subject || t('mail.noSubject')}
        </Typography>

        {/* Sender & Recipients Info */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {/* Avatar placeholder */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1rem',
                flexShrink: 0
              }}
            >
              {(message.sender_name || message.sender_email || '?')[0].toUpperCase()}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {message.sender_name || message.sender_email || t('mail.unknown')}
                </Typography>
                {message.sender_email && message.sender_name && (
                  <Typography variant="body2" color="text.secondary">
                    &lt;{message.sender_email}&gt;
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('mail.to')}: {message.recipients?.filter(r => r.type === 'to').map(r => r.name || r.email).join(', ') || t('mail.unknown')}
              </Typography>
              {message.recipients?.some(r => r.type === 'cc') && (
                <Typography variant="body2" color="text.secondary">
                  CC: {message.recipients.filter(r => r.type === 'cc').map(r => r.name || r.email).join(', ')}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {formatDate(message.sent_at || message.created_at)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Body */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            minHeight: 200
          }}
        >
          {message.body_html ? (
            <Box
              sx={{
                '& img': { maxWidth: '100%' },
                '& a': { color: 'primary.main' },
                lineHeight: 1.7,
                fontSize: '0.95rem'
              }}
              dangerouslySetInnerHTML={{ __html: message.body_html }}
            />
          ) : (
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
            >
              {message.body}
            </Typography>
          )}
        </Paper>

        {/* Attachments */}
        {attachmentFiles.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachFileIcon fontSize="small" color="action" />
              <Typography variant="subtitle2">
                {t('mail.attachments')} ({attachmentFiles.length})
              </Typography>
            </Box>
            <List dense disablePadding>
              {attachmentFiles.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FileIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" noWrap>
                        {file.originalFilename}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={file.fileExtension.toUpperCase()}
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.fileSize)}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={t('common.download')}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => downloadFile(file.id)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
