'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { GridOn, CloudUpload, TextFields } from '@mui/icons-material';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';

export default function DevPage() {
  const locale = useCurrentLocale();

  const components = [
    {
      title: 'DataGrid',
      description: 'Excel-like data grid with advanced features',
      icon: GridOn,
      href: `/${locale}/dev/components/data-grid`,
      color: '#1976d2'
    },
    {
      title: 'File Upload',
      description: 'Drag-and-drop file upload component',
      icon: CloudUpload,
      href: `/${locale}/dev/components/file-upload`,
      color: '#2e7d32'
    },
    {
      title: 'Rich Text Editor',
      description: 'WYSIWYG text editor with formatting options',
      icon: TextFields,
      href: `/${locale}/dev/components/rich-text-editor`,
      color: '#ed6c02'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader useMenu showBreadcrumb />

      <Grid container spacing={3}>
        {components.map((component) => (
          <Grid item xs={12} sm={6} md={4} key={component.href}>
            <Card>
              <CardActionArea component={Link} href={component.href}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: `${component.color}15`,
                      mb: 2
                    }}
                  >
                    <component.icon sx={{ fontSize: 32, color: component.color }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {component.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {component.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
