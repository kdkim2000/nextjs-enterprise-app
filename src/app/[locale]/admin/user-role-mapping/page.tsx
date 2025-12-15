'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import MobileMasterDetail, { useMobileMasterDetail } from '@/components/mobile/MobileMasterDetail';
import RoleList from './components/RoleList';
import RoleMobileCard from './components/RoleMobileCard';
import UserMappingMobileCard from './components/UserMappingMobileCard';
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { adminApi } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { useHelp } from '@/hooks/useHelp';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount, applyMappingFilters } from './utils';
import { Role, UserRoleMapping, SearchCriteria } from './types';

export default function UserRoleMappingPage() {
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
    selectMaster: selectMobileRole,
    goBack: handleMobileBack,
  } = useMobileMasterDetail<Role>('master');

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mappings, setMappings] = useState<UserRoleMapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<UserRoleMapping[]>([]);
  const [allMappings, setAllMappings] = useState<UserRoleMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    userId: '',
    userName: '',
    userEmail: '',
    userDepartment: '',
    status: 'active'
  });
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [addUsersDialogOpen, setAddUsersDialogOpen] = useState(false);
  const [mappingDeleteConfirmOpen, setMappingDeleteConfirmOpen] = useState(false);
  const [selectedMappingsForDelete, setSelectedMappingsForDelete] = useState<(string | number)[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const [rolesResponse, mappingsResponse] = await Promise.all([
        adminApi.get('/roles'),
        adminApi.get('/user-role-mappings', { params: { includeDetails: 'true' } })
      ]);
      const activeRoles = (rolesResponse.roles || []).filter((r: Role) => r.isActive);
      setRoles(activeRoles);
      setAllMappings(mappingsResponse.mappings || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      await showErrorMessage('COMMON_LOAD_ROLES_FAIL');
    }
  }, [showErrorMessage]);

  const fetchMappings = useCallback(async () => {
    if (!selectedRole) {
      setMappings([]);
      setFilteredMappings([]);
      return;
    }
    try {
      setLoading(true);
      const response = await adminApi.get('/user-role-mappings', {
        params: { roleId: selectedRole.id, includeDetails: 'true' }
      });
      const allRoleMappings = response.mappings || [];
      setMappings(allRoleMappings);
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
  }, [selectedRole, showErrorMessage, searchCriteria.status]);

  useEffect(() => { void fetchRoles(); }, [fetchRoles]);
  useEffect(() => {
    if (!isMobileLayout && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole, isMobileLayout]);
  useEffect(() => { void fetchMappings(); }, [fetchMappings]);
  useEffect(() => {
    const filtered = applyMappingFilters(mappings, quickSearch, searchCriteria);
    setFilteredMappings(filtered);
  }, [mappings, quickSearch, searchCriteria]);

  const userCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allMappings.forEach((mapping) => {
      if (mapping.isActive) {
        counts[mapping.roleId] = (counts[mapping.roleId] || 0) + 1;
      }
    });
    return counts;
  }, [allMappings]);

  const handleMobileRoleClick = useCallback((role: Role) => {
    setSelectedRole(role);
    selectMobileRole(role);
  }, [selectMobileRole]);

  const handleMobileBackClick = useCallback(() => {
    handleMobileBack();
    setMobileSelectionMode(false);
    setMobileSelectedIds(new Set());
  }, [handleMobileBack]);

  const handleAddMapping = useCallback(() => {
    if (!selectedRole) {
      void showErrorMessage('MAPPING_SELECT_ROLE_REQUIRED');
      return;
    }
    setAddUsersDialogOpen(true);
  }, [selectedRole, showErrorMessage]);

  const handleAddUsersSuccess = useCallback(async (users: User[]) => {
    try {
      if (!selectedRole) return;
      for (const user of users) {
        await adminApi.post('/user-role-mappings', {
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

  const handleMobileDeleteMapping = useCallback((mapping: UserRoleMapping) => {
    setSelectedMappingsForDelete([mapping.id]);
    setMappingDeleteConfirmOpen(true);
  }, []);

  const handleDeleteMappings = useCallback((ids: (string | number)[]) => {
    setSelectedMappingsForDelete(ids);
    setMappingDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeleteMappings = useCallback(async () => {
    try {
      setDeleting(true);
      for (const id of selectedMappingsForDelete) {
        await adminApi.delete(`/user-role-mappings/${id}`);
      }
      const count = selectedMappingsForDelete.length;
      await showSuccessMessage('MAPPING_DELETE_SUCCESS', { count });
      setMappingDeleteConfirmOpen(false);
      setSelectedMappingsForDelete([]);
      setMobileSelectedIds(new Set());
      setMobileSelectionMode(false);
      await fetchMappings();
    } catch (err: any) {
      await showErrorMessage('MAPPING_DELETE_FAIL');
    } finally {
      setDeleting(false);
    }
  }, [selectedMappingsForDelete, fetchMappings, showSuccessMessage, showErrorMessage]);

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

  const columns = useMemo(() => createColumns(t, currentLocale), [t, currentLocale]);
  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);
  const activeFilterCount = useMemo(() => calculateActiveFilterCount(searchCriteria), [searchCriteria]);

  const deleteItemsList = useMemo(
    () => selectedMappingsForDelete.map((id) => {
      const mapping = mappings.find((m) => m.id === id);
      return mapping
        ? { id: mapping.id, displayName: `${mapping.userName || mapping.userId} - ${mapping.roleDisplayName || mapping.roleId}` }
        : { id, displayName: String(id) };
    }),
    [selectedMappingsForDelete, mappings]
  );

  const excludedUserIds = useMemo(() => {
    if (!selectedRole) return [];
    return mappings.filter((m) => m.isActive).map((m) => m.userId);
  }, [selectedRole, mappings]);

  const renderMasterContent = () => (
    <MobileCardList
      data={roles}
      loading={false}
      emptyMessage={currentLocale === 'ko' ? '역할이 없습니다' : 'No roles found'}
      renderCard={(role) => (
        <RoleMobileCard
          key={role.id}
          role={role}
          locale={currentLocale}
          userCount={userCounts[role.id] || 0}
          onClick={handleMobileRoleClick}
        />
      )}
      keyExtractor={(role) => role.id}
    />
  );

  const renderDetailContent = () => (
    <MobileCardList
      data={filteredMappings}
      loading={loading}
      emptyMessage={currentLocale === 'ko' ? '매핑된 사용자가 없습니다' : 'No user mappings found'}
      renderCard={(mapping) => (
        <UserMappingMobileCard
          key={mapping.id}
          mapping={mapping}
          locale={currentLocale}
          onDelete={gridPermissions.showDeleteButton ? handleMobileDeleteMapping : undefined}
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
        setSearchCriteria({ userId: '', userName: '', userEmail: '', userDepartment: '', status: 'active' });
      }}
      quickSearchPlaceholder={currentLocale === 'ko' ? '사용자 검색...' : 'Search users...'}
      searching={loading}
      showAdvancedFilter={isMobileLayout && mobileView === 'detail'}
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
      activeFilterCount={mobileView === 'detail' ? activeFilterCount : 0}
      filterTitle={`${t('common.search')} / ${t('common.filter')}`}
      filterContent={
        <SearchFilterFields
          fields={filterFields}
          values={searchCriteria}
          onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value }))}
          onEnter={() => setAdvancedFilterOpen(false)}
        />
      }
      onFilterApply={() => setAdvancedFilterOpen(false)}
      onFilterClear={() => {
        setQuickSearch('');
        setSearchCriteria({ userId: '', userName: '', userEmail: '', userDepartment: '', status: 'active' });
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
            title: selectedRole?.displayName || '',
            subtitle: selectedRole?.name,
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
                {currentLocale === 'ko' ? '매핑된 사용자가 없습니다' : 'No user mappings found'}
              </Typography>
            </Box>
          }
        />
      ) : (
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
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6">
                      {currentLocale === 'ko'
                        ? `${selectedRole.displayName} 사용자`
                        : `${selectedRole.displayName} Users`}
                    </Typography>
                  </Box>

                  <QuickSearchBar
                    searchValue={quickSearch}
                    onSearchChange={setQuickSearch}
                    onSearch={() => {}}
                    onClear={() => {
                      setQuickSearch('');
                      setSearchCriteria({ userId: '', userName: '', userEmail: '', userDepartment: '', status: 'active' });
                    }}
                    onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                    placeholder={currentLocale === 'ko' ? '사용자 검색...' : 'Search users...'}
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
                        setSearchCriteria({ userId: '', userName: '', userEmail: '', userDepartment: '', status: 'active' });
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
      )}

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
    </ResponsivePageLayout>
  );
}
