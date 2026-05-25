'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataShell from '@/components/common/DataShell';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import DepartmentFormFields, { DepartmentFormData } from '@/components/admin/DepartmentFormFields';
import DepartmentTreeView from './components/DepartmentTreeView';
import DepartmentMobileTreeView from './components/DepartmentMobileTreeView';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useDepartmentManagement } from './hooks/useDepartmentManagement';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Department } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export default function DepartmentsPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  // Permission control - use programId from DB
  const gridPermissions = useDataGridPermissions(programId || '');

  // Use common help hook
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
    departments,
    setDepartments,
    allUsers,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    searching,
    saveLoading,
    dialogOpen,
    editingDepartment,
    setEditingDepartment,
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
    setDialogOpen,
    fetchUsers
  } = useDepartmentManagement();

  // Tree state for desktop view
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch users on mount for manager dropdown
  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tree state handlers
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Collect all IDs for expand/select all
  const getAllIds = useCallback((): string[] => {
    return departments.map((d) => d.id);
  }, [departments]);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(getAllIds()));
  }, [getAllIds]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(getAllIds()));
  }, [getAllIds]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Handle add with parent ID
  const handleAddWithParent = useCallback((parentId?: string | null) => {
    // Calculate level based on parent
    let level = 1;
    if (parentId) {
      const parent = departments.find((d) => d.id === parentId);
      if (parent) {
        level = parent.level + 1;
      }
    }

    setEditingDepartment({
      id: '',
      code: '',
      nameEn: '',
      nameKo: '',
      nameZh: '',
      nameVi: '',
      descriptionEn: '',
      descriptionKo: '',
      descriptionZh: '',
      descriptionVi: '',
      parentId: parentId || '',
      managerId: '',
      status: 'active',
      order: 1
    } as any);
    setDialogOpen(true);
  }, [departments, setEditingDepartment, setDialogOpen]);

  // Handle edit for tree view (receives id)
  const handleTreeEdit = useCallback((id: string) => {
    handleEdit(id);
  }, [handleEdit]);

  // Handle edit for mobile view (receives department object)
  const handleMobileEdit = useCallback((department: Department) => {
    handleEdit(department.id);
  }, [handleEdit]);

  // Handle delete for mobile view (receives department object)
  const handleMobileDelete = useCallback((department: Department) => {
    handleDeleteClick([department.id]);
  }, [handleDeleteClick]);

  // Handle delete for tree view (receives ids array)
  const handleTreeDelete = useCallback((ids: string[]) => {
    handleDeleteClick(ids);
  }, [handleDeleteClick]);

  // Memoized computed values
  const filterFields = useMemo(
    () => createFilterFields(t, departments, allUsers, currentLocale),
    [t, departments, allUsers, currentLocale]
  );

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const department = departments.find((d) => d.id === id);
        return department
          ? {
              id: department.id,
              displayName: `${department.code} (${currentLocale === 'ko' ? department.name?.ko : department.name?.en})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, departments, currentLocale]
  );

  return (
    <>
      <Box sx={{ px: 4, py: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PageHeader
          breadcrumb={['Admin', '부서 관리']}
          title="부서 관리"
        />
        <DataShell>
          {isMobileLayout ? (
            <DepartmentMobileTreeView
              departments={departments}
              allUsers={allUsers}
              locale={currentLocale}
              loading={searching}
              onEdit={gridPermissions.editable ? handleMobileEdit : undefined}
              onDelete={gridPermissions.showDeleteButton ? handleMobileDelete : undefined}
              onAdd={gridPermissions.showAddButton ? handleAddWithParent : undefined}
              onRefresh={handleRefresh}
              canEdit={gridPermissions.editable}
              canDelete={gridPermissions.showDeleteButton}
              canAdd={gridPermissions.showAddButton}
            />
          ) : (
            <DepartmentTreeView
              departments={departments}
              allUsers={allUsers}
              expandedIds={expandedIds}
              selectedIds={selectedIds}
              locale={currentLocale}
              loading={searching}
              searchQuery={quickSearch}
              onToggleExpand={handleToggleExpand}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onEdit={handleTreeEdit}
              onAdd={handleAddWithParent}
              onDelete={handleTreeDelete}
              onRefresh={handleRefresh}
              canEdit={gridPermissions.editable}
              canDelete={gridPermissions.showDeleteButton}
              canAdd={gridPermissions.showAddButton}
            />
          )}
        </DataShell>
      </Box>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingDepartment(null);
        }}
        title={!editingDepartment?.id ? t('common.create') + ' Department' : t('common.edit') + ' Department'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <DepartmentFormFields
          department={editingDepartment as DepartmentFormData}
          onChange={(dept) => setEditingDepartment(dept as DepartmentFormData)}
          departments={departments}
          locale={currentLocale}
          labels={{
            code: t('fields.code'),
            nameEn: t('fields.nameEn'),
            nameKo: t('fields.nameKo'),
            descriptionEn: t('fields.descriptionEn'),
            descriptionKo: t('fields.descriptionKo'),
            parentDepartment: t('fields.parentDepartment'),
            manager: t('fields.manager'),
            status: t('fields.status'),
            order: t('fields.order'),
            none: t('fields.none')
          }}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="Department"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </>
  );
}
