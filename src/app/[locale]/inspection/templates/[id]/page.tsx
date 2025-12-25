'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  ContentCopy as CloneIcon,
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ItemTreeView from './components/ItemTreeView';
import ItemFormFields from './components/ItemFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useTemplateDetail } from './hooks/useTemplateDetail';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { format } from 'date-fns';
import { TemplateStatus } from './types';

const statusOptions: { value: TemplateStatus; label: Record<string, string> }[] = [
  { value: 'draft', label: { ko: '초안', en: 'Draft' } },
  { value: 'active', label: { ko: '활성', en: 'Active' } },
  { value: 'inactive', label: { ko: '비활성', en: 'Inactive' } },
  { value: 'archived', label: { ko: '보관', en: 'Archived' } },
];

const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'draft':
      return 'warning';
    case 'archived':
      return 'error';
    default:
      return 'default';
  }
};

export default function TemplateDetailPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const {
    template,
    editingTemplate,
    setEditingTemplate,
    items,
    itemTree,
    loading,
    saveLoading,
    editMode,
    setEditMode,
    itemDialogOpen,
    setItemDialogOpen,
    editingItem,
    setEditingItem,
    deleteItemConfirmOpen,
    selectedItemForDelete,
    successMessage,
    errorMessage,
    handleSaveTemplate,
    handleCancelEdit,
    handleAddItem,
    handleEditItem,
    handleSaveItem,
    handleDeleteItemClick,
    handleDeleteItemConfirm,
    handleDeleteItemCancel,
  } = useTemplateDetail({ templateId });

  const handleBack = () => {
    router.push(`/${currentLocale}/inspection/templates`);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm');
    } catch {
      return '-';
    }
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

  if (!template) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography color="error">
            {getLocalizedValue({ en: 'Template not found', ko: '템플릿을 찾을 수 없습니다' }, currentLocale)}
          </Typography>
        </Box>
      </StandardCrudPageLayout>
    );
  }

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
    >
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6">
              {editMode
                ? getLocalizedValue({ en: 'Edit Template', ko: '템플릿 수정' }, currentLocale)
                : template.name}
            </Typography>
            {!editMode && (
              <Chip
                label={getLocalizedValue(
                  statusOptions.find((s) => s.value === template.status)?.label || { en: template.status },
                  currentLocale
                )}
                size="small"
                color={getStatusColor(template.status)}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {editMode ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  disabled={saveLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveTemplate}
                  disabled={saveLoading}
                >
                  {t('common.save')}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                {t('common.edit')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Template Details */}
        {editMode && editingTemplate ? (
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={getLocalizedValue({ en: 'Code', ko: '코드' }, currentLocale)}
                value={editingTemplate.code}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={getLocalizedValue({ en: 'Name', ko: '이름' }, currentLocale)}
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                label={getLocalizedValue({ en: 'Description', ko: '설명' }, currentLocale)}
                value={editingTemplate.description || ''}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                label={getLocalizedValue({ en: 'Category', ko: '카테고리' }, currentLocale)}
                value={editingTemplate.category || ''}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>
                  {getLocalizedValue({ en: 'Status', ko: '상태' }, currentLocale)}
                </InputLabel>
                <Select
                  value={editingTemplate.status}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, status: e.target.value as TemplateStatus })}
                  label={getLocalizedValue({ en: 'Status', ko: '상태' }, currentLocale)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {getLocalizedValue(option.label, currentLocale)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Code', ko: '코드' }, currentLocale)}
              </Typography>
              <Typography variant="body1">{template.code}</Typography>
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Category', ko: '카테고리' }, currentLocale)}
              </Typography>
              <Typography variant="body1">{template.category || '-'}</Typography>
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Description', ko: '설명' }, currentLocale)}
              </Typography>
              <Typography variant="body1">{template.description || '-'}</Typography>
            </Grid>
            <Grid item size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Version', ko: '버전' }, currentLocale)}
              </Typography>
              <Typography variant="body1">v{template.version}</Typography>
            </Grid>
            <Grid item size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Items', ko: '항목수' }, currentLocale)}
              </Typography>
              <Typography variant="body1">{items.length}</Typography>
            </Grid>
            <Grid item size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Created', ko: '작성일' }, currentLocale)}
              </Typography>
              <Typography variant="body1">{formatDate(template.created_at)}</Typography>
            </Grid>
            <Grid item size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {getLocalizedValue({ en: 'Updated', ko: '수정일' }, currentLocale)}
              </Typography>
              <Typography variant="body1">{formatDate(template.updated_at)}</Typography>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Items Section */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            {getLocalizedValue({ en: 'Checksheet Items', ko: '체크시트 항목' }, currentLocale)}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddItem()}
            size="small"
          >
            {getLocalizedValue({ en: 'Add Item', ko: '항목 추가' }, currentLocale)}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <ItemTreeView
          items={itemTree}
          locale={currentLocale}
          onEdit={handleEditItem}
          onDelete={handleDeleteItemClick}
          onAddChild={handleAddItem}
          editable={true}
        />
      </Paper>

      {/* Item Edit Drawer */}
      <EditDrawer
        open={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false);
          setEditingItem(null);
        }}
        title={
          !editingItem?.id
            ? getLocalizedValue({ en: 'Add Item', ko: '항목 추가' }, currentLocale)
            : getLocalizedValue({ en: 'Edit Item', ko: '항목 수정' }, currentLocale)
        }
        onSave={handleSaveItem}
        saveLoading={saveLoading}
        saveDisabled={!editingItem?.item_code || !editingItem?.item_name}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 500, md: 600 }}
      >
        {editingItem && (
          <ItemFormFields
            item={editingItem}
            onChange={(item) => setEditingItem(item)}
            locale={currentLocale}
            parentItems={items.filter((i) => i.id !== editingItem.id)}
          />
        )}
      </EditDrawer>

      {/* Delete Item Confirmation */}
      <DeleteConfirmDialog
        open={deleteItemConfirmOpen}
        itemCount={1}
        itemName={getLocalizedValue({ en: 'Item', ko: '항목' }, currentLocale)}
        itemsList={
          selectedItemForDelete
            ? [
                {
                  id: selectedItemForDelete,
                  displayName:
                    items.find((i) => i.id === selectedItemForDelete)?.item_name ||
                    selectedItemForDelete,
                },
              ]
            : []
        }
        onCancel={handleDeleteItemCancel}
        onConfirm={handleDeleteItemConfirm}
        loading={saveLoading}
      />
    </StandardCrudPageLayout>
  );
}
