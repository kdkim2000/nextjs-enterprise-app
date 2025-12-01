'use client';

import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Checkbox,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Save,
  Delete
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { useHelp } from '@/hooks/useHelp';
import { useMailData, RecipientType } from '../hooks/useMailData';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import RichTextEditor from '@/components/common/RichTextEditor';
import MultiUserSelect, { UserOption } from '@/components/common/MultiUserSelect';
import AttachmentUpload from '@/components/common/AttachmentUpload';

const PROGRAM_ID = 'PROG-MAIL-COMPOSE';

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
  const [toRecipients, setToRecipients] = useState<UserOption[]>([]);
  const [ccRecipients, setCcRecipients] = useState<UserOption[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);
  const [sendExternal, setSendExternal] = useState(false);

  // Attachment state
  const [attachmentId, setAttachmentId] = useState<string | null>(null);

  // UI state
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                username: message.sender_email || message.sender_name || '',
                name: message.sender_name,
                email: message.sender_email
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
                const toUserOptions = message.recipients
                  .filter(r => r.type === 'to')
                  .map(r => ({ id: r.id, username: r.email || r.name || '', name: r.name, email: r.email }));
                const ccUserOptions = message.recipients
                  .filter(r => r.type === 'cc')
                  .map(r => ({ id: r.id, username: r.email || r.name || '', name: r.name, email: r.email }));
                setToRecipients(toUserOptions);
                setCcRecipients(ccUserOptions);
                if (ccUserOptions.length > 0) setShowCc(true);
              }
              setSubject(message.subject || '');
              setBodyHtml(message.body_html || message.body || '');
              setSendExternal(message.send_external || false);
              setCurrentDraftId(draftId);
              // Set attachment ID if exists (AttachmentUpload will auto-fetch files)
              if (message.attachment_id) {
                setAttachmentId(message.attachment_id);
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
        attachmentId: attachmentId || undefined,
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
        attachmentId: attachmentId || undefined,
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
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                minWidth: 40,
                fontWeight: 500,
                pt: 1,
                color: 'text.secondary'
              }}
            >
              {t('mail.to')}
            </Typography>
            <Box sx={{ flex: 1 }}>
              <MultiUserSelect
                value={toRecipients}
                onChange={setToRecipients}
                placeholder={t('mail.addRecipient')}
                error={toRecipients.length === 0 && errorMessage === t('mail.recipientRequired')}
              />
            </Box>
            <Button
              size="small"
              variant={showCc ? 'contained' : 'text'}
              onClick={() => setShowCc(!showCc)}
              sx={{
                minWidth: 48,
                height: 36,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              CC
            </Button>
          </Box>
        </Box>

        {/* CC Recipients */}
        <Collapse in={showCc}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  minWidth: 40,
                  fontWeight: 500,
                  pt: 1,
                  color: 'text.secondary'
                }}
              >
                CC
              </Typography>
              <Box sx={{ flex: 1 }}>
                <MultiUserSelect
                  value={ccRecipients}
                  onChange={setCcRecipients}
                  placeholder={t('mail.addCc')}
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

        {/* Attachments - using common component */}
        <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <AttachmentUpload
            attachmentTypeCode="MAIL"
            locale={locale}
            onUploadComplete={(id) => setAttachmentId(id)}
            compact
            showDownload={false}
          />
        </Box>

        {/* Options & Actions */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
