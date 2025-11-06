'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack
} from '@mui/material';
import FileUpload from '@/components/common/FileUpload';
import PageHeader from '@/components/common/PageHeader';

export default function FileUploadPage() {
  return (
    <Container maxWidth={false} sx={{ maxWidth: '100%', px: 0 }}>
      <PageHeader useMenu showBreadcrumb />

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">File Upload with Drag & Drop</Typography>

          <Typography variant="body2" color="text.secondary">
            Features: Drag & drop, Multiple files, Progress tracking, File size limits
          </Typography>

          <FileUpload
            multiple
            maxSize={10}
            acceptedTypes={['.pdf', '.doc', '.docx', '.xlsx', '.jpg', '.png']}
            onUploadComplete={(files) => {
              console.log('Uploaded files:', files);
            }}
            autoUpload
          />
        </Stack>
      </Paper>
    </Container>
  );
}
