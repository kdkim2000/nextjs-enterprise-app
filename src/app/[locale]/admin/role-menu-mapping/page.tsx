'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import EditDrawer from '@/components/common/EditDrawer';
import MobileCardList from '@/components/mobile/MobileCardList';
import MobileMasterDetail, { useMobileMasterDetail } from '@/components/mobile/MobileMasterDetail';
import ProgramList from './components/ProgramList';
import ProgramMobileCard from './components/ProgramMobileCard';
import RoleMappingMobileCard from './components/RoleMappingMobileCard';
import RoleSearchDialog from './components/RoleSearchDialog';
import PermissionEditForm from './components/PermissionEditForm';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { adminApi } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { useHelp } from '@/hooks/useHelp';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount, applyMappingFilters } from './utils';
import { Role, Program, RoleProgramMapping, SearchCriteria, PermissionFormData } from './types';

export default function RoleMenuMappingPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale: currentLocale });

  const { programId } = useProgramId();
  const gridPermissions = useDataGridPermissions(programId || '');

  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: programId || '' });

  const {
    view: mobileView,
    setView: setMobileView,
    selectMaster: selectMobileProgram,
    goBack: handleMobileBack,
  } = useMobileMasterDetail<Program>('master');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [mappings, setMappings] = useState<RoleProgramMapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<RoleProgramMapping[]>([]);
  const [allMappings, setAllMappings] = useState<RoleProgramMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    roleName: '',
    roleDisplayName: '',
    permissions: ''
  });
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [addRolesDialogOpen, setAddRolesDialogOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionFormData | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [mappingDeleteConfirmOpen, setMappingDeleteConfirmOpen] = useState(false);
  const [selectedMappingsForDelete, setSelectedMappingsForDelete] = useState<(string | number)[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [programsResponse, mappingsResponse] = await Promise.all([
        adminApi.get('/programs/all'),
        adminApi.get('/role-program-mappings', { params: { includeDetails: 'true' } })
      ]);
      setPrograms(programsResponse.programs || []);
      setAllMappings(mappingsResponse.mappings || []);
    } catch (error) {
      console.error('[role-menu-mapping] Failed to fetch data:', error);
      await showErrorMessage('MAPPING_DATA_LOAD_FAIL');
    }
  }, [showErrorMessage]);

  const fetchMappings = useCallback(async () => {
    if (!selectedProgram) {
      setMappings([]);
      setFilteredMappings([]);
      return;
    }
    try {
      setLoading(true);
      const response = await adminApi.get('/role-program-mappings', {
        params: { programId: selectedProgram.id, includeDetails: 'true' }
      });
      const programMappings = response.mappings || [];
      setMappings(programMappings);
      setFilteredMappings(programMappings);
    } catch (error) {
      console.error('[role-menu-mapping] Failed to fetch mappings:', error);
      await showErrorMessage('MAPPING_ROLE_LOAD_FAIL');
      setMappings([]);
      setFilteredMappings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProgram, showErrorMessage]);

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!isMobileLayout && programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0]);
    }
  }, [programs, selectedProgram, isMobileLayout]);
  useEffect(() => { void fetchMappings(); }, [fetchMappings]);
  useEffect(() => {
    const filtered = applyMappingFilters(mappings, quickSearch, searchCriteria);
    setFilteredMappings(filtered);
  }, [mappings, quickSearch, searchCriteria]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    programs.forEach((program) => {
      const programMappings = allMappings.filter(m => m.programId === program.id);
      const uniqueRoles = new Set(programMappings.map(m => m.roleId));
      counts[program.id] = uniqueRoles.size;
    });
    return counts;
  }, [programs, allMappings]);

  const handleMobileProgramClick = useCallback((program: Program) => {
    setSelectedProgram(program);
    selectMobileProgram(program);
  }, [selectMobileProgram]);

  const handleMobileBackClick = useCallback(() => {
    handleMobileBack();
    setMobileSelectionMode(false);
    setMobileSelectedIds(new Set());
  }, [handleMobileBack]);

  const handleAddMapping = useCallback(() => {
    if (!selectedProgram) {
      void showErrorMessage('MAPPING_SELECT_PROGRAM_REQUIRED');
      return;
    }
    setAddRolesDialogOpen(true);
  }, [selectedProgram, showErrorMessage]);

  const handleAddRolesSuccess = useCallback(async (
    roles: Role[],
    permissions: { canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean }
  ) => {
    try {
      if (!selectedProgram) return;
      for (const role of roles) {
        await adminApi.post('/role-program-mappings', {
          roleId: role.id,
          programId: selectedProgram.id,
          ...permissions
        });
      }
      const count = roles.length;
      await showSuccessMessage('MAPPING_ROLE_ASSIGN_SUCCESS', { count });
      void fetchData();
      void fetchMappings();
    } catch (error) {
      await showErrorMessage('MAPPING_ROLE_ASSIGN_FAIL');
    }
  }, [selectedProgram, fetchData, fetchMappings, showSuccessMessage, showErrorMessage]);

  const handleEditPermission = useCallback((id: string | number) => {
    const mapping = mappings.find((m) => m.id === id);
    if (mapping) {
      setEditingPermission({
        id: mapping.id,
        roleId: mapping.roleId,
        roleName: mapping.roleName || '',
        roleDisplayName: mapping.roleDisplayName || '',
        programId: mapping.programId,
        programCode: mapping.programCode || '',
        programName: mapping.programName || { en: '', ko: '' },
        canView: mapping.canView,
        canCreate: mapping.canCreate,
        canUpdate: mapping.canUpdate,
        canDelete: mapping.canDelete
      });
      setEditDrawerOpen(true);
    }
  }, [mappings]);

  const handleMobileEditMapping = useCallback((mapping: RoleProgramMapping) => {
    handleEditPermission(mapping.id);
  }, [handleEditPermission]);

  const handleMobileDeleteMapping = useCallback((mapping: RoleProgramMapping) => {
    setSelectedMappingsForDelete([mapping.id]);
    setMappingDeleteConfirmOpen(true);
  }, []);

  const handleSavePermission = useCallback(async () => {
    if (!editingPermission) return;
    try {
      setSaveLoading(true);
      await adminApi.put(`/role-program-mappings/${editingPermission.id}`, {
        canView: editingPermission.canView,
        canCreate: editingPermission.canCreate,
        canUpdate: editingPermission.canUpdate,
        canDelete: editingPermission.canDelete
      });
      await showSuccessMessage('MAPPING_PERMISSION_UPDATE_SUCCESS');
      setEditDrawerOpen(false);
      setEditingPermission(null);
      await fetchData();
      await fetchMappings();
    } catch (error) {
      await showErrorMessage('MAPPING_PERMISSION_UPDATE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingPermission, fetchData, fetchMappings, showSuccessMessage, showErrorMessage]);

  const handleDeleteMappings = useCallback((ids: (string | number)[]) => {
    setSelectedMappingsForDelete(ids);
    setMappingDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeleteMappings = useCallback(async () => {
    try {
      setDeleting(true);
      for (const id of selectedMappingsForDelete) {
        await adminApi.delete(`/role-program-mappings/${id}`);
      }
      const count = selectedMappingsForDelete.length;
      await showSuccessMessage('MAPPING_DELETE_SUCCESS', { count });
      setMappingDeleteConfirmOpen(false);
      setSelectedMappingsForDelete([]);
      setMobileSelectedIds(new Set());
      setMobileSelectionMode(false);
      await fetchData();
      await fetchMappings();
    } catch (error) {
      await showErrorMessage('MAPPING_DELETE_FAIL');
    } finally {
      setDeleting(false);
    }
  }, [selectedMappingsForDelete, fetchData, fetchMappings, showSuccessMessage, showErrorMessage]);

  const handleMobileSelectionModeToggle = useCallback(() => {
    setMobileSelectionMode((prev) => !prev);
    if (mobileSelectionMode) {
      setMobileSelectedIds(new Set());
    }
  }, [mobileSelectionMode]);

  const handleMobileSelectAll = useCallback(() => {
    setMobileSelectedIds(new Set(filteredMappings.map((m) => m.id)));
  }, [filteredMappings]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDeleteMappings(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDeleteMappings]);

  const columns = useMemo(
    () => createColumns(t as (key: string) => string, currentLocale, handleEditPermission, gridPermissions.editable),
    [t, currentLocale, handleEditPermission, gridPermissions.editable]
  );

  const filterFields = useMemo(() => createFilterFields(currentLocale), [currentLocale]);
  const activeFilterCount = useMemo(() => calculateActiveFilterCount(searchCriteria), [searchCriteria]);

  const deleteItemsList = useMemo(
    () => selectedMappingsForDelete.map((id) => {
      const mapping = mappings.find((m) => m.id === id);
      return mapping
        ? { id: mapping.id, displayName: `${mapping.roleName} - ${mapping.roleDisplayName}` }
        : { id, displayName: String(id) };
    }),
    [selectedMappingsForDelete, mappings]
  );

  const mappedRoleIds = useMemo(() => {
    const uniqueRoleIds = new Set(mappings.map((m) => m.roleId));
    return Array.from(uniqueRoleIds);
  }, [mappings]);

  const activePrograms = useMemo(() => programs.filter(p => p.status === 'active'), [programs]);

  const renderMasterContent = () => (
    <MobileCardList
      data={activePrograms}
      loading={false}
      emptyMessage={currentLocale === 'ko' ? '프로그램이 없습니다' : 'No programs found'}
      renderCard={(program) => (
        <ProgramMobileCard
          key={program.id}
          program={program}
          locale={currentLocale}
          roleCount={roleCounts[program.id] || 0}
          onClick={handleMobileProgramClick}
        />
      )}
      keyExtractor={(program) => program.id}
    />
  );

  const renderDetailContent = () => (
    <MobileCardList
      data={filteredMappings}
      loading={loading}
      emptyMessage={currentLocale === 'ko' ? '매핑된 역할이 없습니다' : 'No role mappings found'}
      renderCard={(mapping) => (
        <RoleMappingMobileCard
          key={mapping.id}
          mapping={mapping}
          locale={currentLocale}
          onEdit={gridPermissions.editable ? handleMobileEditMapping : undefined}
          onDelete={gridPermissions.showDeleteButton ? handleMobileDeleteMapping : undefined}
          canEdit={gridPermissions.editable}
          canDelete={gridPermissions.showDeleteButton}
        />
      )}
      keyExtractor={(mapping) => mapping.id}
    />
  );

  return (
    <ResponsivePageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      quickSearch={isMobileLayout && mobileView === 'detail' ? quickSearch : undefined}
      onQuickSearchChange={isMobileLayout && mobileView === 'detail' ? setQuickSearch : undefined}
      onQuickSearch={() => {}}
      onQuickSearchClear={() => {
        setQuickSearch('');
        setSearchCriteria({ roleName: '', roleDisplayName: '', permissions: '' });
      }}
      quickSearchPlaceholder={currentLocale === 'ko' ? '역할 검색...' : 'Search roles...'}
      searching={loading}
      showAdvancedFilter={isMobileLayout && mobileView === 'detail'}
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
      activeFilterCount={mobileView === 'detail' ? activeFilterCount : 0}
      filterTitle={`${t('common.search')} / ${t('common.filter')}`}
      filterContent={
        <SearchFilterFields
          fields={filterFields}
          values={searchCriteria as unknown as Record<string, string>}
          onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value as string }))}
          onEnter={() => setAdvancedFilterOpen(false)}
        />
      }
      onFilterApply={() => setAdvancedFilterOpen(false)}
      onFilterClear={() => {
        setQuickSearch('');
        setSearchCriteria({ roleName: '', roleDisplayName: '', permissions: '' });
      }}
      onFilterClose={() => setAdvancedFilterOpen(false)}
      programId={programId || ''}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      mobileFab={undefined}
      mobileSelectionMode={mobileView === 'detail' ? mobileSelectionMode : false}
      mobileSelectedCount={mobileSelectedIds.size}
      mobileTotalCount={filteredMappings.length}
      onMobileSelectionModeToggle={
        mobileView === 'detail' && gridPermissions.showDeleteButton
          ? handleMobileSelectionModeToggle
          : undefined
      }
      onMobileSelectAll={handleMobileSelectAll}
      onMobileDeselectAll={handleMobileDeselectAll}
      onMobileDeleteSelected={
        mobileView === 'detail' && gridPermissions.showDeleteButton
          ? handleMobileDeleteSelected
          : undefined
      }
      mobileCustomHeader={isMobileLayout ? <Box /> : undefined}
    >
      {isMobileLayout ? (
        <MobileMasterDetail
          view={mobileView}
          onViewChange={setMobileView}
          masterContent={renderMasterContent()}
          detailContent={renderDetailContent()}
          detailHeader={{
            title: selectedProgram
              ? (currentLocale === 'ko' ? selectedProgram.name.ko : selectedProgram.name.en)
              : '',
            subtitle: selectedProgram?.code,
          }}
          onBack={handleMobileBackClick}
          masterFab={undefined}
          detailFab={
            gridPermissions.showAddButton
              ? { onClick: handleAddMapping, label: t('common.create') }
              : undefined
          }
          detailSelection={
            gridPermissions.showDeleteButton
              ? {
                  active: mobileSelectionMode,
                  selectedCount: mobileSelectedIds.size,
                  totalCount: filteredMappings.length,
                  onToggle: handleMobileSelectionModeToggle,
                  onSelectAll: handleMobileSelectAll,
                  onDeselectAll: handleMobileDeselectAll,
                  onDeleteSelected: handleMobileDeleteSelected,
                }
              : undefined
          }
          enableSwipeBack
          detailLoading={loading}
          hasDetailContent={filteredMappings.length > 0}
          detailEmptyState={
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {currentLocale === 'ko' ? '매핑된 역할이 없습니다' : 'No role mappings found'}
              </Typography>
            </Box>
          }
        />
      ) : (
        <MasterDetailLayout
          masterSize={30}
          detailSize={70}
          master={
            <ProgramList
              programs={programs}
              selectedProgram={selectedProgram}
              onProgramSelect={setSelectedProgram}
              roleCounts={roleCounts}
              locale={currentLocale}
            />
          }
          detail={
            <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selectedProgram ? (
                <EmptyState
                  icon={FolderOpen}
                  title={currentLocale === 'ko' ? '프로그램을 선택하세요' : 'Select a Program'}
                  description={
                    currentLocale === 'ko'
                      ? '왼쪽 목록에서 프로그램을 선택하여 역할 매핑을 관리하세요'
                      : 'Select a program from the list to manage role mappings'
                  }
                />
              ) : (
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6">
                      {currentLocale === 'ko'
                        ? `${selectedProgram.name.ko} 역할`
                        : `${selectedProgram.name.en} Roles`}
                    </Typography>
                  </Box>

                  <QuickSearchBar
                    searchValue={quickSearch}
                    onSearchChange={setQuickSearch}
                    onSearch={() => {}}
                    onClear={() => {
                      setQuickSearch('');
                      setSearchCriteria({ roleName: '', roleDisplayName: '', permissions: '' });
                    }}
                    onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                    placeholder={currentLocale === 'ko' ? '역할 검색...' : 'Search roles...'}
                    searching={loading}
                    activeFilterCount={activeFilterCount}
                    showAdvancedButton={true}
                  />

                  {advancedFilterOpen && (
                    <SearchFilterPanel
                      activeFilterCount={activeFilterCount}
                      onApply={() => setAdvancedFilterOpen(false)}
                      onClear={() => {
                        setQuickSearch('');
                        setSearchCriteria({ roleName: '', roleDisplayName: '', permissions: '' });
                      }}
                      onClose={() => setAdvancedFilterOpen(false)}
                      mode="advanced"
                      expanded={true}
                      showHeader={false}
                    >
                      <SearchFilterFields
                        fields={filterFields}
                        values={searchCriteria as unknown as Record<string, string>}
                        onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value as string }))}
                        onEnter={() => setAdvancedFilterOpen(false)}
                      />
                    </SearchFilterPanel>
                  )}

                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ExcelDataGrid
                      rows={filteredMappings}
                      columns={columns}
                      onRowsChange={(rows) => setFilteredMappings(rows as RoleProgramMapping[])}
                      {...(gridPermissions.showAddButton && { onAdd: handleAddMapping })}
                      {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteMappings })}
                      onRefresh={fetchMappings}
                      checkboxSelection={gridPermissions.checkboxSelection}
                      editable={gridPermissions.editable}
                      exportFileName={`program-role-mapping-${selectedProgram.code}`}
                      loading={loading}
                      paginationMode="client"
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          }
        />
      )}

      <DeleteConfirmDialog
        open={mappingDeleteConfirmOpen}
        itemCount={selectedMappingsForDelete.length}
        itemName="role program mapping"
        itemsList={deleteItemsList}
        onCancel={() => {
          setMappingDeleteConfirmOpen(false);
          setSelectedMappingsForDelete([]);
        }}
        onConfirm={handleConfirmDeleteMappings}
        loading={deleting}
      />

      <EditDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setEditingPermission(null);
        }}
        title={currentLocale === 'ko' ? '권한 수정' : 'Edit Permissions'}
        onSave={handleSavePermission}
        saveLoading={saveLoading}
        saveLabel={currentLocale === 'ko' ? '저장' : 'Save'}
        cancelLabel={currentLocale === 'ko' ? '취소' : 'Cancel'}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <PermissionEditForm
          permission={editingPermission}
          onChange={setEditingPermission}
          locale={currentLocale}
        />
      </EditDrawer>

      <RoleSearchDialog
        open={addRolesDialogOpen}
        onClose={() => setAddRolesDialogOpen(false)}
        onConfirm={handleAddRolesSuccess}
        locale={currentLocale}
        excludeRoleIds={mappedRoleIds}
      />
    </ResponsivePageLayout>
  );
}
