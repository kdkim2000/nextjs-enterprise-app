'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  PlayArrow as StartIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { inspectionApi } from '@/lib/axios';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMessage } from '@/hooks/useMessage';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Inspection, InspectionResult, ChecksheetItem, InspectionStatus } from '../types';
import { format } from 'date-fns';

const getStatusColor = (status: InspectionStatus): 'default' | 'success' | 'warning' | 'error' | 'primary' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'draft':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: InspectionStatus, locale: string): string => {
  const labels: Record<InspectionStatus, Record<string, string>> = {
    draft: { ko: '초안', en: 'Draft' },
    in_progress: { ko: '진행중', en: 'In Progress' },
    completed: { ko: '완료', en: 'Completed' },
    cancelled: { ko: '취소', en: 'Cancelled' },
  };
  return labels[status]?.[locale] || labels[status]?.['en'] || status;
};

export default function InspectionDetailPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;

  const { successMessage, errorMessage, showErrorMessage } = useMessage({ locale: currentLocale });

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const inspectionResponse = await inspectionApi.get(`/executions/${inspectionId}`);
      setInspection(inspectionResponse.inspection);

      if (inspectionResponse.inspection?.template_id) {
        const itemsResponse = await inspectionApi.get(
          `/items?template_id=${inspectionResponse.inspection.template_id}`
        );
        setItems(itemsResponse.items || []);
      }

      const resultsResponse = await inspectionApi.get(`/executions/${inspectionId}/results`);
      setResults(resultsResponse.results || []);
    } catch (error) {
      console.error('Failed to fetch inspection:', error);
      await showErrorMessage('COMMON_LOAD_FAIL');
    } finally {
      setLoading(false);
    }
  }, [inspectionId, showErrorMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    router.push(`/${currentLocale}/inspection/executions`);
  };

  const handleStartInspection = () => {
    router.push(`/${currentLocale}/inspection/executions/${inspectionId}/execute`);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm');
    } catch {
      return '-';
    }
  };

  const getResultValue = (itemId: string): string => {
    const result = results.find((r) => r.item_id === itemId);
    return result?.value || '-';
  };

  const getResultNotes = (itemId: string): string => {
    const result = results.find((r) => r.item_id === itemId);
    return result?.notes || '';
  };

  const renderResultValue = (item: ChecksheetItem): React.ReactNode => {
    const value = getResultValue(item.id);

    if (item.item_type === 'checkbox') {
      return value === 'true' || value === '1' ? (
        <CheckIcon color="success" fontSize="small" />
      ) : (
        <CancelIcon color="disabled" fontSize="small" />
      );
    }

    return value;
  };

  if (loading) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </StandardCrudPageLayout>
    );
  }

  if (!inspection) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Alert severity="error">
          {getLocalizedValue({ en: 'Inspection not found', ko: '검사를 찾을 수 없습니다' }, currentLocale)}
        </Alert>
      </StandardCrudPageLayout>
    );
  }

  const canEdit = inspection.status === 'draft';
  const canStart = inspection.status === 'draft' || inspection.status === 'in_progress';

  return (
    <StandardCrudPageLayout useMenu showBreadcrumb successMessage={successMessage} errorMessage={errorMessage}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6">{inspection.title}</Typography>
            <Chip
              label={getStatusLabel(inspection.status, currentLocale)}
              size="small"
              color={getStatusColor(inspection.status)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<PrintIcon />} size="small">
              {getLocalizedValue({ en: 'Print', ko: '인쇄' }, currentLocale)}
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
              {getLocalizedValue({ en: 'Export', ko: '내보내기' }, currentLocale)}
            </Button>
            {canStart && (
              <Button variant="contained" color="primary" startIcon={<StartIcon />} onClick={handleStartInspection}>
                {inspection.status === 'in_progress'
                  ? getLocalizedValue({ en: 'Continue', ko: '계속' }, currentLocale)
                  : getLocalizedValue({ en: 'Start', ko: '시작' }, currentLocale)}
              </Button>
            )}
          </Box>
        </Box>

        {/* Inspection Info */}
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Inspection Code', ko: '검사코드' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.inspection_code}</Typography>
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Template', ko: '템플릿' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.template_name || inspection.template_code || '-'}</Typography>
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Description', ko: '설명' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.description || '-'}</Typography>
          </Grid>
          <Grid item size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Inspector', ko: '검사자' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.inspector_name || '-'}</Typography>
          </Grid>
          <Grid item size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Location', ko: '위치' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.location || '-'}</Typography>
          </Grid>
          <Grid item size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Inspection Date', ko: '검사일' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{formatDate(inspection.inspection_date)}</Typography>
          </Grid>
          <Grid item size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Completed At', ko: '완료일' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.completed_at ? formatDate(inspection.completed_at) : '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {getLocalizedValue({ en: 'Inspection Results', ko: '검사 결과' }, currentLocale)}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {items.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            {getLocalizedValue({ en: 'No inspection items', ko: '검사 항목이 없습니다' }, currentLocale)}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={80}>
                    {getLocalizedValue({ en: 'Code', ko: '코드' }, currentLocale)}
                  </TableCell>
                  <TableCell>
                    {getLocalizedValue({ en: 'Item', ko: '항목' }, currentLocale)}
                  </TableCell>
                  <TableCell width={120}>
                    {getLocalizedValue({ en: 'Type', ko: '유형' }, currentLocale)}
                  </TableCell>
                  <TableCell width={200}>
                    {getLocalizedValue({ en: 'Result', ko: '결과' }, currentLocale)}
                  </TableCell>
                  <TableCell>
                    {getLocalizedValue({ en: 'Notes', ko: '비고' }, currentLocale)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items
                  .filter((item) => !item.parent_id)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.item_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{item.item_name}</Typography>
                          {item.required && (
                            <Chip
                              label={getLocalizedValue({ en: 'Required', ko: '필수' }, currentLocale)}
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ height: 16, fontSize: '0.6rem', ml: 1 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {item.item_type}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderResultValue(item)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {getResultNotes(item.id)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </StandardCrudPageLayout>
  );
}
