'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import FileUploadZone, { UploadedFile } from '@/components/common/FileUploadZone';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

export default function FileUploadZonePage() {
  const [basicFiles, setBasicFiles] = useState<UploadedFile[]>([]);
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
  const [limitedFiles, setLimitedFiles] = useState<UploadedFile[]>([]);

  return (
    <PageContainer fullHeight={false}>
      <PageHeader useMenu showBreadcrumb />

      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            FileUploadZone Component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A drag-and-drop file upload component with preview, progress tracking,
            file type validation, and size limits.
          </Typography>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop files or click to select. Supports multiple file types.
          </Typography>

          <FileUploadZone
            value={basicFiles}
            onChange={setBasicFiles}
          />

          {basicFiles.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={600}>
                Uploaded Files: {basicFiles.map(f => f.file.name).join(', ')}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Images Only */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Images Only
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Accept only image files with preview.
          </Typography>

          <FileUploadZone
            value={imageFiles}
            onChange={setImageFiles}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            }}
            helperText="Only image files are allowed (JPG, PNG, GIF, WebP)"
            showPreview
          />
        </Paper>

        {/* Limited Files */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Limited Files (Max 3, 5MB each)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Limit the number of files and maximum file size.
          </Typography>

          <FileUploadZone
            value={limitedFiles}
            onChange={setLimitedFiles}
            maxFiles={3}
            maxSize={5 * 1024 * 1024}
            helperText="Max 3 files, 5MB each"
          />
        </Paper>

        {/* Disabled State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>

          <FileUploadZone
            value={[]}
            onChange={() => {}}
            disabled
          />
        </Paper>

        {/* Error State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error State
          </Typography>

          <FileUploadZone
            value={[]}
            onChange={() => {}}
            error
            helperText="At least one file is required"
          />
        </Paper>

        <Divider />

        {/* Props Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Props Reference
          </Typography>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Prop</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Type</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Default</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[
                { prop: 'value', type: 'UploadedFile[]', default: '[]', desc: 'Current uploaded files' },
                { prop: 'onChange', type: '(files: UploadedFile[]) => void', default: '-', desc: 'Callback when files change' },
                { prop: 'maxFiles', type: 'number', default: '5', desc: 'Maximum number of files' },
                { prop: 'maxSize', type: 'number', default: '10MB', desc: 'Max file size in bytes' },
                { prop: 'accept', type: 'Record<string, string[]>', default: 'images, pdf, docs...', desc: 'Accepted file types' },
                { prop: 'disabled', type: 'boolean', default: 'false', desc: 'Disable upload' },
                { prop: 'error', type: 'boolean', default: 'false', desc: 'Error state' },
                { prop: 'helperText', type: 'string', default: '-', desc: 'Helper/error text' },
                { prop: 'showPreview', type: 'boolean', default: 'true', desc: 'Show image previews' },
              ].map((row, index) => (
                <Box component="tr" key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box component="td" sx={{ p: 1 }}><code>{row.prop}</code></Box>
                  <Box component="td" sx={{ p: 1 }}><code>{row.type}</code></Box>
                  <Box component="td" sx={{ p: 1 }}>{row.default}</Box>
                  <Box component="td" sx={{ p: 1 }}>{row.desc}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* UploadedFile Interface */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            UploadedFile Interface
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0 }}>
{`interface UploadedFile {
  file: File;       // The File object
  preview?: string; // Preview URL for images
  progress?: number; // Upload progress 0-100
  error?: string;   // Error message if any
  uploaded?: boolean; // Whether upload completed
}`}
            </pre>
          </Box>
        </Paper>

        {/* Usage Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Usage Example
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`import FileUploadZone, { UploadedFile } from '@/components/common/FileUploadZone';

const [files, setFiles] = useState<UploadedFile[]>([]);

<FileUploadZone
  value={files}
  onChange={setFiles}
  maxFiles={3}
  maxSize={5 * 1024 * 1024} // 5MB
  accept={{
    'image/*': ['.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf']
  }}
  helperText="Upload images or PDFs"
/>`}
            </pre>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
