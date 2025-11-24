import { useState, useEffect, useCallback } from 'react';
import { Post, PostSearchCriteria } from '../types';
import { buildQueryParams } from '../utils';
import { apiClient } from '@/lib/api/client';

export const usePostManagement = () => {
  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [boardTypes, setBoardTypes] = useState<Array<{ id: string; code: string; name_en: string; name_ko: string }>>([]);
  const [searchCriteria, setSearchCriteria] = useState<PostSearchCriteria>({});
  const [quickSearch, setQuickSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Fetch board types for filter
  const fetchBoardTypes = useCallback(async () => {
    try {
      const response = await apiClient.get('/board-type/all');
      if (response.success) {
        setBoardTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching board types:', error);
    }
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setSearching(true);
      const queryString = buildQueryParams(quickSearch, searchCriteria, paginationModel);
      const response = await apiClient.get(`/post?${queryString}`);

      if (response.success) {
        setPosts(response.data.items || []);
        setRowCount(response.data.pagination?.total || 0);
      } else {
        setErrorMessage(response.error || 'Failed to fetch posts');
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setErrorMessage(error.message || 'Failed to fetch posts');
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, paginationModel]);

  // Initial fetch
  useEffect(() => {
    fetchBoardTypes();
  }, [fetchBoardTypes]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handlers
  const handleView = useCallback((post: Post) => {
    setSelectedPost(post);
    setViewDialogOpen(true);
  }, []);

  const handleEdit = useCallback((post: Post) => {
    // Navigate to edit page
    window.location.href = `/boards/${post.board_type_code}/${post.id}/edit`;
  }, []);

  const handleApprove = useCallback(
    async (post: Post) => {
      try {
        const response = await apiClient.post(`/post/${post.id}/approve`);
        if (response.success) {
          setSuccessMessage('Post approved successfully');
          fetchPosts();
        } else {
          setErrorMessage(response.error || 'Failed to approve post');
        }
      } catch (error: any) {
        console.error('Error approving post:', error);
        setErrorMessage(error.message || 'Failed to approve post');
      }
    },
    [fetchPosts]
  );

  const handlePin = useCallback(
    async (post: Post) => {
      try {
        const response = post.is_pinned
          ? await apiClient.post(`/post/${post.id}/unpin`)
          : await apiClient.post(`/post/${post.id}/pin`);

        if (response.success) {
          setSuccessMessage(post.is_pinned ? 'Post unpinned successfully' : 'Post pinned successfully');
          fetchPosts();
        } else {
          setErrorMessage(response.error || 'Failed to update pin status');
        }
      } catch (error: any) {
        console.error('Error updating pin status:', error);
        setErrorMessage(error.message || 'Failed to update pin status');
      }
    },
    [fetchPosts]
  );

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        const response = await apiClient.delete(`/post/${id}`);
        if (!response.success) {
          throw new Error(response.error || `Failed to delete post ${id}`);
        }
      }

      setSuccessMessage(`${selectedForDelete.length} post(s) deleted successfully`);
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting posts:', error);
      setErrorMessage(error.message || 'Failed to delete posts');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, fetchPosts]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = useCallback((field: string, value: any) => {
    setSearchCriteria((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setSearchCriteria({});
    fetchPosts();
  }, [fetchPosts]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria({});
    setPaginationModel({ page: 0, pageSize: 20 });
  }, []);

  const handleAdvancedFilterApply = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setQuickSearch('');
    setAdvancedFilterOpen(false);
    fetchPosts();
  }, [fetchPosts]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback((newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
  }, []);

  return {
    // State
    posts,
    setPosts,
    boardTypes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    viewDialogOpen,
    setViewDialogOpen,
    selectedPost,
    // Handlers
    handleView,
    handleEdit,
    handleApprove,
    handlePin,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange
  };
};
