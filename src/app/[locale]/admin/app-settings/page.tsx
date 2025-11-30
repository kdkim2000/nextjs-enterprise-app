'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Settings
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import EditDrawer from '@/components/common/EditDrawer';
import FilterTabs, { FilterTab } from '@/components/common/FilterTabs';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import CategoryNavPanel, { CategoryStats } from '@/components/common/CategoryNavPanel';
import InlineEditRow, { ToggleConfig } from '@/components/common/InlineEditRow';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useAppSettingsManagement } from './hooks/useAppSettingsManagement';
import { AppSetting } from './types';
import { CATEGORIES, getLocalizedText, getCategoryItems, CATEGORY_COLORS, CategoryType } from './constants';
import SettingFormFields, { SettingFormData } from './components/SettingFormFields';

export default function AppSettingsPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const theme = useTheme();

  const {
    // State
    groupedSettings,
    selectedCategory,
    setSelectedCategory,
    loading,
    saveLoading,
    searchQuery,
    setSearchQuery,
    readyFilter,
    setReadyFilter,
    appliedFilter,
    setAppliedFilter,
    // Messages
    successMessage,
    errorMessage,
    // Actions
    updateSetting,
    toggleReadyStatus,
    toggleAppliedStatus,
    createSetting,
    deleteSetting,
    getFilteredSettings,
    handleRefresh
  } = useAppSettingsManagement();

  // Local drawer states (for create only)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SettingFormData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<AppSetting | null>(null);

  // Filtered settings (with status filter)
  const filteredSettings = useMemo(() => {
    return getFilteredSettings(selectedCategory, readyFilter);
  }, [getFilteredSettings, selectedCategory, readyFilter]);

  // Stats
  const totalSettings = Object.values(groupedSettings).flat().length;
  const readySettings = Object.values(groupedSettings)
    .flat()
    .filter((s: any) => s.isReady).length;
  const appliedSettings = Object.values(groupedSettings)
    .flat()
    .filter((s: any) => s.isApplied).length;

  // Count for ready but not applied
  const readyNotAppliedSettings = Object.values(groupedSettings)
    .flat()
    .filter((s: any) => s.isReady && !s.isApplied).length;

  // Filter tabs for status (combined ready/applied)
  const filterTabs: FilterTab<string>[] = useMemo(() => [
    {
      value: '',
      label: getLocalizedText({ en: 'All', ko: '전체', zh: '全部', vi: 'Tất cả' }, locale),
      count: totalSettings
    },
    {
      value: 'applied',
      label: getLocalizedText({ en: 'Applied', ko: '적용됨', zh: '已应用', vi: 'Đã áp dụng' }, locale),
      count: appliedSettings,
      color: 'success'
    },
    {
      value: 'ready',
      label: getLocalizedText({ en: 'Ready', ko: '준비됨', zh: '已就绪', vi: 'Sẵn sàng' }, locale),
      count: readyNotAppliedSettings,
      color: 'info'
    },
    {
      value: 'not_ready',
      label: getLocalizedText({ en: 'Not Ready', ko: '미준비', zh: '未就绪', vi: 'Chưa sẵn sàng' }, locale),
      count: totalSettings - readySettings
    }
  ], [locale, totalSettings, readySettings, appliedSettings, readyNotAppliedSettings]);

  // Inline save handler
  const handleInlineSave = useCallback(async (key: string, value: string) => {
    return await updateSetting(key, { value });
  }, [updateSetting]);

  // Add new setting
  const handleAdd = useCallback(() => {
    setEditingSetting({
      key: '',
      value: '',
      valueType: 'string',
      category: selectedCategory || 'basic',
      isReady: false,
      isSensitive: false,
      descriptionEn: '',
      descriptionKo: '',
      descriptionZh: '',
      descriptionVi: '',
      displayOrder: 0
    });
    setDrawerOpen(true);
  }, [selectedCategory]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditingSetting(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingSetting) return;

    const payload = {
      key: editingSetting.key,
      value: editingSetting.value,
      valueType: editingSetting.valueType,
      category: editingSetting.category,
      isReady: editingSetting.isReady,
      isSensitive: editingSetting.isSensitive,
      displayOrder: editingSetting.displayOrder,
      description: {
        en: editingSetting.descriptionEn,
        ko: editingSetting.descriptionKo,
        zh: editingSetting.descriptionZh,
        vi: editingSetting.descriptionVi
      }
    };

    const result = await createSetting(payload);
    if (result) {
      handleDrawerClose();
    }
  }, [editingSetting, createSetting, handleDrawerClose]);

  const handleDeleteClick = useCallback((setting: AppSetting) => {
    setSettingToDelete(setting);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (settingToDelete) {
      await deleteSetting(settingToDelete.key);
      setDeleteDialogOpen(false);
      setSettingToDelete(null);
    }
  }, [settingToDelete, deleteSetting]);

  // Category items for CategoryNavPanel
  const categoryItems = useMemo(() => getCategoryItems(locale), [locale]);

  // Category stats getter for CategoryNavPanel
  const getCategoryStats = useCallback((categoryId: string): CategoryStats => {
    const settings = groupedSettings[categoryId] || [];
    return {
      total: settings.length,
      primary: settings.filter((s: any) => s.isReady).length,
      secondary: settings.filter((s: any) => s.isApplied).length
    };
  }, [groupedSettings]);

  // Total stats for "All" item
  const totalCategoryStats: CategoryStats = useMemo(() => ({
    total: totalSettings,
    primary: readySettings,
    secondary: appliedSettings
  }), [totalSettings, readySettings, appliedSettings]);

  // Format stats for display
  const formatCategoryStats = useCallback((stats: CategoryStats) => {
    return `${stats.secondary}/${stats.primary}/${stats.total}`;
  }, []);

  const formatTotalCategoryStats = useCallback((stats: CategoryStats) => {
    return locale === 'ko'
      ? `총 ${stats.total.toLocaleString()} (준비: ${stats.primary?.toLocaleString()}, 적용: ${stats.secondary?.toLocaleString()})`
      : `Total ${stats.total.toLocaleString()} (Ready: ${stats.primary?.toLocaleString()}, Applied: ${stats.secondary?.toLocaleString()})`;
  }, [locale]);

  // Master Panel - Category Navigation
  const masterPanel = (
    <CategoryNavPanel
      title={getLocalizedText({ en: 'Categories', ko: '카테고리', zh: '分类', vi: 'Danh mục' }, locale)}
      categories={categoryItems}
      selectedCategory={selectedCategory}
      onSelectCategory={(categoryId) => setSelectedCategory(categoryId as '' | typeof selectedCategory)}
      getCategoryStats={getCategoryStats}
      totalStats={totalCategoryStats}
      allItem={{
        label: getLocalizedText({ en: 'All Settings', ko: '전체 설정', zh: '全部设置', vi: 'Tất cả' }, locale),
        icon: Settings
      }}
      formatStats={formatCategoryStats}
      formatTotalStats={formatTotalCategoryStats}
      showAllItem={true}
      showStatsHeader={true}
    />
  );

  // Detail Panel - Inline Settings List
  const detailPanel = (
    <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header with Title */}
      <Box sx={{ mb: 1 }}>
        {selectedCategory ? (
          <Box>
            <Typography variant="h6">
              {getLocalizedText(CATEGORIES.find(c => c.id === selectedCategory)?.label || { en: '', ko: '', zh: '', vi: '' }, locale)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getLocalizedText(CATEGORIES.find(c => c.id === selectedCategory)?.description || { en: '', ko: '', zh: '', vi: '' }, locale)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="h6">
            {getLocalizedText({ en: 'All Settings', ko: '전체 설정', zh: '全部设置', vi: 'Tất cả cài đặt' }, locale)}
          </Typography>
        )}
      </Box>

      {/* Quick Search Bar */}
      <QuickSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={() => {}}
        onClear={() => setSearchQuery('')}
        placeholder={getLocalizedText({
          en: 'Search settings by key or description...',
          ko: '키 또는 설명으로 설정 검색...',
          zh: '按键或描述搜索设置...',
          vi: 'Tìm kiếm theo khóa hoặc mô tả...'
        }, locale)}
        searching={loading}
        showAdvancedButton={false}
      />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          value={readyFilter}
          onChange={setReadyFilter}
          size="small"
          activeColor={theme.palette.primary.main}
        />

        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Tooltip title={getLocalizedText({ en: 'Refresh', ko: '새로고침', zh: '刷新', vi: 'Làm mới' }, locale)}>
          <IconButton onClick={handleRefresh} disabled={loading} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAdd}>
          {getLocalizedText({ en: 'Add', ko: '추가', zh: '添加', vi: 'Thêm' }, locale)}
        </Button>
      </Box>

      {/* Column Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          borderLeft: '3px solid transparent'
        }}
      >
        <Typography variant="caption" fontWeight={600} sx={{ width: 280, flexShrink: 0, color: 'text.secondary' }}>
          {getLocalizedText({ en: 'Key / Description', ko: '키 / 설명', zh: '键 / 描述', vi: 'Khóa / Mô tả' }, locale)}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 70, flexShrink: 0, color: 'text.secondary' }}>
          {getLocalizedText({ en: 'Type', ko: '타입', zh: '类型', vi: 'Loại' }, locale)}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ flex: 1, minWidth: 200, color: 'text.secondary' }}>
          {getLocalizedText({ en: 'Value', ko: '값', zh: '值', vi: 'Giá trị' }, locale)}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 50, flexShrink: 0, color: 'info.main', textAlign: 'center' }}>
          {getLocalizedText({ en: 'Ready', ko: '준비', zh: '就绪', vi: 'Sẵn' }, locale)}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 50, flexShrink: 0, color: 'success.main', textAlign: 'center' }}>
          {getLocalizedText({ en: 'Apply', ko: '적용', zh: '应用', vi: 'Áp dụng' }, locale)}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ width: 60, flexShrink: 0, color: 'text.secondary', textAlign: 'center' }}>
          {getLocalizedText({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale)}
        </Typography>
      </Box>

      {/* Settings List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : filteredSettings.length === 0 ? (
          <EmptyState
            icon={Settings}
            title={getLocalizedText({ en: 'No settings found', ko: '설정을 찾을 수 없습니다', zh: '未找到设置', vi: 'Không có cài đặt' }, locale)}
            description={getLocalizedText({
              en: 'Try adjusting your filters or add a new setting',
              ko: '필터를 조정하거나 새 설정을 추가해 보세요',
              zh: '尝试调整过滤条件或添加新设置',
              vi: 'Hãy điều chỉnh bộ lọc hoặc thêm cài đặt mới'
            }, locale)}
          />
        ) : (
          <Fade in>
            <Box>
              {filteredSettings.map((setting) => {
                // Create toggle configs for Ready and Applied switches
                const toggleConfigs: ToggleConfig[] = [
                  {
                    value: setting.isReady,
                    onChange: (value) => toggleReadyStatus(setting.key, value),
                    enabledTooltip: getLocalizedText({ en: 'Ready', ko: '준비됨', zh: '已就绪', vi: 'Sẵn sàng' }, locale),
                    disabledTooltip: getLocalizedText({ en: 'Not Ready', ko: '미준비', zh: '未就绪', vi: 'Chưa sẵn sàng' }, locale),
                    color: theme.palette.info.main
                  },
                  {
                    value: setting.isApplied,
                    onChange: (value) => toggleAppliedStatus(setting.key, value),
                    enabledTooltip: getLocalizedText({ en: 'Applied', ko: '적용됨', zh: '已应用', vi: 'Đã áp dụng' }, locale),
                    disabledTooltip: !setting.isReady
                      ? getLocalizedText({ en: 'Must be ready first', ko: '먼저 준비 상태로 변경 필요', zh: '需要先设为就绪', vi: 'Cần sẵn sàng trước' }, locale)
                      : getLocalizedText({ en: 'Not Applied', ko: '미적용', zh: '未应用', vi: 'Chưa áp dụng' }, locale),
                    disabled: !setting.isReady,
                    color: theme.palette.success.main
                  }
                ];

                // Get border color based on status
                const borderColor = setting.isApplied
                  ? theme.palette.success.main
                  : setting.isReady
                    ? theme.palette.info.main
                    : theme.palette.grey[400];

                return (
                  <InlineEditRow
                    key={setting.key}
                    id={setting.key}
                    label={setting.key}
                    description={getLocalizedText(setting.description, locale)}
                    value={setting.value || ''}
                    valueType={setting.valueType as any}
                    isSensitive={setting.isSensitive}
                    onSave={handleInlineSave}
                    onDelete={() => handleDeleteClick(setting)}
                    toggles={toggleConfigs}
                    saving={saveLoading}
                    borderColor={borderColor}
                    copyTooltip={getLocalizedText({ en: 'Copy key', ko: '키 복사', zh: '复制键', vi: 'Sao chép' }, locale)}
                    saveTooltip={getLocalizedText({ en: 'Save', ko: '저장', zh: '保存', vi: 'Lưu' }, locale)}
                    revertTooltip={getLocalizedText({ en: 'Revert', ko: '취소', zh: '撤销', vi: 'Hủy' }, locale)}
                    deleteTooltip={getLocalizedText({ en: 'Delete', ko: '삭제', zh: '删除', vi: 'Xóa' }, locale)}
                  />
                );
              })}
            </Box>
          </Fade>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          pt: 1,
          mt: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {filteredSettings.length} {getLocalizedText({ en: 'settings', ko: '개 설정', zh: '个设置', vi: 'cài đặt' }, locale)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getLocalizedText({
            en: 'Edit inline • Enter to save • Esc to cancel',
            ko: '인라인 편집 • Enter로 저장 • Esc로 취소',
            zh: '内联编辑 • Enter保存 • Esc取消',
            vi: 'Chỉnh sửa trực tiếp • Enter để lưu • Esc để hủy'
          }, locale)}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      showQuickSearch={false}
      showAdvancedFilter={false}
    >
      {/* Master-Detail Layout */}
      <MasterDetailLayout
        masterSize={25}
        detailSize={75}
        master={masterPanel}
        detail={detailPanel}
      />

      {/* Add Setting Drawer */}
      <EditDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        title={getLocalizedText({ en: 'Add Setting', ko: '설정 추가', zh: '添加设置', vi: 'Thêm cài đặt' }, locale)}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 550, md: 650 }}
      >
        <SettingFormFields
          setting={editingSetting}
          onChange={setEditingSetting}
          locale={locale}
          mode="create"
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemCount={1}
        itemName="Setting"
        itemsList={settingToDelete ? [{ id: settingToDelete.key, displayName: settingToDelete.key }] : []}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSettingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={saveLoading}
      />
    </StandardCrudPageLayout>
  );
}
