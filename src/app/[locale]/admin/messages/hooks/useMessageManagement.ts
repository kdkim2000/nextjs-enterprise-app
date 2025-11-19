import { useState, useCallback, useEffect } from 'react';
import { GridRowSelectionModel, GridPaginationModel } from '@mui/x-data-grid';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { Message } from '../types';
import { MessageFormData } from '@/components/admin/MessageFormFields';
import { SearchCriteria } from '../utils';

export function useMessageManagement() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    code: '',
    category: '',
    type: '',
    messageText: '',
    status: ''
  });
  const [quickSearch, setQuickSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageFormData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<GridRowSelectionModel>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });
  const [rowCount, setRowCount] = useState(0);

  // Use unified message system
  const locale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage,
    clearMessages
  } = useMessage({ locale });

  // Fetch messages
  const fetchMessages = useCallback(async (search?: string, criteria?: SearchCriteria) => {
    try {
      setSearching(true);
      clearMessages();

      const data = await api.get('/message');
      let fetchedMessages = data.messages || [];

      // Apply advanced filter if exists
      if (criteria) {
        fetchedMessages = fetchedMessages.filter((message: Message) => {
          if (criteria.code && !message.code.toLowerCase().includes(criteria.code.toLowerCase())) {
            return false;
          }
          if (criteria.category && message.category !== criteria.category) {
            return false;
          }
          if (criteria.type && message.type !== criteria.type) {
            return false;
          }
          if (criteria.messageText) {
            const searchText = criteria.messageText.toLowerCase();
            if (!message.message?.en?.toLowerCase().includes(searchText) &&
                !message.message?.ko?.toLowerCase().includes(searchText)) {
              return false;
            }
          }
          if (criteria.status && message.status !== criteria.status) {
            return false;
          }
          return true;
        });
      }

      // Apply quick search filter if exists
      if (search && search.trim()) {
        const lowercaseSearch = search.toLowerCase();
        fetchedMessages = fetchedMessages.filter((message: Message) =>
          message.code.toLowerCase().includes(lowercaseSearch) ||
          message.category.toLowerCase().includes(lowercaseSearch) ||
          message.type.toLowerCase().includes(lowercaseSearch) ||
          message.message?.en?.toLowerCase().includes(lowercaseSearch) ||
          message.message?.ko?.toLowerCase().includes(lowercaseSearch) ||
          message.description?.en?.toLowerCase().includes(lowercaseSearch) ||
          message.description?.ko?.toLowerCase().includes(lowercaseSearch)
        );
      }

      setMessages(fetchedMessages);
      setRowCount(fetchedMessages.length);
    } catch (error) {
      console.error('Error fetching messages:', error);
      await showErrorMessage('CRUD_MESSAGE_LOAD_FAIL');
    } finally {
      setSearching(false);
    }
  }, [clearMessages, showErrorMessage]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Search handlers
  const handleSearchChange = useCallback((name: string, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleQuickSearch = useCallback(() => {
    fetchMessages(quickSearch, searchCriteria);
  }, [quickSearch, searchCriteria, fetchMessages]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria({
      code: '',
      category: '',
      type: '',
      messageText: '',
      status: ''
    });
    fetchMessages();
  }, [fetchMessages]);

  const handleAdvancedFilterApply = useCallback(() => {
    fetchMessages(quickSearch, searchCriteria);
    setAdvancedFilterOpen(false);
  }, [quickSearch, searchCriteria, fetchMessages]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  // Add handler
  const handleAdd = useCallback(() => {
    setEditingMessage({
      code: '',
      category: 'common',
      type: 'info',
      message: { en: '', ko: '', zh: '', vi: '' },
      description: { en: '', ko: '', zh: '', vi: '' },
      status: 'active'
    });
    setDialogOpen(true);
  }, []);

  // Edit handler
  const handleEdit = useCallback((id: string | number) => {
    const message = messages.find((m) => m.id === id);
    if (message) {
      setEditingMessage({
        id: message.id,
        code: message.code,
        category: message.category,
        type: message.type,
        message: {
          en: message.message?.en || '',
          ko: message.message?.ko || '',
          zh: message.message?.zh || '',
          vi: message.message?.vi || ''
        },
        description: {
          en: message.description?.en || '',
          ko: message.description?.ko || '',
          zh: message.description?.zh || '',
          vi: message.description?.vi || ''
        },
        status: message.status
      });
      setDialogOpen(true);
    }
  }, [messages]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!editingMessage) return;

    try {
      setSaveLoading(true);

      // Validate required fields
      if (!editingMessage.code || !editingMessage.category || !editingMessage.type ||
          !editingMessage.message?.en || !editingMessage.message?.ko ||
          !editingMessage.message?.zh || !editingMessage.message?.vi ||
          !editingMessage.description?.en || !editingMessage.description?.ko ||
          !editingMessage.description?.zh || !editingMessage.description?.vi) {
        await showErrorMessage('VALIDATION_REQUIRED_FIELDS');
        return;
      }

      if (editingMessage.id) {
        // Update existing message
        await api.put(`/message/${editingMessage.id}`, editingMessage);
        await showSuccessMessage('CRUD_MESSAGE_UPDATE_SUCCESS');
      } else {
        // Create new message
        await api.post('/message', editingMessage);
        await showSuccessMessage('CRUD_MESSAGE_CREATE_SUCCESS');
      }

      await fetchMessages(quickSearch);
      setDialogOpen(false);
      setEditingMessage(null);
    } catch (error) {
      console.error('Error saving message:', error);
      await showErrorMessage('CRUD_MESSAGE_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingMessage, fetchMessages, quickSearch, showSuccessMessage, showErrorMessage]);

  // Delete handlers
  const handleDeleteClick = useCallback((selection: GridRowSelectionModel) => {
    setSelectedForDelete(selection);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete all selected messages
      await Promise.all(
        selectedForDelete.map((id) => api.delete(`/message/${id}`))
      );

      await fetchMessages(quickSearch);
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_MESSAGE_DELETE_SUCCESS', { count });
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (error) {
      console.error('Error deleting messages:', error);
      await showErrorMessage('CRUD_MESSAGE_DELETE_FAIL');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, fetchMessages, quickSearch, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchMessages(quickSearch);
  }, [fetchMessages, quickSearch]);

  // Pagination handler
  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  return {
    // State
    messages,
    setMessages,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingMessage,
    setEditingMessage,
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
    handlePaginationModelChange,
    setDialogOpen
  };
}
