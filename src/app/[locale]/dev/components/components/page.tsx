'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { useRouter } from 'next/navigation';
import GridOnIcon from '@mui/icons-material/GridOn';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PageHeader from '@/components/common/PageHeader';

export default function ComponentsPage() {
  const router = useRouter();

  const components = [
    {
      title: 'Data Grid',
      description: 'Excel-Friendly Data Grid with export/import, inline editing, sorting, filtering, and pagination',
      icon: <GridOnIcon sx={{ fontSize: 48 }} />,
      path: '/dashboard/components/data-grid',
      color: '#1976d2'
    },
    {
      title: 'Rich Text Editor',
      description: 'HTML5 Rich Text Editor with full formatting capabilities including bold, italic, lists, links, images, tables, and code blocks',
      icon: <EditNoteIcon sx={{ fontSize: 48 }} />,
      path: '/dashboard/components/rich-text-editor',
      color: '#2e7d32'
    },
    {
      title: 'File Upload',
      description: 'File upload with drag & drop, multiple files support, progress tracking, and file size limits',
      icon: <CloudUploadIcon sx={{ fontSize: 48 }} />,
      path: '/dashboard/components/file-upload',
      color: '#ed6c02'
    }
  ];

  return (
    <Container maxWidth={false} sx={{ maxWidth: '100%', px: 0 }}>
      <PageHeader useMenu showBreadcrumb />

      <Grid container spacing={3}>
        {components.map((component) => (
          <Grid item xs={12} md={6} lg={4} key={component.path}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: component.color
                  }}
                >
                  {component.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                  {component.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {component.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push(component.path)}
                  sx={{ backgroundColor: component.color }}
                >
                  View Component
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
