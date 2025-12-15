'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import RouteGuard from '@/components/auth/RouteGuard';
import RoleMobileCard from './components/RoleMobileCard';
import RoleFormFields from './components/RoleFormFields';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { useRoleManagement } from './hooks/useRoleManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Role } from '@/types/role';

export default function RoleManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  const gridPermissions = useDataGridPermissions(programId || '');

  // Use help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: programId || '' });

  // Use custom hook for all business logic
  const {
    // State
    roles,
    setRoles,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    searching,
    saveLoading,
    dialogOpen,
    editingRole,
    setEditingRole,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    setDialogOpen
  } = useRoleManagement();

  // Memoized computed values
  const columns = useMemo(
    () => createColumns(locale, handleEdit, gridPermissions.editable),
    [locale, handleEdit, gridPermissions.editable]
  );

  const filterFields = useMemo(
    () => createFilterFields(locale),
    [locale]
  );

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const role = roles.find((r) => r.id === id);
        return role
          ? {
              id: role.id,
              displayName: `${role.name} (${role.displayName})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, roles]
  );

  // Localized placeholder
  const quickSearchPlaceholder = getLocalizedValue({
    en: 'Search by ID, name, display name, or description...',
    ko: 'ID, 이름, 표시명 또는 설명으로 검색...',
    zh: '按ID、名称、显示名称或描述搜索...',
    vi: 'Tìm theo ID, tên, tên hiển thị hoặc mô tả...'
  }, locale);

  // Mobile handlers
  const handleMobileEdit = useCallback((role: Role) => {
    handleEdit(role.id);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((role: Role) => {
    handleDeleteClick([role.id]);
  }, [handleDeleteClick]);

  // Mobile card renderer
  const renderMobileCard = useCallback((role: Role) => (
    <RoleMobileCard
      role={role}
      locale={locale}
      onEdit={gridPermissions.editable ? handleMobileEdit : undefined}
      onDelete={gridPermissions.showDeleteButton && !role.isSystem ? handleMobileDelete : undefined}
      canEdit={gridPermissions.editable}
      canDelete={gridPermissions.showDeleteButton && !role.isSystem}
    />
  ), [locale, gridPermissions, handleMobileEdit, handleMobileDelete]);

  // Mobile FAB config
  const mobileFab = gridPermissions.showAddButton ? {
    onClick: handleAdd,
    label: getLocalizedValue({ en: 'Add', ko: '추가', zh: '添加', vi: 'Thêm' }, locale),
  } : undefined;

  return (
    <RouteGuard programCode={programId || ''} requiredPermission="view" fallbackUrl="/dashboard">
      <ResponsivePageLayout
        // Page Header
        useMenu
        showBreadcrumb
        // Messages
        successMessage={successMessage}
        errorMessage={errorMessage}
        // Quick Search
        quickSearch={quickSearch}
        onQuickSearchChange={setQuickSearch}
        onQuickSearch={handleQuickSearch}
        onQuickSearchClear={handleQuickSearchClear}
        quickSearchPlaceholder={quickSearchPlaceholder}
        searching={searching}
        // Advanced Filter
        showAdvancedFilter
        advancedFilterOpen={advancedFilterOpen}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        activeFilterCount={activeFilterCount}
        filterTitle={`${t('common.search')} / ${t('common.filter')}`}
        filterContent={
          <SearchFilterFields
            fields={filterFields}
            values={searchCriteria}
            onChange={handleSearchChange}
            onEnter={handleAdvancedFilterApply}
            locale={locale}
          />
        }
        onFilterApply={handleAdvancedFilterApply}
        onFilterClear={handleQuickSearchClear}
        onFilterClose={handleAdvancedFilterClose}
        // Help
        programId={programId || ''}
        helpOpen={helpOpen}
        onHelpOpenChange={setHelpOpen}
        isAdmin={isAdmin}
        helpExists={helpExists}
        canManageHelp={canManageHelp}
        onHelpEdit={navigateToHelpEdit}
        language={language}
        // Mobile FAB
        mobileFab={mobileFab}
      >
        {isMobileLayout ? (
          // Mobile: Card List
          <MobileCardList
            data={roles}
            loading={searching}
            renderCard={renderMobileCard}
            keyExtractor={(role) => role.id}
            emptyMessage={getLocalizedValue({
              en: 'No roles found',
              ko: '역할이 없습니다',
              zh: '没有找到角色',
              vi: 'Không tìm thấy vai trò'
            }, locale)}
          />
        ) : (
          // Desktop: DataGrid
          <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ExcelDataGrid
                rows={roles}
                columns={columns}
                onRowsChange={(rows) => setRoles(rows as Role[])}
                {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
                {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
                onRefresh={handleRefresh}
                checkboxSelection={gridPermissions.checkboxSelection}
                editable={gridPermissions.editable}
                exportFileName="roles"
                loading={searching}
              />
            </Box>
          </Paper>
        )}

        {/* Edit Drawer */}
        <EditDrawer
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditingRole(null);
          }}
          title={!editingRole?.id
            ? getLocalizedValue({ en: 'Add New Role', ko: '역할 추가', zh: '添加角色', vi: 'Thêm vai trò' }, locale)
            : getLocalizedValue({ en: 'Edit Role', ko: '역할 수정', zh: '编辑角色', vi: 'Sửa vai trò' }, locale)
          }
          onSave={() => editingRole && handleSave(editingRole)}
          saveLoading={saveLoading}
          saveDisabled={!editingRole?.name || !editingRole?.displayName}
          saveLabel={t('common.save')}
          cancelLabel={t('common.cancel')}
          width={{ xs: '100%', sm: 600, md: 700 }}
        >
          <RoleFormFields
            role={editingRole}
            onChange={setEditingRole}
            locale={locale}
          />
        </EditDrawer>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteConfirmOpen}
          itemCount={selectedForDelete.length}
          itemName={getLocalizedValue({ en: 'role', ko: '역할', zh: '角色', vi: 'vai trò' }, locale)}
          itemsList={deleteItemsList}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      </ResponsivePageLayout>
    </RouteGuard>
  );
}
