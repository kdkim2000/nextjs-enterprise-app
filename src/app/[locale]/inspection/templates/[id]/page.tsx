'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Divider,
  Grid,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import { MinimalBadge } from '@/components/common/MinimalListItem';
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

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'active': return 'success';
    case 'draft': return 'warning';
    case 'archived': return 'error';
    default: return 'default';
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
      return format(new Date(dateStr), 'yyyy.MM.dd');
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={28} />
        </Box>
      </StandardCrudPageLayout>
    );
  }

  if (!template) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {getLocalizedValue({ en: 'Template not found', ko: '템플릿을 찾을 수 없습니다' }, currentLocale)}
          </Typography>
          <Button onClick={handleBack} startIcon={<BackIcon />} size="small">
            {getLocalizedValue({ en: 'Go back', ko: '돌아가기' }, currentLocale)}
          </Button>
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} size="small" sx={{ mr: 0.5 }}>
          <BackIcon fontSize="small" />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {editMode
              ? getLocalizedValue({ en: 'Edit Template', ko: '템플릿 수정' }, currentLocale)
              : template.name}
          </Typography>
          {!editMode && (
            <Typography variant="caption" color="text.secondary">
              {template.code}
            </Typography>
          )}
        </Box>

        {!editMode && (
          <MinimalBadge
            label={getLocalizedValue(
              statusOptions.find((s) => s.value === template.status)?.label || { en: template.status },
              currentLocale
            )}
            color={getStatusColor(template.status)}
          />
        )}

        {editMode ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={handleCancelEdit}
              disabled={saveLoading}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSaveTemplate}
              disabled={saveLoading}
              disableElevation
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              {t('common.save')}
            </Button>
          </Box>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => setEditMode(true)}
            sx={{ minWidth: 'auto', px: 1.5 }}
          >
            {t('common.edit')}
          </Button>
        )}
      </Box>

      {/* Template Details */}
      <Box sx={{ p: 2 }}>
        {editMode && editingTemplate ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={getLocalizedValue({ en: 'Code', ko: '코드' }, currentLocale)}
              value={editingTemplate.code}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
              fullWidth
              size="small"
              required
            />
            <TextField
              label={getLocalizedValue({ en: 'Name', ko: '이름' }, currentLocale)}
              value={editingTemplate.name}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              fullWidth
              size="small"
              required
            />
            <TextField
              label={getLocalizedValue({ en: 'Description', ko: '설명' }, currentLocale)}
              value={editingTemplate.description || ''}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={getLocalizedValue({ en: 'Category', ko: '카테고리' }, currentLocale)}
                value={editingTemplate.category || ''}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                fullWidth
                size="small"
              />
              <FormControl fullWidth size="small">
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
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 100 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem' }}>
                {getLocalizedValue({ en: 'Category', ko: '카테고리' }, currentLocale)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {template.category || '-'}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 60 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem' }}>
                {getLocalizedValue({ en: 'Version', ko: '버전' }, currentLocale)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                v{template.version}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 60 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem' }}>
                {getLocalizedValue({ en: 'Items', ko: '항목' }, currentLocale)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {items.length}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 80 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem' }}>
                {getLocalizedValue({ en: 'Updated', ko: '수정일' }, currentLocale)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(template.updated_at)}
              </Typography>
            </Box>
          </Box>
        )}

        {!editMode && template.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: alpha('#000', 0.06),
              fontSize: '0.8125rem',
            }}
          >
            {template.description}
          </Typography>
        )}
      </Box>

      {/* Items Section */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {getLocalizedValue({ en: 'Checksheet Items', ko: '체크시트 항목' }, currentLocale)}
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleAddItem()}
            sx={{ minWidth: 'auto', px: 1.5 }}
          >
            {getLocalizedValue({ en: 'Add', ko: '추가' }, currentLocale)}
          </Button>
        </Box>

        <Box sx={{ mt: 1 }}>
          <ItemTreeView
            items={itemTree}
            locale={currentLocale}
            onEdit={handleEditItem}
            onDelete={handleDeleteItemClick}
            onAddChild={handleAddItem}
            editable={true}
          />
        </Box>
      </Box>

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
