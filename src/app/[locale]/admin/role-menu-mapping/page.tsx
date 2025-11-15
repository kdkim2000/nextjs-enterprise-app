'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, Collapse, IconButton, Tooltip } from '@mui/material';
import { FolderOpen, Close, RestartAlt, Check } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import ProgramList from './components/ProgramList';
import RoleSearchDialog from './components/RoleSearchDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount, applyMappingFilters } from './utils';
import { Role, Program, RoleProgramMapping, SearchCriteria } from './types';

export default function RoleMenuMappingPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

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

  // Mapping Delete
  const [mappingDeleteConfirmOpen, setMappingDeleteConfirmOpen] = useState(false);
  const [selectedMappingsForDelete, setSelectedMappingsForDelete] = useState<(string | number)[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Fetch programs and all mappings
  const fetchData = useCallback(async () => {
    try {
      const [programsResponse, mappingsResponse] = await Promise.all([
        api.get('/program/all'),
        api.get('/role-program-mapping', { params: { includeDetails: 'true' } })
      ]);

      setPrograms(programsResponse.programs || []);
      setAllMappings(mappingsResponse.mappings || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showError(currentLocale === 'ko' ? '데이터 로드 실패' : 'Failed to load data');
    }
  }, [showError, currentLocale]);

  // Fetch mappings for selected program
  const fetchMappings = useCallback(async () => {
    if (!selectedProgram) {
      setMappings([]);
      setFilteredMappings([]);
      return;
    }

    try {
      setLoading(true);

      // Get mappings for this program
      const response = await api.get('/role-program-mapping', {
        params: { programId: selectedProgram.id, includeDetails: 'true' }
      });

      const programMappings = response.mappings || [];
      setMappings(programMappings);
      setFilteredMappings(programMappings);
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
      showError(currentLocale === 'ko' ? '역할 매핑 로드 실패' : 'Failed to load role mappings');
      setMappings([]);
      setFilteredMappings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProgram, showError, currentLocale]);

  // Initial fetch
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Fetch mappings when program selected
  useEffect(() => {
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
      showError(currentLocale === 'ko' ? '먼저 프로그램을 선택하세요' : 'Please select a program first');
      return;
    }
    setAddRolesDialogOpen(true);
  }, [selectedProgram, showError, currentLocale]);

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
      showSuccess(
        currentLocale === 'ko'
          ? `${count}개 역할을 프로그램에 성공적으로 할당했습니다`
          : `Successfully assigned ${count} role${count > 1 ? 's' : ''} to program`
      );

      void fetchData();
      void fetchMappings();
    } catch (err: any) {
      showError(err.response?.data?.error || (currentLocale === 'ko' ? '역할 할당 실패' : 'Failed to assign roles to program'));
    }
  }, [selectedProgram, fetchData, fetchMappings, showSuccess, showError, currentLocale]);

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
      showSuccess(
        currentLocale === 'ko'
          ? `${count}개 매핑을 성공적으로 삭제했습니다`
          : `Successfully deleted ${count} mapping${count > 1 ? 's' : ''}`
      );

      setMappingDeleteConfirmOpen(false);
      setSelectedMappingsForDelete([]);
      await fetchData();
      await fetchMappings();
    } catch (err: any) {
      showError(err.response?.data?.error || (currentLocale === 'ko' ? '매핑 삭제 실패' : 'Failed to delete mappings'));
    } finally {
      setDeleting(false);
    }
  }, [selectedMappingsForDelete, fetchData, fetchMappings, showSuccess, showError, currentLocale]);

  // Memoized values
  const columns = useMemo(
    () => createColumns(t as (key: string) => string, currentLocale),
    [t, currentLocale]
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
                <Collapse in={advancedFilterOpen}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {currentLocale === 'ko' ? '상세 필터' : 'Advanced Filter'}
                      </Typography>
                      <IconButton size="small" onClick={() => setAdvancedFilterOpen(false)}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                    <SearchFilterFields
                      fields={filterFields}
                      values={searchCriteria as unknown as Record<string, string>}
                      onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value as string }))}
                      onEnter={() => setAdvancedFilterOpen(false)}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                      {/* Close Button */}
                      <Tooltip title={currentLocale === 'ko' ? '닫기' : 'Close'} arrow>
                        <IconButton
                          onClick={() => setAdvancedFilterOpen(false)}
                          size="small"
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              borderColor: 'action.active',
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Clear Button */}
                      <Tooltip title={currentLocale === 'ko' ? '초기화' : 'Clear'} arrow>
                        <span>
                          <IconButton
                            onClick={() => {
                              setQuickSearch('');
                              setSearchCriteria({
                                roleName: '',
                                roleDisplayName: '',
                                permissions: ''
                              });
                            }}
                            disabled={activeFilterCount === 0}
                            size="small"
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'warning.main',
                                bgcolor: 'warning.50'
                              }
                            }}
                          >
                            <RestartAlt fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Apply Button */}
                      <Tooltip title={currentLocale === 'ko' ? '적용' : 'Apply'} arrow>
                        <IconButton
                          onClick={() => setAdvancedFilterOpen(false)}
                          size="small"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark'
                            },
                            '&.Mui-disabled': {
                              bgcolor: 'action.disabledBackground',
                              color: 'action.disabled'
                            }
                          }}
                        >
                          <Check fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                </Collapse>

                {/* Data Grid */}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ExcelDataGrid
                    rows={filteredMappings}
                    columns={columns}
                    onRowsChange={(rows) => setFilteredMappings(rows as RoleProgramMapping[])}
                    onAdd={handleAddMapping}
                    onDelete={handleDeleteMappings}
                    onRefresh={fetchMappings}
                    checkboxSelection
                    editable
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
