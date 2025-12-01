'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  FormControlLabel,
  Checkbox,
  Collapse,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Save,
  Delete,
  ExpandMore,
  ExpandLess,
  AttachFile,
  InsertDriveFile,
  Image as ImageIcon
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { useHelp } from '@/hooks/useHelp';
import { useMailData, Recipient, RecipientType } from '../hooks/useMailData';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import RichTextEditor from '@/components/common/RichTextEditor';
import UserAutocomplete from '@/components/common/UserAutocomplete';
import api from '@/lib/axios';

const PROGRAM_ID = 'PROG-MAIL-COMPOSE';

interface UserOption {
  id: string;
  username: string;
  name?: string;
  email?: string;
}

interface AttachmentFile {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  isImage?: boolean;
}

interface AttachmentInfo {
  id: string;
  files: AttachmentFile[];
}

export default function MailComposePage() {
  const theme = useTheme();
  const router = useRouter();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const t = useI18n() as unknown as (key: string) => string;

  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: PROGRAM_ID });

  const { sendMessage, getMessage, createDraft, updateDraft } = useMailData();

  // URL params for reply/forward/draft
  const replyToId = searchParams.get('replyTo');
  const forwardId = searchParams.get('forward');
  const draftId = searchParams.get('draft');

  // Form state - multi-recipient
  const [toRecipients, setToRecipients] = useState<Recipient[]>([]);
  const [ccRecipients, setCcRecipients] = useState<Recipient[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);
  const [sendExternal, setSendExternal] = useState(false);

  // Attachment state
  const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // UI state
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add recipient helper
  const addRecipient = useCallback((user: UserOption, type: RecipientType) => {
    const newRecipient: Recipient = {
      id: user.id,
      name: user.name || user.username,
      email: user.email || user.username,
      type
    };

    if (type === 'to') {
      if (!toRecipients.find(r => r.id === user.id)) {
        setToRecipients(prev => [...prev, newRecipient]);
      }
    } else if (type === 'cc') {
      if (!ccRecipients.find(r => r.id === user.id)) {
        setCcRecipients(prev => [...prev, newRecipient]);
      }
    }
  }, [toRecipients, ccRecipients]);

  // Remove recipient helper
  const removeRecipient = useCallback((userId: string, type: RecipientType) => {
    if (type === 'to') {
      setToRecipients(prev => prev.filter(r => r.id !== userId));
    } else if (type === 'cc') {
      setCcRecipients(prev => prev.filter(r => r.id !== userId));
    }
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('attachmentTypeCode', 'MAIL');
      if (attachment?.id) {
        formData.append('attachmentId', attachment.id);
      }
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/attachment/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { attachment: newAttachment, uploadedFiles } = response.data;
      setAttachment({
        id: newAttachment.id,
        files: [...(attachment?.files || []), ...uploadedFiles]
      });
    } catch (error) {
      console.error('File upload failed:', error);
      setErrorMessage(t('mail.attachmentUploadFailed'));
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [attachment, t]);

  // File delete handler
  const handleFileDelete = useCallback(async (fileId: string) => {
    if (!attachment) return;

    try {
      await api.delete(`/attachment/file/${fileId}`);
      setAttachment(prev => {
        if (!prev) return null;
        const updatedFiles = prev.files.filter(f => f.id !== fileId);
        if (updatedFiles.length === 0) return null;
        return { ...prev, files: updatedFiles };
      });
    } catch (error) {
      console.error('File delete failed:', error);
      setErrorMessage(t('mail.attachmentDeleteFailed'));
    }
  }, [attachment, t]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Load reply/forward/draft data
  useEffect(() => {
    const loadData = async () => {
      if (!replyToId && !forwardId && !draftId) return;

      setLoading(true);
      try {
        const messageId = replyToId || forwardId || draftId;
        if (messageId) {
          const message = await getMessage(messageId);
          if (message) {
            if (replyToId) {
              // Reply - add sender as recipient
              setToRecipients([{
                id: message.sender_id,
                name: message.sender_name,
                email: message.sender_email,
                type: 'to'
              }]);
              setSubject(`Re: ${message.subject || ''}`);
              setBodyHtml(`
                <br/><br/>
                <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 10px; color: #666;">
                  <p><strong>On ${new Date(message.sent_at || message.created_at).toLocaleString()}, ${message.sender_name} wrote:</strong></p>
                  ${message.body_html || `<p>${message.body}</p>`}
                </div>
              `);
            } else if (forwardId) {
              // Forward
              setSubject(`Fwd: ${message.subject || ''}`);
              setBodyHtml(`
                <br/><br/>
                <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 10px;">
                  <p><strong>---------- Forwarded message ---------</strong></p>
                  <p><strong>From:</strong> ${message.sender_name}</p>
                  <p><strong>Date:</strong> ${new Date(message.sent_at || message.created_at).toLocaleString()}</p>
                  <p><strong>Subject:</strong> ${message.subject}</p>
                  <br/>
                  ${message.body_html || `<p>${message.body}</p>`}
                </div>
              `);
            } else if (draftId) {
              // Draft - load existing draft data
              if (message.recipients) {
                const to = message.recipients.filter(r => r.type === 'to');
                const cc = message.recipients.filter(r => r.type === 'cc');
                setToRecipients(to);
                setCcRecipients(cc);
                if (cc.length > 0) setShowCc(true);
              }
              setSubject(message.subject || '');
              setBodyHtml(message.body_html || message.body || '');
              setSendExternal(message.send_external || false);
              setCurrentDraftId(draftId);
              // Load attachment if exists
              if (message.attachment_id) {
                try {
                  const attachRes = await api.get(`/attachment/${message.attachment_id}`);
                  if (attachRes.data.attachment) {
                    setAttachment({
                      id: attachRes.data.attachment.id,
                      files: attachRes.data.attachment.files || []
                    });
                  }
                } catch (e) {
                  console.error('Failed to load attachment:', e);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load message:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [replyToId, forwardId, draftId, getMessage]);

  const handleSend = async () => {
    if (toRecipients.length === 0) {
      setErrorMessage(t('mail.recipientRequired'));
      return;
    }

    setSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const allRecipients = [
        ...toRecipients.map(r => ({ ...r, type: 'to' as RecipientType })),
        ...ccRecipients.map(r => ({ ...r, type: 'cc' as RecipientType }))
      ];

      await sendMessage({
        recipients: allRecipients,
        subject,
        body: bodyHtml.replace(/<[^>]+>/g, ''),
        bodyHtml,
        draftId: currentDraftId || undefined,
        attachmentId: attachment?.id,
        sendExternal
      });
      setSuccessMessage(t('mail.sendSuccess'));
      setTimeout(() => {
        router.push(`/${locale}/mail/sent`);
      }, 1000);
    } catch (error) {
      console.error('Send failed:', error);
      setErrorMessage(t('mail.sendFailed'));
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const allRecipients = [
        ...toRecipients.map(r => ({ ...r, type: 'to' as RecipientType })),
        ...ccRecipients.map(r => ({ ...r, type: 'cc' as RecipientType }))
      ];

      const draftData = {
        recipients: allRecipients,
        subject,
        body: bodyHtml.replace(/<[^>]+>/g, ''),
        bodyHtml,
        attachmentId: attachment?.id,
        sendExternal
      };

      if (currentDraftId) {
        await updateDraft(currentDraftId, draftData);
      } else {
        const draft = await createDraft(draftData);
        setCurrentDraftId(draft.id);
      }
      setSuccessMessage(t('mail.draftSaved'));
    } catch (error) {
      console.error('Save draft failed:', error);
      setErrorMessage(t('mail.draftSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    router.back();
  };

  const getPageTitle = () => {
    if (replyToId) return t('mail.reply');
    if (forwardId) return t('mail.forward');
    if (draftId) return t('mail.editDraft');
    return t('mail.compose');
  };

  if (loading) {
    return (
      <StandardCrudPageLayout
        useMenu
        showBreadcrumb
        showQuickSearch={false}
        showAdvancedFilter={false}
        programId={PROGRAM_ID}
        helpOpen={helpOpen}
        onHelpOpenChange={setHelpOpen}
        isAdmin={isAdmin}
        helpExists={helpExists}
        canManageHelp={canManageHelp}
        onHelpEdit={navigateToHelpEdit}
        language={language}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </StandardCrudPageLayout>
    );
  }

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      showQuickSearch={false}
      showAdvancedFilter={false}
      programId={PROGRAM_ID}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      successMessage={successMessage}
      errorMessage={errorMessage}
    >
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <IconButton onClick={handleDiscard}><ArrowBack /></IconButton>
          <Typography variant="h6">{getPageTitle()}</Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={handleDiscard} color="error"><Delete /></IconButton>
        </Box>

        {/* To Recipients */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Typography variant="body2" sx={{ width: 50, fontWeight: 500, pt: 1 }}>{t('mail.to')}:</Typography>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: toRecipients.length > 0 ? 1 : 0 }}>
                {toRecipients.map(r => (
                  <Chip
                    key={r.id}
                    label={r.name || r.email}
                    size="small"
                    onDelete={() => removeRecipient(r.id, 'to')}
                  />
                ))}
              </Box>
              <UserAutocomplete
                value={null}
                onChange={() => {}}
                onUserSelect={(user) => {
                  if (user) {
                    addRecipient(user, 'to');
                  }
                }}
                placeholder={t('mail.addRecipient')}
                clearOnSelect
              />
            </Box>
            <Button
              size="small"
              onClick={() => setShowCc(!showCc)}
              endIcon={showCc ? <ExpandLess /> : <ExpandMore />}
            >
              CC
            </Button>
          </Box>
        </Box>

        {/* CC Recipients */}
        <Collapse in={showCc}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="body2" sx={{ width: 50, fontWeight: 500, pt: 1 }}>CC:</Typography>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: ccRecipients.length > 0 ? 1 : 0 }}>
                  {ccRecipients.map(r => (
                    <Chip
                      key={r.id}
                      label={r.name || r.email}
                      size="small"
                      onDelete={() => removeRecipient(r.id, 'cc')}
                    />
                  ))}
                </Box>
                <UserAutocomplete
                  value={null}
                  onChange={() => {}}
                  onUserSelect={(user) => {
                    if (user) {
                      addRecipient(user, 'cc');
                    }
                  }}
                  placeholder={t('mail.addCc')}
                  clearOnSelect
                />
              </Box>
            </Box>
          </Box>
        </Collapse>

        {/* Subject */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            placeholder={t('mail.subject')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{ '& input': { fontSize: '1.1rem' } }}
          />
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <RichTextEditor
            value={bodyHtml}
            onChange={setBodyHtml}
            placeholder={t('mail.writeMessage')}
            minHeight={400}
          />
        </Box>

        {/* Attachments */}
        {attachment && attachment.files.length > 0 && (
          <Box sx={{ px: 2, pb: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pt: 1, pb: 0.5 }}>
              {t('mail.attachments')} ({attachment.files.length})
            </Typography>
            <List dense disablePadding>
              {attachment.files.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{ py: 0.5, px: 1, bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }}
                >
                  <Box sx={{ mr: 1, color: 'text.secondary' }}>
                    {file.isImage ? <ImageIcon fontSize="small" /> : <InsertDriveFile fontSize="small" />}
                  </Box>
                  <ListItemText
                    primary={file.originalFilename}
                    secondary={formatFileSize(file.fileSize)}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => handleFileDelete(file.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Options & Actions */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
            />
            <Button
              size="small"
              startIcon={uploadingFiles ? <CircularProgress size={16} /> : <AttachFile />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles || sending}
            >
              {t('mail.attach')}
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendExternal}
                  onChange={(e) => setSendExternal(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{t('mail.sendExternal')}</Typography>}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Save />} onClick={handleSaveDraft} disabled={saving || sending}>
              {saving ? t('common.saving') : t('mail.saveDraft')}
            </Button>
            <Button
              variant="contained"
              startIcon={sending ? <CircularProgress size={20} /> : <Send />}
              onClick={handleSend}
              disabled={sending || saving || toRecipients.length === 0}
            >
              {sending ? t('common.sending') : t('mail.send')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </StandardCrudPageLayout>
  );
}
