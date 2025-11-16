'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Tooltip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

// Import JSON content files
import enVersions from '@/content/privacy-policy/en-versions.json';
import koVersions from '@/content/privacy-policy/ko-versions.json';
import zhVersions from '@/content/privacy-policy/zh-versions.json';
import viVersions from '@/content/privacy-policy/vi-versions.json';

// Type definition for privacy policy content
interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string[];
}

interface PrivacyPolicyVersion {
  version: string;
  effectiveDate: string;
  title: string;
  lastUpdated: string;
  isLatest: boolean;
  sections: PrivacyPolicySection[];
  footer: {
    message: string;
  };
}

interface PrivacyPolicyVersions {
  currentVersion: string;
  versions: PrivacyPolicyVersion[];
}

export default function PrivacyPolicyPage() {
  const locale = useCurrentLocale();
  const router = useRouter();
  const t = useI18n();

  // Select content based on current locale
  const getVersionsData = (): PrivacyPolicyVersions => {
    switch (locale) {
      case 'ko':
        return koVersions;
      case 'zh':
        return zhVersions;
      case 'vi':
        return viVersions;
      default:
        return enVersions;
    }
  };

  const versionsData: PrivacyPolicyVersions = getVersionsData();

  // State for selected version - default to latest
  const [selectedVersion, setSelectedVersion] = useState(versionsData.currentVersion);

  // Get current version content
  const currentContent = versionsData.versions.find(v => v.version === selectedVersion)
    || versionsData.versions[0];

  const handleVersionChange = (event: any) => {
    setSelectedVersion(event.target.value);
  };

  const headerActions = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Version Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {currentContent.isLatest && (
          <Chip
            label={t('privacyPolicy.latest')}
            color="success"
            size="small"
            sx={{ height: 24 }}
          />
        )}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedVersion}
            onChange={handleVersionChange}
            sx={{
              '& .MuiSelect-select': {
                py: 0.75,
                fontSize: '0.875rem'
              }
            }}
          >
            {versionsData.versions.map((version) => (
              <MenuItem key={version.version} value={version.version}>
                v{version.version} ({version.effectiveDate})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Divider */}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Back Button */}
      <Tooltip title={t('common.back')}>
        <IconButton
          onClick={() => router.back()}
          size="small"
          sx={{
            color: 'inherit',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <ArrowBack />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <PageContainer fullHeight={false}>
      <PageHeader useMenu showBreadcrumb actions={headerActions} />

      {/* Version Info Banner */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'background.default',
          borderLeft: 3,
          borderColor: 'primary.main'
        }}
      >
        <Typography variant="body2" fontWeight={500} color="text.primary">
          {currentContent.lastUpdated}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('privacyPolicy.effectiveDate')}: {currentContent.effectiveDate}
        </Typography>
      </Paper>

      {/* Privacy Policy Content */}
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
    </PageContainer>
  );
}
