'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import RoleList from './components/RoleList';
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useProgramId } from '@/hooks/useProgramId';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount, applyMappingFilters } from './utils';
import { Role, UserRoleMapping, SearchCriteria } from './types';

export default function UserRoleMappingPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale: currentLocale });

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  // Permission control - use programId from DB
  const gridPermissions = useDataGridPermissions(programId || '');

  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mappings, setMappings] = useState<UserRoleMapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<UserRoleMapping[]>([]);
  const [allMappings, setAllMappings] = useState<UserRoleMapping[]>([]); // 모든 매핑 데이터
  const [loading, setLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    userId: '',
    userName: '',
    userEmail: '',
    userDepartment: '',
    status: 'active' // Default to active users to match userCounts
  });
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // Help
  const [helpOpen, setHelpOpen] = useState(false);

  // Add Users Dialog (new bulk assign dialog)
  const [addUsersDialogOpen, setAddUsersDialogOpen] = useState(false);

  // Mapping Delete
  const [mappingDeleteConfirmOpen, setMappingDeleteConfirmOpen] = useState(false);
  const [selectedMappingsForDelete, setSelectedMappingsForDelete] = useState<(string | number)[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Fetch roles and all mappings
  const fetchRoles = useCallback(async () => {
    try {
      const [rolesResponse, mappingsResponse] = await Promise.all([
        api.get('/role'),
        api.get('/user-role-mapping', { params: { includeDetails: 'true' } })
      ]);

      const activeRoles = (rolesResponse.roles || []).filter((r: Role) => r.isActive);
      setRoles(activeRoles);
      setAllMappings(mappingsResponse.mappings || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      await showErrorMessage('COMMON_LOAD_ROLES_FAIL');
    }
  }, [showErrorMessage]);

  // Fetch mappings for selected role
  const fetchMappings = useCallback(async () => {
    if (!selectedRole) {
      setMappings([]);
      setFilteredMappings([]);
      return;
    }

    try {
      setLoading(true);
      // Fetch all mappings (active + inactive) for the role
      const response = await api.get('/user-role-mapping', {
        params: { roleId: selectedRole.id, includeDetails: 'true' }
      });
      const allRoleMappings = response.mappings || [];
      setMappings(allRoleMappings);

      // Apply initial filter based on searchCriteria.status or default to active
      let initialFiltered = allRoleMappings;
      if (!searchCriteria.status || searchCriteria.status === 'active') {
        initialFiltered = allRoleMappings.filter((m: UserRoleMapping) => m.isActive === true);
      } else if (searchCriteria.status === 'inactive') {
        initialFiltered = allRoleMappings.filter((m: UserRoleMapping) => m.isActive === false);
      }
      setFilteredMappings(initialFiltered);
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
      await showErrorMessage('MAPPING_USER_LOAD_FAIL');
      setMappings([]);
      setFilteredMappings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, showErrorMessage, fetchRoles]);

  // Initial load
  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  // Auto-select first role on initial load
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // Load mappings when role changes
  useEffect(() => {
    void fetchMappings();
  }, [fetchMappings]);

  // Apply filters using consolidated filter function
  useEffect(() => {
    const filtered = applyMappingFilters(mappings, quickSearch, searchCriteria);
    setFilteredMappings(filtered);
  }, [mappings, quickSearch, searchCriteria]);

  // Mapping handlers
  const handleAddMapping = useCallback(() => {
    if (!selectedRole) {
      void showErrorMessage('MAPPING_SELECT_ROLE_REQUIRED');
      return;
    }

    // Open the new bulk assign dialog
    setAddUsersDialogOpen(true);
  }, [selectedRole, showErrorMessage]);

  const handleAddUsersSuccess = useCallback(async (users: User[]) => {
    try {
      if (!selectedRole) return;

      // Create mappings for each selected user
      for (const user of users) {
        await api.post('/user-role-mapping', {
          userId: user.id,
          roleId: selectedRole.id,
          isActive: true
        });
      }

      const count = users.length;
      await showSuccessMessage('MAPPING_USER_ASSIGN_SUCCESS', { count });
      void fetchMappings();
    } catch (err: any) {
      await showErrorMessage('MAPPING_USER_ASSIGN_FAIL');
    }
  }, [selectedRole, fetchMappings, showSuccessMessage, showErrorMessage]);

  const handleDeleteMappings = useCallback((ids: (string | number)[]) => {
    setSelectedMappingsForDelete(ids);
    setMappingDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeleteMappings = useCallback(async () => {
    try {
      setDeleting(true);
      for (const id of selectedMappingsForDelete) {
        await api.delete('/user-role-mapping', { params: { id } });
      }

      const count = selectedMappingsForDelete.length;
      await showSuccessMessage('MAPPING_DELETE_SUCCESS', { count });
      setMappingDeleteConfirmOpen(false);
      setSelectedMappingsForDelete([]);
      await fetchMappings();
    } catch (err: any) {
      await showErrorMessage('MAPPING_DELETE_FAIL');
    } finally {
      setDeleting(false);
    }
  }, [selectedMappingsForDelete, fetchMappings, showSuccessMessage, showErrorMessage]);

  // Memoized values
  const columns = useMemo(
    () => createColumns(t, currentLocale),
    [t, currentLocale]
  );

  const filterFields = useMemo(
    () => createFilterFields(t, currentLocale),
    [t, currentLocale]
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
              displayName: `${mapping.userName || mapping.userId} - ${mapping.roleDisplayName || mapping.roleId}`
            }
          : { id, displayName: String(id) };
      }),
    [selectedMappingsForDelete, mappings]
  );

  // Calculate user counts per role
  const userCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allMappings.forEach((mapping) => {
      if (mapping.isActive) {
        counts[mapping.roleId] = (counts[mapping.roleId] || 0) + 1;
      }
    });
    return counts;
  }, [allMappings]);

  // Get excluded user IDs (already assigned to this role)
  const excludedUserIds = useMemo(() => {
    if (!selectedRole) return [];
    return mappings
      .filter((m) => m.isActive)
      .map((m) => m.userId);
  }, [selectedRole, mappings]);

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      showQuickSearch={false}
      showAdvancedFilter={false}
      programId={programId || ''}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={true}
      helpExists={true}
      language={currentLocale}
    >
      <MasterDetailLayout
        masterSize={30}
        detailSize={70}
        master={
          <RoleList
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            locale={currentLocale}
            userCounts={userCounts}
          />
        }
        detail={
          <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!selectedRole ? (
              <EmptyState
                icon={Search}
                title={currentLocale === 'ko' ? '역할을 선택하세요' : 'Select a Role'}
                description={
                  currentLocale === 'ko'
                    ? '왼쪽 목록에서 역할을 선택하여 사용자 매핑을 관리하세요'
                    : 'Select a role from the list to manage user mappings'
                }
              />
            ) : (
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Header with Title */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6">
                    {currentLocale === 'ko'
                      ? `${selectedRole.displayName} 사용자`
                      : `${selectedRole.displayName} Users`}
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
                      userId: '',
                      userName: '',
                      userEmail: '',
                      userDepartment: '',
                      status: 'active'
                    });
                  }}
                  onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                  placeholder={currentLocale === 'ko' ? '사용자 검색...' : 'Search users...'}
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
                        userId: '',
                        userName: '',
                        userEmail: '',
                        userDepartment: '',
                        status: 'active'
                      });
                    }}
                    onClose={() => setAdvancedFilterOpen(false)}
                    mode="advanced"
                    expanded={true}
                    showHeader={false}
                  >
                    <SearchFilterFields
                      fields={filterFields}
                      values={searchCriteria}
                      onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value }))}
                      onEnter={() => setAdvancedFilterOpen(false)}
                    />
                  </SearchFilterPanel>
                )}

                {/* Data Grid */}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ExcelDataGrid
                    rows={filteredMappings}
                    columns={columns}
                    onRowsChange={(rows) => setFilteredMappings(rows as UserRoleMapping[])}
                    {...(gridPermissions.showAddButton && { onAdd: handleAddMapping })}
                    {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteMappings })}
                    onRefresh={fetchMappings}
                    checkboxSelection={gridPermissions.checkboxSelection}
                    editable={gridPermissions.editable}
                    exportFileName={`user-role-mapping-${selectedRole.name}`}
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
        itemName="user role mapping"
        itemsList={deleteItemsList}
        onCancel={() => {
          setMappingDeleteConfirmOpen(false);
          setSelectedMappingsForDelete([]);
        }}
        onConfirm={handleConfirmDeleteMappings}
        loading={deleting}
      />

      {/* Add Users to Role Dialog */}
      <UserSearchDialog
        open={addUsersDialogOpen}
        onClose={() => setAddUsersDialogOpen(false)}
        onSelectMultiple={handleAddUsersSuccess}
        title={
          currentLocale === 'ko'
            ? `${selectedRole?.displayName || ''} 역할에 사용자 추가`
            : `Add Users to ${selectedRole?.displayName || ''} Role`
        }
        excludedUserIds={excludedUserIds}
        multiSelect={true}
        showAdvancedSearch={true}
        locale={currentLocale}
        filterByStatus="active"
      />
    </StandardCrudPageLayout>
  );
}
