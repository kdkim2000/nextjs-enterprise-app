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
  Grid2 as Grid,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  PlayArrow as StartIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MoreVert as MoreIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MobileFab from '@/components/mobile/MobileFab';
import MobileDetailSheet from '@/components/mobile/MobileDetailSheet';
import { useMobile } from '@/hooks/useMobile';
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
    submitted: { ko: '제출됨', en: 'Submitted' },
    cancelled: { ko: '취소', en: 'Cancelled' },
  };
  return labels[status]?.[locale] || labels[status]?.['en'] || status;
};

const getItemTypeLabel = (itemType: string, locale: string): string => {
  const labels: Record<string, Record<string, string>> = {
    checkbox: { ko: '체크', en: 'Check' },
    select: { ko: '선택', en: 'Select' },
    number: { ko: '숫자', en: 'Number' },
    text: { ko: '텍스트', en: 'Text' },
    photo: { ko: '사진', en: 'Photo' },
    signature: { ko: '서명', en: 'Signature' },
  };
  return labels[itemType]?.[locale] || labels[itemType]?.['en'] || itemType;
};

export default function InspectionDetailPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  const { isMobileLayout } = useMobile();

  const { successMessage, errorMessage, showErrorMessage } = useMessage({ locale: currentLocale });

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

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

  const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MM/dd HH:mm');
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

  const hasResult = (itemId: string): boolean => {
    return results.some((r) => r.item_id === itemId && r.value);
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

  const filteredItems = items.filter((item) => !item.parent_id);
  const completedItems = filteredItems.filter((item) => hasResult(item.id)).length;
  const totalItems = filteredItems.length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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

  // Mobile Layout
  if (isMobileLayout) {
    return (
      <Box sx={{ pb: 10, minHeight: '100vh', bgcolor: 'grey.50' }}>
        <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap fontWeight={600}>
                {inspection.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {inspection.inspection_code}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(inspection.status, currentLocale)}
              size="small"
              color={getStatusColor(inspection.status)}
            />
            <IconButton edge="end" onClick={() => setActionSheetOpen(true)}>
              <MoreIcon />
            </IconButton>
          </Toolbar>
          {inspection.status === 'in_progress' && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedValue({ en: 'Progress', ko: '진행률' }, currentLocale)}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {completedItems}/{totalItems} ({progressPercent}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
        </AppBar>

        <Box sx={{ p: 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {getLocalizedValue({ en: 'Inspection Info', ko: '검사 정보' }, currentLocale)}
              </Typography>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AssignmentIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={inspection.template_name || inspection.template_code || '-'}
                    secondary={getLocalizedValue({ en: 'Template', ko: '템플릿' }, currentLocale)}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={inspection.inspector_name || '-'}
                    secondary={getLocalizedValue({ en: 'Inspector', ko: '검사자' }, currentLocale)}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                {inspection.location && (
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LocationIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={inspection.location}
                      secondary={getLocalizedValue({ en: 'Location', ko: '위치' }, currentLocale)}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatShortDate(inspection.inspection_date)}
                    secondary={getLocalizedValue({ en: 'Inspection Date', ko: '검사일' }, currentLocale)}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
              {inspection.description && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    {getLocalizedValue({ en: 'Description', ko: '설명' }, currentLocale)}
                  </Typography>
                  <Typography variant="body2">{inspection.description}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {getLocalizedValue({ en: 'Inspection Items', ko: '검사 항목' }, currentLocale)}
                  <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                    ({completedItems}/{totalItems})
                  </Typography>
                </Typography>
              </Box>
              <Divider />
              {filteredItems.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    {getLocalizedValue({ en: 'No inspection items', ko: '검사 항목이 없습니다' }, currentLocale)}
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {filteredItems
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((item, index) => {
                      const completed = hasResult(item.id);
                      const value = getResultValue(item.id);
                      return (
                        <ListItem
                          key={item.id}
                          divider={index < filteredItems.length - 1}
                          sx={{
                            py: 1.5,
                            bgcolor: completed ? 'success.50' : 'transparent',
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {completed ? (
                              <CheckIcon color="success" />
                            ) : (
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor: 'divider',
                                }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.item_code}
                                </Typography>
                                <Typography variant="body2">{item.item_name}</Typography>
                                {item.required && (
                                  <Typography variant="caption" color="error.main">
                                    *
                                  </Typography>
                                )}
                              </Box>
                            }
                            primaryTypographyProps={{ component: 'div' }}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                <Chip
                                  label={getItemTypeLabel(item.item_type, currentLocale)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                                {completed && (
                                  <Typography variant="caption" color="success.main" fontWeight={500}>
                                    {item.item_type === 'checkbox'
                                      ? value === 'true' || value === '1'
                                        ? 'OK'
                                        : 'NG'
                                      : value}
                                  </Typography>
                                )}
                              </Box>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                          <ChevronRightIcon color="action" />
                        </ListItem>
                      );
                    })}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {canStart && (
          <MobileFab
            icon={<StartIcon />}
            onClick={handleStartInspection}
            label={
              inspection.status === 'in_progress'
                ? getLocalizedValue({ en: 'Continue', ko: '계속' }, currentLocale)
                : getLocalizedValue({ en: 'Start', ko: '시작' }, currentLocale)
            }
            extended
            color="primary"
          />
        )}

        <MobileDetailSheet
          open={actionSheetOpen}
          onClose={() => setActionSheetOpen(false)}
          title={getLocalizedValue({ en: 'Actions', ko: '작업' }, currentLocale)}
        >
          <List disablePadding>
            <ListItem component="div" onClick={() => setActionSheetOpen(false)} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <PrintIcon />
              </ListItemIcon>
              <ListItemText primary={getLocalizedValue({ en: 'Print', ko: '인쇄' }, currentLocale)} />
            </ListItem>
            <ListItem component="div" onClick={() => setActionSheetOpen(false)} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary={getLocalizedValue({ en: 'Export', ko: '내보내기' }, currentLocale)} />
            </ListItem>
            {canEdit && (
              <ListItem component="div" onClick={() => setActionSheetOpen(false)} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary={getLocalizedValue({ en: 'Edit', ko: '수정' }, currentLocale)} />
              </ListItem>
            )}
          </List>
        </MobileDetailSheet>
      </Box>
    );
  }

  // Desktop Layout
  return (
    <StandardCrudPageLayout useMenu showBreadcrumb successMessage={successMessage} errorMessage={errorMessage}>
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

        {inspection.status === 'in_progress' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {getLocalizedValue({ en: 'Progress', ko: '진행률' }, currentLocale)}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {completedItems}/{totalItems} ({progressPercent}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Inspection Code', ko: '검사코드' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.inspection_code}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Template', ko: '템플릿' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.template_name || inspection.template_code || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Description', ko: '설명' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.description || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Inspector', ko: '검사자' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.inspector_name || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Location', ko: '위치' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.location || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Inspection Date', ko: '검사일' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{formatDate(inspection.inspection_date)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedValue({ en: 'Completed At', ko: '완료일' }, currentLocale)}
            </Typography>
            <Typography variant="body1">{inspection.completed_at ? formatDate(inspection.completed_at) : '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {getLocalizedValue({ en: 'Inspection Results', ko: '검사 결과' }, currentLocale)}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {filteredItems.length === 0 ? (
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
                {filteredItems
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
                          {getItemTypeLabel(item.item_type, currentLocale)}
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
