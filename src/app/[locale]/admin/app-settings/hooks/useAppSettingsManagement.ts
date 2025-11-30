import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { AppSetting, GroupedSettings, CategoryType, SettingUpdatePayload } from '../types';

interface UseAppSettingsManagementOptions {
  initialCategory?: CategoryType | '';
}

export const useAppSettingsManagement = (options: UseAppSettingsManagementOptions = {}) => {
  const { initialCategory = '' } = options;

  // Locale and messages
  const locale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({ locale });

  // State
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>(initialCategory);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AppSetting | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [readyFilter, setReadyFilter] = useState<string>('');
  const [appliedFilter, setAppliedFilter] = useState<string>('');

  // Fetch grouped settings
  const fetchGroupedSettings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (readyFilter !== '') {
        params.append('isReady', readyFilter);
      }
      if (appliedFilter !== '') {
        params.append('isApplied', appliedFilter);
      }

      const response = await api.get(`/app-settings/grouped?${params.toString()}`);
      const grouped = response.settings || {};

      setGroupedSettings(grouped);
      setCategories(Object.keys(grouped));

      // Flatten for search
      const allSettings: AppSetting[] = [];
      Object.values(grouped).forEach((catSettings: any) => {
        allSettings.push(...catSettings);
      });
      setSettings(allSettings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showErrorMessage('COMMON_LOAD_FAIL');
    } finally {
      setLoading(false);
    }
  }, [readyFilter, appliedFilter, showErrorMessage]);

  // Fetch settings by category
  const fetchSettingsByCategory = useCallback(async (category: CategoryType) => {
    try {
      setLoading(true);
      const response = await api.get(`/app-settings/category/${category}`);
      return response.settings || [];
    } catch (error) {
      console.error('Failed to fetch category settings:', error);
      showErrorMessage('COMMON_LOAD_FAIL');
      return [];
    } finally {
      setLoading(false);
    }
  }, [showErrorMessage]);

  // Update setting value
  const updateSetting = useCallback(async (key: string, updates: Partial<SettingUpdatePayload>) => {
    try {
      setSaveLoading(true);
      const response = await api.put(`/app-settings/${key}`, updates);

      // Update local state
      const updatedSetting = response.setting;

      setSettings(prev =>
        prev.map(s => (s.key === key ? updatedSetting : s))
      );

      // Update grouped settings
      setGroupedSettings(prev => {
        const newGrouped = { ...prev };
        Object.keys(newGrouped).forEach(cat => {
          newGrouped[cat] = newGrouped[cat].map((s: AppSetting) =>
            s.key === key ? updatedSetting : s
          );
        });
        return newGrouped;
      });

      showSuccessMessage('COMMON_UPDATE_SUCCESS');
      return updatedSetting;
    } catch (error) {
      console.error('Failed to update setting:', error);
      showErrorMessage('COMMON_UPDATE_FAIL');
      return null;
    } finally {
      setSaveLoading(false);
    }
  }, [showSuccessMessage, showErrorMessage]);

  // Toggle ready status
  const toggleReadyStatus = useCallback(async (key: string, isReady: boolean) => {
    try {
      setSaveLoading(true);
      const response = await api.patch(`/app-settings/${key}/ready`, { isReady });

      const updatedSetting = response.setting;

      // Update local state
      setSettings(prev =>
        prev.map(s => (s.key === key ? updatedSetting : s))
      );

      setGroupedSettings(prev => {
        const newGrouped = { ...prev };
        Object.keys(newGrouped).forEach(cat => {
          newGrouped[cat] = newGrouped[cat].map((s: AppSetting) =>
            s.key === key ? updatedSetting : s
          );
        });
        return newGrouped;
      });

      showSuccessMessage('COMMON_UPDATE_SUCCESS');
      return updatedSetting;
    } catch (error) {
      console.error('Failed to toggle ready status:', error);
      showErrorMessage('COMMON_UPDATE_FAIL');
      return null;
    } finally {
      setSaveLoading(false);
    }
  }, [showSuccessMessage, showErrorMessage]);

  // Toggle applied status
  const toggleAppliedStatus = useCallback(async (key: string, isApplied: boolean) => {
    try {
      setSaveLoading(true);
      const response = await api.patch(`/app-settings/${key}/applied`, { isApplied });

      const updatedSetting = response.setting;

      // Update local state
      setSettings(prev =>
        prev.map(s => (s.key === key ? updatedSetting : s))
      );

      setGroupedSettings(prev => {
        const newGrouped = { ...prev };
        Object.keys(newGrouped).forEach(cat => {
          newGrouped[cat] = newGrouped[cat].map((s: AppSetting) =>
            s.key === key ? updatedSetting : s
          );
        });
        return newGrouped;
      });

      showSuccessMessage('COMMON_UPDATE_SUCCESS');
      return updatedSetting;
    } catch (error: any) {
      console.error('Failed to toggle applied status:', error);
      // Handle the "not ready" error specifically
      if (error.response?.data?.error === 'Cannot apply a setting that is not ready') {
        showErrorMessage('SETTINGS_NOT_READY_FOR_APPLY');
      } else {
        showErrorMessage('COMMON_UPDATE_FAIL');
      }
      return null;
    } finally {
      setSaveLoading(false);
    }
  }, [showSuccessMessage, showErrorMessage]);

  // Create new setting
  const createSetting = useCallback(async (settingData: Partial<AppSetting>) => {
    try {
      setSaveLoading(true);
      const response = await api.post('/app-settings', settingData);
      const newSetting = response.setting;

      // Refresh to get updated grouped settings
      await fetchGroupedSettings();

      showSuccessMessage('COMMON_CREATE_SUCCESS');
      return newSetting;
    } catch (error: any) {
      console.error('Failed to create setting:', error);
      if (error.response?.data?.error === 'Setting key already exists') {
        showErrorMessage('COMMON_DUPLICATE_KEY');
      } else {
        showErrorMessage('COMMON_CREATE_FAIL');
      }
      return null;
    } finally {
      setSaveLoading(false);
    }
  }, [fetchGroupedSettings, showSuccessMessage, showErrorMessage]);

  // Delete setting
  const deleteSetting = useCallback(async (key: string) => {
    try {
      setSaveLoading(true);
      await api.delete(`/app-settings/${key}`);

      // Update local state
      setSettings(prev => prev.filter(s => s.key !== key));

      setGroupedSettings(prev => {
        const newGrouped = { ...prev };
        Object.keys(newGrouped).forEach(cat => {
          newGrouped[cat] = newGrouped[cat].filter((s: AppSetting) => s.key !== key);
        });
        return newGrouped;
      });

      showSuccessMessage('COMMON_DELETE_SUCCESS');
      return true;
    } catch (error) {
      console.error('Failed to delete setting:', error);
      showErrorMessage('COMMON_DELETE_FAIL');
      return false;
    } finally {
      setSaveLoading(false);
    }
  }, [showSuccessMessage, showErrorMessage]);

  // Edit handlers
  const handleEdit = useCallback((setting: AppSetting) => {
    setEditingSetting(setting);
    setEditDialogOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditDialogOpen(false);
    setEditingSetting(null);
  }, []);

  const handleEditSave = useCallback(async (updates: Partial<SettingUpdatePayload>) => {
    if (!editingSetting) return;

    const result = await updateSetting(editingSetting.key, updates);
    if (result) {
      handleEditClose();
    }
    return result;
  }, [editingSetting, updateSetting, handleEditClose]);

  // Add handlers
  const handleAdd = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const handleAddClose = useCallback(() => {
    setAddDialogOpen(false);
  }, []);

  const handleAddSave = useCallback(async (settingData: Partial<AppSetting>) => {
    const result = await createSetting(settingData);
    if (result) {
      handleAddClose();
    }
    return result;
  }, [createSetting, handleAddClose]);

  // Filter settings by search query and status
  const getFilteredSettings = useCallback((category?: CategoryType | '', statusFilter?: string) => {
    let filtered: AppSetting[] = [];

    if (category) {
      filtered = groupedSettings[category] || [];
    } else {
      filtered = settings;
    }

    // Apply status filter
    if (statusFilter) {
      switch (statusFilter) {
        case 'applied':
          filtered = filtered.filter(s => s.isApplied);
          break;
        case 'ready':
          filtered = filtered.filter(s => s.isReady && !s.isApplied);
          break;
        case 'not_ready':
          filtered = filtered.filter(s => !s.isReady);
          break;
        // 'true'/'false' for backward compatibility
        case 'true':
          filtered = filtered.filter(s => s.isReady);
          break;
        case 'false':
          filtered = filtered.filter(s => !s.isReady);
          break;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.key.toLowerCase().includes(query) ||
          s.description.en.toLowerCase().includes(query) ||
          s.description.ko.toLowerCase().includes(query) ||
          (s.value && s.value.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [settings, groupedSettings, searchQuery]);

  // Refresh
  const handleRefresh = useCallback(() => {
    fetchGroupedSettings();
  }, [fetchGroupedSettings]);

  // Initial fetch
  useEffect(() => {
    fetchGroupedSettings();
  }, [fetchGroupedSettings]);

  return {
    // State
    settings,
    groupedSettings,
    categories,
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

    // Dialog state
    editDialogOpen,
    editingSetting,
    addDialogOpen,

    // Messages
    successMessage,
    errorMessage,

    // Actions
    fetchGroupedSettings,
    fetchSettingsByCategory,
    updateSetting,
    toggleReadyStatus,
    toggleAppliedStatus,
    createSetting,
    deleteSetting,
    getFilteredSettings,
    handleRefresh,

    // Dialog handlers
    handleEdit,
    handleEditClose,
    handleEditSave,
    handleAdd,
    handleAddClose,
    handleAddSave
  };
};
