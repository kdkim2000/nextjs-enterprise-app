'use client';

import React from 'react';
import { Box, Typography, Paper, Divider, Alert, Chip } from '@mui/material';
import { Construction } from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

interface ComponentDemoTemplateProps {
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  category: string;
  tags: string[];
  importPath: string;
  children?: React.ReactNode;
}

export default function ComponentDemoTemplate({
  title,
  titleKo,
  description,
  descriptionKo,
  category,
  tags,
  importPath,
  children
}: ComponentDemoTemplateProps) {
  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" fontWeight={600}>
            {title}
          </Typography>
          <Chip label={category} color="primary" size="small" />
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {titleKo}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descriptionKo}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {children ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Demo / 데모
          </Typography>
          {children}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', mb: 4 }}>
          <Construction sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Demo Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interactive demo for this component is under development.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            이 컴포넌트의 인터랙티브 데모는 개발 중입니다.
          </Typography>
        </Paper>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Usage / 사용법
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1 }}>
          <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 14, m: 0 }}>
            {`import ${title.replace(/\s+/g, '')} from '${importPath}';

// Example usage
<${title.replace(/\s+/g, '')} />
`}
          </Typography>
        </Paper>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Location:</strong> <code>{importPath}</code>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          For more details, check the component source code or contact the development team.
        </Typography>
        <Typography variant="body2">
          자세한 내용은 컴포넌트 소스 코드를 확인하거나 개발팀에 문의하세요.
        </Typography>
      </Alert>
    </PageContainer>
  );
}
