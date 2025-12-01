/**
 * Simplified Mail Data Hook
 */
import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/axios';

export type FolderType = 'inbox' | 'sent' | 'draft' | 'trash';

export interface MailMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  recipient_id: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  body_html?: string;
  preview?: string;
  folder: FolderType;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

export interface FolderCounts {
  inbox: { total: number; unread: number };
  sent: { total: number; unread: number };
  draft: { total: number; unread: number };
  trash: { total: number; unread: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useMailData() {
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [counts, setCounts] = useState<FolderCounts | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderType>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  // Fetch messages
  const fetchMessages = useCallback(async (folder: FolderType = currentFolder, options?: { page?: number; search?: string }) => {
    setLoadingMessages(true);
    try {
      const params = new URLSearchParams();
      params.append('folder', folder);
      if (options?.page) params.append('page', String(options.page));
      if (options?.search) params.append('search', options.search);
      
      const response = await api.get(`/mail/messages?${params}`);
      setMessages(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentFolder]);

  // Fetch single message
  const getMessage = useCallback(async (id: string) => {
    const response = await api.get(`/mail/messages/${id}`);
    return response.data.data;
  }, []);

  // Fetch folder counts
  const fetchCounts = useCallback(async () => {
    try {
      const response = await api.get('/mail/counts');
      setCounts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  }, []);

  // Create draft
  const createDraft = useCallback(async (data: Partial<MailMessage>) => {
    const response = await api.post('/mail/draft', data);
    return response.data.data;
  }, []);

  // Update draft
  const updateDraft = useCallback(async (id: string, data: Partial<MailMessage>) => {
    const response = await api.put(`/mail/draft/${id}`, data);
    return response.data.data;
  }, []);

  // Send message
  const sendMessage = useCallback(async (data: { recipientId?: string; recipientName?: string; recipientEmail?: string; subject: string; body: string; bodyHtml?: string; draftId?: string }) => {
    const response = await api.post('/mail/send', data);
    await fetchCounts();
    return response.data.data;
  }, [fetchCounts]);

  // Move to trash
  const moveToTrash = useCallback(async (id: string) => {
    await api.put(`/mail/messages/${id}/trash`);
    setMessages(prev => prev.filter(m => m.id !== id));
    await fetchCounts();
  }, [fetchCounts]);

  // Restore from trash
  const restoreFromTrash = useCallback(async (id: string) => {
    await api.put(`/mail/messages/${id}/restore`);
    setMessages(prev => prev.filter(m => m.id !== id));
    await fetchCounts();
  }, [fetchCounts]);

  // Delete permanently
  const deletePermanently = useCallback(async (id: string) => {
    await api.delete(`/mail/messages/${id}`);
    setMessages(prev => prev.filter(m => m.id !== id));
    await fetchCounts();
  }, [fetchCounts]);

  // Mark as read/unread
  const markAsRead = useCallback(async (id: string, isRead = true) => {
    await api.put(`/mail/messages/${id}/read`, { isRead });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: isRead } : m));
    await fetchCounts();
  }, [fetchCounts]);

  // Bulk action
  const bulkAction = useCallback(async (messageIds: string[], action: string) => {
    await api.post('/mail/bulk', { messageIds, action });
    if (action === 'trash' || action === 'delete') {
      setMessages(prev => prev.filter(m => !messageIds.includes(m.id)));
    }
    setSelectedMessages([]);
    await fetchCounts();
  }, [fetchCounts]);

  // Selection helpers
  const toggleMessageSelection = useCallback((id: string) => {
    setSelectedMessages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const selectAllMessages = useCallback(() => {
    setSelectedMessages(messages.map(m => m.id));
  }, [messages]);

  const clearSelection = useCallback(() => {
    setSelectedMessages([]);
  }, []);

  // Change folder
  const changeFolder = useCallback((folder: FolderType) => {
    setCurrentFolder(folder);
    setSelectedMessage(null);
    setSelectedMessages([]);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchMessages(currentFolder);
    fetchCounts();
  }, [currentFolder]);

  return {
    messages,
    loadingMessages,
    pagination,
    counts,
    currentFolder,
    setCurrentFolder: changeFolder,
    selectedMessage,
    setSelectedMessage,
    selectedMessages,
    toggleMessageSelection,
    selectAllMessages,
    clearSelection,
    fetchMessages,
    getMessage,
    fetchCounts,
    createDraft,
    updateDraft,
    sendMessage,
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    markAsRead,
    bulkAction
  };
}
