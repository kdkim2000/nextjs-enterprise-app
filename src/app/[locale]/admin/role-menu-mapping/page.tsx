'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import EditDrawer from '@/components/common/EditDrawer';
import ProgramList from './components/ProgramList';
import RoleSearchDialog from './components/RoleSearchDialog';
import PermissionEditForm from './components/PermissionEditForm';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount, applyMappingFilters } from './utils';
import { Role, Program, RoleProgramMapping, SearchCriteria, PermissionFormData } from './types';

export default function RoleMenuMappingPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale: currentLocale });
  const gridPermissions = useDataGridPermissions('PROG-ROLE-MENU-MAP');

  // State
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

  // Help
  const [helpOpen, setHelpOpen] = useState(false);

  // Add Roles Dialog
  const [addRolesDialogOpen, setAddRolesDialogOpen] = useState(false);

  // Edit Permission Dialog
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionFormData | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Mapping Delete
  const [mappingDeleteConfirmOpen, setMappingDeleteConfirmOpen] = useState(false);
  const [selectedMappingsForDelete, setSelectedMappingsForDelete] = useState<(string | number)[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Fetch programs and all mappings
  const fetchData = useCallback(async () => {
    try {
      console.log('[role-menu-mapping] Fetching programs and mappings...');
      const [programsResponse, mappingsResponse] = await Promise.all([
        api.get('/program/all'),
        api.get('/role-program-mapping', { params: { includeDetails: 'true' } })
      ]);

      console.log('[role-menu-mapping] Programs response:', programsResponse);
      console.log('[role-menu-mapping] Mappings response:', mappingsResponse);

      setPrograms(programsResponse.programs || []);
      setAllMappings(mappingsResponse.mappings || []);

      console.log('[role-menu-mapping] Set programs:', programsResponse.programs?.length || 0);
      console.log('[role-menu-mapping] Set mappings:', mappingsResponse.mappings?.length || 0);
    } catch (error) {
      console.error('[role-menu-mapping] Failed to fetch data:', error);
      await showErrorMessage('MAPPING_DATA_LOAD_FAIL');
    }
  }, [showErrorMessage]);

  // Fetch mappings for selected program
  const fetchMappings = useCallback(async () => {
    if (!selectedProgram) {
      console.log('[role-menu-mapping] No program selected, clearing mappings');
      setMappings([]);
      setFilteredMappings([]);
      return;
    }

    try {
      setLoading(true);
      console.log('[role-menu-mapping] Fetching mappings for program:', selectedProgram.id, selectedProgram.code);

      // Get mappings for this program
      const response = await api.get('/role-program-mapping', {
        params: { programId: selectedProgram.id, includeDetails: 'true' }
      });

      console.log('[role-menu-mapping] Mappings response:', response);
      const programMappings = response.mappings || [];
      console.log('[role-menu-mapping] Program mappings count:', programMappings.length);

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

  // Initial fetch
  useEffect(() => {
    console.log('[role-menu-mapping] Initial fetch useEffect triggered');
    void fetchData();
  }, [fetchData]);

  // Auto-select first program on initial load
  useEffect(() => {
    console.log('[role-menu-mapping] Auto-select useEffect - programs:', programs.length, 'selectedProgram:', selectedProgram?.code);
    if (programs.length > 0 && !selectedProgram) {
      console.log('[role-menu-mapping] Auto-selecting first program:', programs[0].code);
      setSelectedProgram(programs[0]);
    }
  }, [programs, selectedProgram]);

  // Fetch mappings when program selected
  useEffect(() => {
    console.log('[role-menu-mapping] Fetch mappings useEffect triggered');
    void fetchMappings();
  }, [fetchMappings]);

  // Apply filters
  useEffect(() => {
    const filtered = applyMappingFilters(mappings, quickSearch, searchCriteria);
    setFilteredMappings(filtered);
  }, [mappings, quickSearch, searchCriteria]);

  // Calculate role counts per program
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    programs.forEach((program) => {
      // Count unique roles assigned to this program
      const programMappings = allMappings.filter(m => m.programId === program.id);
      const uniqueRoles = new Set(programMappings.map(m => m.roleId));
      counts[program.id] = uniqueRoles.size;
    });

    return counts;
  }, [programs, allMappings]);

  // Mapping handlers
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

      // For each role, create mapping to program
      for (const role of roles) {
        await api.post('/role-program-mapping', {
          roleId: role.id,
          programId: selectedProgram.id,
          ...permissions
        });
      }

      const count = roles.length;
      await showSuccessMessage('MAPPING_ROLE_ASSIGN_SUCCESS', { count });

      void fetchData();
      void fetchMappings();
    } catch (err: any) {
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

  const handleSavePermission = useCallback(async () => {
    if (!editingPermission) return;

    try {
      setSaveLoading(true);

      await api.put('/role-program-mapping', {
        id: editingPermission.id,
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
    } catch (err: any) {
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
        await api.delete(`/role-program-mapping?id=${id}`);
      }

      const count = selectedMappingsForDelete.length;
      await showSuccessMessage('MAPPING_DELETE_SUCCESS', { count });

      setMappingDeleteConfirmOpen(false);
      setSelectedMappingsForDelete([]);
      await fetchData();
      await fetchMappings();
    } catch (err: any) {
      await showErrorMessage('MAPPING_DELETE_FAIL');
    } finally {
      setDeleting(false);
    }
  }, [selectedMappingsForDelete, fetchData, fetchMappings, showSuccessMessage, showErrorMessage]);

  // Memoized values
  const columns = useMemo(
    () => createColumns(t as (key: string) => string, currentLocale, handleEditPermission, gridPermissions.editable),
    [t, currentLocale, handleEditPermission, gridPermissions.editable]
  );

  const filterFields = useMemo(
    () => createFilterFields(currentLocale),
    [currentLocale]
  );

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedMappingsForDelete.map((id) => {
        const mapping = mappings.find((m) => m.id === id);
        return mapping
          ? {
              id: mapping.id,
              displayName: `${mapping.roleName} - ${mapping.roleDisplayName}`
            }
          : { id, displayName: String(id) };
      }),
    [selectedMappingsForDelete, mappings]
  );

  // Get already mapped role IDs for the selected program
  const mappedRoleIds = useMemo(() => {
    // Get unique role IDs from all mappings
    const uniqueRoleIds = new Set(mappings.map((m) => m.roleId));
    return Array.from(uniqueRoleIds);
  }, [mappings]);

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      showQuickSearch={false}
      showAdvancedFilter={false}
      programId="PROG-ROLE-MENU-MAP"
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      language={currentLocale}
      isAdmin={true}
      helpExists={true}
    >
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
                {/* Header with Title */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6">
                    {currentLocale === 'ko'
                      ? `${selectedProgram.name.ko} 역할`
                      : `${selectedProgram.name.en} Roles`}
                  </Typography>
                </Box>

                {/* Quick Search Bar */}
                <QuickSearchBar
                  searchValue={quickSearch}
                  onSearchChange={setQuickSearch}
                  onSearch={() => {}}
                  onClear={() => {
                    setQuickSearch('');
                    setSearchCriteria({
                      roleName: '',
                      roleDisplayName: '',
                      permissions: ''
                    });
                  }}
                  onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                  placeholder={currentLocale === 'ko' ? '역할 검색...' : 'Search roles...'}
                  searching={loading}
                  activeFilterCount={activeFilterCount}
                  showAdvancedButton={true}
                />

                {/* Advanced Filter Panel */}
                {advancedFilterOpen && (
                  <SearchFilterPanel
                    activeFilterCount={activeFilterCount}
                    onApply={() => setAdvancedFilterOpen(false)}
                    onClear={() => {
                      setQuickSearch('');
                      setSearchCriteria({
                        roleName: '',
                        roleDisplayName: '',
                        permissions: ''
                      });
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

                {/* Data Grid */}
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

      {/* Mapping Delete Confirmation */}
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

      {/* Edit Permission Drawer */}
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

      {/* Add Roles to Program Dialog */}
      <RoleSearchDialog
        open={addRolesDialogOpen}
        onClose={() => setAddRolesDialogOpen(false)}
        onConfirm={handleAddRolesSuccess}
        locale={currentLocale}
        excludeRoleIds={mappedRoleIds}
      />
    </StandardCrudPageLayout>
  );
}
