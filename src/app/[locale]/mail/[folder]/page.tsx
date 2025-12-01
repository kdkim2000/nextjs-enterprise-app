'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { useHelp } from '@/hooks/useHelp';
import MailPageContent from '../components/MailPageContent';
import { FolderType } from '../hooks/useMailData';

// Map folder URL to folder type and program ID (simplified - no starred)
const FOLDER_CONFIG: Record<string, { folderType: FolderType; programId: string }> = {
  inbox: { folderType: 'inbox', programId: 'PROG-MAIL-INBOX' },
  sent: { folderType: 'sent', programId: 'PROG-MAIL-SENT' },
  draft: { folderType: 'draft', programId: 'PROG-MAIL-DRAFT' },
  trash: { folderType: 'trash', programId: 'PROG-MAIL-TRASH' },
};

export default function MailFolderPage() {
  const params = useParams();
  const folder = params.folder as string;

  const config = FOLDER_CONFIG[folder];
  if (!config) {
    notFound();
  }

  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: config.programId });

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      showQuickSearch={false}
      showAdvancedFilter={false}
      programId={config.programId}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
      <MailPageContent initialFolder={config.folderType} />
    </StandardCrudPageLayout>
  );
}
