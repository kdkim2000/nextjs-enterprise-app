'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { Box } from '@mui/material';
import MailPageContent from '../components/MailPageContent';
import { FolderType } from '../hooks/useMailData';

// Map folder URL to folder type
const FOLDER_CONFIG: Record<string, FolderType> = {
  inbox: 'inbox',
  sent: 'sent',
  draft: 'draft',
  trash: 'trash',
};

export default function MailFolderPage() {
  const params = useParams();
  const folder = params.folder as string;

  const folderType = FOLDER_CONFIG[folder];
  if (!folderType) {
    notFound();
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <MailPageContent initialFolder={folderType} />
    </Box>
  );
}
