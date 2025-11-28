import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Post, SearchCriteria } from '../types';

interface UseBoardManagementOptions {
  storageKey?: string;
  boardTypeId: string;
  boardType?: any;
}

export const useBoardManagement = (options: UseBoardManagementOptions) => {
  const { storageKey = 'board-list-page-state', boardTypeId, boardType } = options;
  const router = useRouter();

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: posts,
    setData: setPosts,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, Post>({
    storageKey,
    initialCriteria: {
      title: '',
      author_name: '',
      content: '',
      tags: '',
      category: '',
      status: '',
      is_pinned: '',
      is_secret: ''
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 20
    }
  });

  // Use unified message system
  const locale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccess,
    showError
  } = useMessage({ locale });

  // Local states
  const [searching, setSearching] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch posts from API
  const fetchPosts = useCallback(async (
    page: number = 0,
    pageSize: number = 20,
    useQuickSearch: boolean = false
  ) => {
    // Wait for boardType to be loaded
    if (!boardType || !boardType.id) return;

    try {
      setSearching(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search title and content
        params.append('search', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.title) params.append('title', searchCriteria.title);
        if (searchCriteria.content) params.append('content', searchCriteria.content);
        if (searchCriteria.author_name) params.append('author_name', searchCriteria.author_name);
        if (searchCriteria.tags) params.append('tags', searchCriteria.tags);
        if (searchCriteria.category) params.append('category', searchCriteria.category);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
        if (searchCriteria.is_pinned) params.append('is_pinned', searchCriteria.is_pinned);
        if (searchCriteria.is_secret) params.append('is_secret', searchCriteria.is_secret);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      // Use boardType.id instead of boardTypeId (which is the code)
      const url = `/post/board/${boardType.id}?${params.toString()}`;
      console.log('Fetching posts from:', url);
      const response = await apiClient.get(url);
      console.log('API Response:', response);

      if (response.success && response.data?.posts) {
        // Normalize field names
        const normalizedPosts = response.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author_id: post.authorId || post.author_id,
          author_name: post.authorName || post.author_name,
          author_username: post.authorUsername || post.author_username,
          board_type_id: post.boardTypeId || post.board_type_id,
          is_pinned: post.isPinned || post.is_pinned || false,
          is_secret: post.isSecret || post.is_secret || false,
          is_important: post.isImportant || post.is_important || false,
          view_count: post.viewCount || post.view_count || 0,
          like_count: post.likeCount || post.like_count || 0,
          comment_count: post.commentCount || post.comment_count || 0,
          attachment_count: post.attachmentCount || post.attachment_count || 0,
          tags: post.tags || [],
          category: post.category,
          status: post.status || 'published',
          created_at: post.createdAt || post.created_at,
          updated_at: post.updatedAt || post.updated_at
        }));
        setPosts(normalizedPosts);

        // Update row count for DataGrid
        if (response.data.pagination) {
          setRowCount(response.data.pagination.totalCount || 0);
        } else {
          setRowCount(normalizedPosts.length);
        }
      } else {
        console.log('No posts in response or request failed');
        setPosts([]);
        setRowCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showError('Failed to load posts');
      setPosts([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [boardType, quickSearch, searchCriteria, setPosts, setRowCount, showError]);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPosts(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchPosts, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPosts(0, paginationModel.pageSize, true);
  }, [fetchPosts, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setPaginationModel({ page: 0, pageSize: 20 });
    sessionStorage.removeItem(storageKey);
    // Fetch posts without quick search to show all posts
    fetchPosts(0, 20, false);
  }, [setQuickSearch, setPaginationModel, storageKey, fetchPosts]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPosts(0, paginationModel.pageSize, false);
  }, [fetchPosts, paginationModel, setPaginationModel]);

  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
    handleAdvancedSearch();
  }, [handleAdvancedSearch]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback((newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPosts(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchPosts, quickSearch, setPaginationModel]);

  // Post CRUD operations
  const handleAdd = useCallback(() => {
    setEditingPost({
      id: '',
      title: '',
      content: '',
      tags: [],
      is_pinned: false,
      is_secret: false,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      attachment_count: 0,
      status: 'published',
      created_at: new Date().toISOString()
    });
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingPost) return;

    // Validation
    if (!editingPost.title.trim()) {
      showError('Please enter a title');
      return;
    }
    if (!editingPost.content?.trim() || editingPost.content === '<p></p>') {
      showError('Please enter content');
      return;
    }

    try {
      setSaveLoading(true);

      const postData = {
        ...(editingPost.id ? {} : { boardTypeId: boardType?.id }),
        title: editingPost.title.trim(),
        content: editingPost.content,
        tags: editingPost.tags || [],
        isSecret: editingPost.is_secret,
        isPinned: editingPost.is_pinned,
        showPopup: (editingPost as any).showPopup,
        displayStartDate: (editingPost as any).displayStartDate,
        displayEndDate: (editingPost as any).displayEndDate,
        status: 'published',
        // Pass attachmentId to link uploaded files to the post
        ...((editingPost as any).attachmentId && { attachmentId: (editingPost as any).attachmentId })
      };

      console.log('[useBoardManagement] Saving post with data:', {
        ...postData,
        content: postData.content?.substring(0, 50) + '...'
      });

      if (!editingPost.id) {
        // Create new post
        const response = await apiClient.post('/post', postData);
        if (response.success && response.data) {
          showSuccess('Post created successfully!');
          handleRefresh();
        } else {
          throw new Error(response.error || 'Failed to create post');
        }
      } else {
        // Update existing post
        const response = await apiClient.put(`/post/${editingPost.id}`, postData);
        if (response.success) {
          showSuccess('Post updated successfully!');
          handleRefresh();
        } else {
          throw new Error(response.error || 'Failed to update post');
        }
      }

      setModalOpen(false);
      setEditingPost(null);
    } catch (error: any) {
      console.error('Failed to save post:', error);
      showError(error.message || 'Failed to save post');
    } finally {
      setSaveLoading(false);
    }
  }, [editingPost, boardType, showSuccess, showError, handleRefresh]);

  // Post view handlers - Navigate to detail page instead of opening drawer
  const handlePostClick = useCallback((postId: string) => {
    router.push(`/boards/${boardTypeId}/${postId}`);
  }, [router, boardTypeId]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingPost(null);
  }, []);

  // Delete handler - opens confirmation dialog
  const handleDelete = useCallback((ids: (string | number)[]) => {
    if (!ids || ids.length === 0) return;
    setDeleteTargetIds(ids);
    setDeleteDialogOpen(true);
  }, []);

  // Confirm delete - executes the deletion
  const handleConfirmDelete = useCallback(async () => {
    if (deleteTargetIds.length === 0) return;

    try {
      setDeleteLoading(true);

      // Delete posts one by one
      const deletePromises = deleteTargetIds.map(id => apiClient.delete(`/post/${id}`));
      const results = await Promise.allSettled(deletePromises);

      // Count successes and failures
      const successes = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
      const failures = results.length - successes;

      if (successes > 0) {
        showSuccess(`Successfully deleted ${successes} post${successes > 1 ? 's' : ''}`);
        handleRefresh();
      }

      if (failures > 0) {
        showError(`Failed to delete ${failures} post${failures > 1 ? 's' : ''}`);
      }

      // Close dialog
      setDeleteDialogOpen(false);
      setDeleteTargetIds([]);
    } catch (error: any) {
      console.error('Error deleting posts:', error);
      showError('Failed to delete posts');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTargetIds, showSuccess, showError, handleRefresh]);

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTargetIds([]);
  }, []);

  // Initial fetch and refetch on criteria change
  useEffect(() => {
    if (boardType?.id) {
      console.log('Fetching posts for boardType:', boardType.id);
      const useQuickSearch = quickSearch.trim() !== '';
      fetchPosts(paginationModel.page, paginationModel.pageSize, useQuickSearch);
    } else {
      console.log('BoardType not loaded yet, skipping fetch');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardType?.id, quickSearch, paginationModel.page, paginationModel.pageSize]);

  return {
    // State
    posts,
    setPosts,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    successMessage,
    errorMessage,
    modalOpen,
    setModalOpen,
    editingPost,
    setEditingPost,
    saveLoading,
    deleteDialogOpen,
    deleteTargetIds,
    setDeleteTargetIds,
    deleteLoading,

    // Handlers
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    handleAdd,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handlePostClick,
    handleCloseModal
  };
};
