'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';
import { useCurrentLocale } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';

// Import JSON content files
import enContent from '@/content/privacy-policy/en.json';
import koContent from '@/content/privacy-policy/ko.json';

// Type definition for privacy policy content
interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string[];
}

interface PrivacyPolicyContent {
  version: string;
  effectiveDate: string;
  title: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
  footer: {
    message: string;
  };
}

export default function PrivacyPolicyPage() {
  const locale = useCurrentLocale();

  // Select content based on current locale
  const content: PrivacyPolicyContent = locale === 'ko' ? koContent : enContent;
  const currentContent = content;

  return (
    <Container maxWidth={false} sx={{ maxWidth: '100%', px: 0 }}>
      <PageHeader useMenu showBreadcrumb />

      <Paper sx={{ p: 4 }}>
        {currentContent.sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
              {section.title}
            </Typography>
            {section.content.map((paragraph, pIndex) => (
              <Typography
                key={pIndex}
                variant="body1"
                paragraph
                sx={{
                  lineHeight: 1.8,
                  color: 'text.secondary',
                  whiteSpace: 'pre-line'
                }}
              >
                {paragraph}
              </Typography>
            ))}
            {index < currentContent.sections.length - 1 && (
              <Divider sx={{ mt: 3 }} />
            )}
          </Box>
        ))}
      </Paper>

      <Box sx={{ mt: 4, mb: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="body2" color="info.dark">
          {currentContent.footer.message}
        </Typography>
      </Box>
    </Container>
  );
}
