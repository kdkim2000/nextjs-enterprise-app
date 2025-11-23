import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Post, SearchCriteria } from '../types';

interface UseBoardManagementOptions {
  storageKey?: string;
  boardTypeId: string;
}

export const useBoardManagement = (options: UseBoardManagementOptions) => {
  const { storageKey = 'board-list-page-state', boardTypeId } = options;

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
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // Local states
  const [searching, setSearching] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch posts from API
  const fetchPosts = useCallback(async (
    page: number = 0,
    pageSize: number = 20,
    useQuickSearch: boolean = false
  ) => {
    if (!boardTypeId) return;

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

      const response = await apiClient.get(`/post/board/${boardTypeId}?${params.toString()}`);

      if (response.posts) {
        // Normalize field names
        const normalizedPosts = response.posts.map((post: any) => ({
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
        if (response.pagination) {
          setRowCount(response.pagination.totalCount || 0);
        } else {
          setRowCount(normalizedPosts.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      await showErrorMessage('Failed to load posts');
      setPosts([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [boardTypeId, quickSearch, searchCriteria, setPosts, setRowCount, showErrorMessage]);

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
    setPosts([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 20 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setPosts, setRowCount, setPaginationModel, storageKey]);

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

  // Post view handlers
  const handlePostClick = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedPostId(null);
  }, []);

  // Initial fetch and refetch on criteria change
  useEffect(() => {
    if (boardTypeId) {
      const useQuickSearch = quickSearch.trim() !== '';
      fetchPosts(paginationModel.page, paginationModel.pageSize, useQuickSearch);
    }
  }, [fetchPosts, boardTypeId, quickSearch, paginationModel.page, paginationModel.pageSize]);

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
    selectedPostId,
    drawerOpen,

    // Handlers
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    handlePostClick,
    handleCloseDrawer
  };
};
