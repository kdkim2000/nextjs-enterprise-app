import { useState, useEffect, useCallback } from 'react';
import { inspectionApi } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { ChecksheetTemplate, ChecksheetItem, ItemType } from '../types';

interface UseTemplateDetailOptions {
  templateId: string;
}

export const useTemplateDetail = ({ templateId }: UseTemplateDetailOptions) => {
  const locale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({ locale });

  // Template state
  const [template, setTemplate] = useState<ChecksheetTemplate | null>(null);
  const [items, setItems] = useState<ChecksheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecksheetTemplate | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecksheetItem | null>(null);
  const [deleteItemConfirmOpen, setDeleteItemConfirmOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<string | null>(null);

  // Fetch template with items
  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inspectionApi.get(`/templates/${templateId}`);
      setTemplate(response.template);
      setEditingTemplate(response.template);

      // Fetch items
      const itemsResponse = await inspectionApi.get(`/items?template_id=${templateId}`);
      setItems(itemsResponse.items || []);
    } catch (error) {
      console.error('Failed to fetch template:', error);
      await showErrorMessage('COMMON_LOAD_FAIL');
    } finally {
      setLoading(false);
    }
  }, [templateId, showErrorMessage]);

  // Save template changes
  const handleSaveTemplate = useCallback(async () => {
    if (!editingTemplate) return;

    try {
      setSaveLoading(true);
      const response = await inspectionApi.put(`/templates/${templateId}`, editingTemplate);
      setTemplate(response.template);
      setEditingTemplate(response.template);
      setEditMode(false);
      await showSuccessMessage('COMMON_UPDATE_SUCCESS');
    } catch (error) {
      console.error('Failed to save template:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [templateId, editingTemplate, showSuccessMessage, showErrorMessage]);

  // Cancel edit mode
  const handleCancelEdit = useCallback(() => {
    setEditingTemplate(template);
    setEditMode(false);
  }, [template]);

  // Item CRUD operations
  const handleAddItem = useCallback((parentId?: string) => {
    const maxSortOrder = items.length > 0
      ? Math.max(...items.filter(i => i.parent_id === (parentId || null)).map(i => i.sort_order))
      : 0;

    setEditingItem({
      id: '',
      template_id: templateId,
      parent_id: parentId || null,
      item_code: '',
      item_name: '',
      item_type: 'checkbox' as ItemType,
      description: '',
      options: '',
      required: false,
      sort_order: maxSortOrder + 1,
      created_at: '',
      updated_at: '',
    });
    setItemDialogOpen(true);
  }, [templateId, items]);

  const handleEditItem = useCallback((item: ChecksheetItem) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!editingItem) return;

    try {
      setSaveLoading(true);

      if (!editingItem.id) {
        // Create new item
        const response = await inspectionApi.post('/items', editingItem);
        setItems([...items, response.item]);
        await showSuccessMessage('COMMON_CREATE_SUCCESS');
      } else {
        // Update existing item
        const response = await inspectionApi.put(`/items/${editingItem.id}`, editingItem);
        setItems(items.map(i => i.id === editingItem.id ? response.item : i));
        await showSuccessMessage('COMMON_UPDATE_SUCCESS');
      }

      setItemDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingItem, items, showSuccessMessage, showErrorMessage]);

  const handleDeleteItemClick = useCallback((itemId: string) => {
    setSelectedItemForDelete(itemId);
    setDeleteItemConfirmOpen(true);
  }, []);

  const handleDeleteItemConfirm = useCallback(async () => {
    if (!selectedItemForDelete) return;

    try {
      setSaveLoading(true);
      await inspectionApi.delete(`/items/${selectedItemForDelete}`);

      // Remove item and its children
      const removeItemAndChildren = (itemId: string) => {
        const childIds = items.filter(i => i.parent_id === itemId).map(i => i.id);
        childIds.forEach(removeItemAndChildren);
        setItems(prev => prev.filter(i => i.id !== itemId && !childIds.includes(i.id)));
      };
      removeItemAndChildren(selectedItemForDelete);

      await showSuccessMessage('COMMON_DELETE_SUCCESS');
      setDeleteItemConfirmOpen(false);
      setSelectedItemForDelete(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      await showErrorMessage('COMMON_DELETE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [selectedItemForDelete, items, showSuccessMessage, showErrorMessage]);

  const handleDeleteItemCancel = useCallback(() => {
    setDeleteItemConfirmOpen(false);
    setSelectedItemForDelete(null);
  }, []);

  // Reorder items
  const handleReorderItems = useCallback(async (reorderedItems: ChecksheetItem[]) => {
    try {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        sort_order: index + 1,
      }));

      await inspectionApi.put('/items/reorder', { items: updates });
      setItems(reorderedItems);
    } catch (error) {
      console.error('Failed to reorder items:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    }
  }, [showErrorMessage]);

  // Build tree structure from flat items
  const buildItemTree = useCallback((flatItems: ChecksheetItem[]): ChecksheetItem[] => {
    const itemMap = new Map<string, ChecksheetItem>();
    const roots: ChecksheetItem[] = [];

    // First pass: create map
    flatItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [], level: 0 });
    });

    // Second pass: build tree
    flatItems.forEach(item => {
      const node = itemMap.get(item.id)!;
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(node);
        node.level = (parent.level || 0) + 1;
      } else {
        roots.push(node);
      }
    });

    // Sort children by sort_order
    const sortChildren = (items: ChecksheetItem[]) => {
      items.sort((a, b) => a.sort_order - b.sort_order);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };
    sortChildren(roots);

    return roots;
  }, []);

  // Initial fetch
  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, fetchTemplate]);

  return {
    // State
    template,
    editingTemplate,
    setEditingTemplate,
    items,
    itemTree: buildItemTree(items),
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

    // Handlers
    fetchTemplate,
    handleSaveTemplate,
    handleCancelEdit,
    handleAddItem,
    handleEditItem,
    handleSaveItem,
    handleDeleteItemClick,
    handleDeleteItemConfirm,
    handleDeleteItemCancel,
    handleReorderItems,
  };
};
