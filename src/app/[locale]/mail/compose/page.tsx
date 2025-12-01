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
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Send,
  Save,
  Delete
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { useHelp } from '@/hooks/useHelp';
import { useMailData } from '../hooks/useMailData';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import RichTextEditor from '@/components/common/RichTextEditor';
import UserAutocomplete from '@/components/common/UserAutocomplete';

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

  // Form state - simplified: single recipient only
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);

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
              // Reply
              setRecipientId(message.sender_id);
              setRecipientName(message.sender_name || '');
              setRecipientEmail(message.sender_email || '');
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
              setRecipientId(message.recipient_id);
              setRecipientName(message.recipient_name || '');
              setRecipientEmail(message.recipient_email || '');
              setSubject(message.subject || '');
              setBodyHtml(message.body_html || message.body || '');
              setCurrentDraftId(draftId);
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
    if (!recipientId) {
      setErrorMessage(t('mail.recipientRequired'));
      return;
    }

    setSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await sendMessage({
        recipientId: recipientId,
        recipientName,
        recipientEmail,
        subject,
        body: bodyHtml.replace(/<[^>]+>/g, ''),
        bodyHtml,
        draftId: currentDraftId || undefined
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
      const draftData = {
        recipientId: recipientId || undefined,
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        subject,
        body: bodyHtml.replace(/<[^>]+>/g, ''),
        bodyHtml
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

        {/* Recipient */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ width: 50, fontWeight: 500 }}>{t('mail.to')}:</Typography>
            <Box sx={{ flex: 1 }}>
              <UserAutocomplete
                value={recipientId}
                onChange={(userId) => {
                  if (!userId) {
                    setRecipientId(null);
                    setRecipientName('');
                    setRecipientEmail('');
                  }
                }}
                onUserSelect={(user) => {
                  if (user) {
                    setRecipientId(user.id);
                    setRecipientName(user.name || user.username);
                    setRecipientEmail(user.username);
                  } else {
                    setRecipientId(null);
                    setRecipientName('');
                    setRecipientEmail('');
                  }
                }}
                placeholder={t('mail.selectRecipient')}
              />
            </Box>
          </Box>
        </Box>

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

        {/* Actions */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" startIcon={<Save />} onClick={handleSaveDraft} disabled={saving || sending}>
            {saving ? t('common.saving') : t('mail.saveDraft' as any)}
          </Button>
          <Button
            variant="contained"
            startIcon={sending ? <CircularProgress size={20} /> : <Send />}
            onClick={handleSend}
            disabled={sending || saving || !recipientId}
          >
            {sending ? t('common.sending') : t('mail.send' as any)}
          </Button>
        </Box>
      </Paper>
    </StandardCrudPageLayout>
  );
}
