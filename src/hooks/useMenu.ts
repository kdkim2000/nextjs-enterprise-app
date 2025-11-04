'use client';

import { useState, useEffect, useCallback } from 'react';
import { MenuItem, UserPreferences } from '@/types/menu';
import { api } from '@/lib/axios';

export function useMenu() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [favoriteMenus, setFavoriteMenus] = useState<MenuItem[]>([]);
  const [recentMenus, setRecentMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's accessible menus
  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<MenuItem[]>('/menu/user-menus');
      setMenus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menus');
      console.error('Error fetching menus:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch favorite menus
  const fetchFavoriteMenus = useCallback(async () => {
    try {
      const data = await api.get<MenuItem[]>('/user/favorite-menus');
      setFavoriteMenus(data);
    } catch (err: any) {
      console.error('Error fetching favorite menus:', err);
    }
  }, []);

  // Fetch recent menus
  const fetchRecentMenus = useCallback(async () => {
    try {
      const data = await api.get<MenuItem[]>('/user/recent-menus');
      setRecentMenus(data);
    } catch (err: any) {
      console.error('Error fetching recent menus:', err);
    }
  }, []);

  // Get menu by path
  const getMenuByPath = useCallback(async (path: string) => {
    try {
      const data = await api.get<MenuItem>('/menu/by-path', {
        params: { path }
      });
      setCurrentMenu(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching menu by path:', err);
      throw err;
    }
  }, []);

  // Add menu to favorites
  const addToFavorites = useCallback(async (menuId: string) => {
    try {
      await api.post('/user/favorite-menus', { menuId });
      await fetchFavoriteMenus();
    } catch (err: any) {
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, [fetchFavoriteMenus]);

  // Remove menu from favorites
  const removeFromFavorites = useCallback(async (menuId: string) => {
    try {
      await api.delete(`/user/favorite-menus/${menuId}`);
      await fetchFavoriteMenus();
    } catch (err: any) {
      console.error('Error removing from favorites:', err);
      throw err;
    }
  }, [fetchFavoriteMenus]);

  // Check if menu is favorite
  const isFavorite = useCallback(
    (menuId: string) => {
      return favoriteMenus.some((menu) => menu.id === menuId);
    },
    [favoriteMenus]
  );

  useEffect(() => {
    fetchMenus();
    fetchFavoriteMenus();
    fetchRecentMenus();
  }, [fetchMenus, fetchFavoriteMenus, fetchRecentMenus]);

  return {
    menus,
    currentMenu,
    favoriteMenus,
    recentMenus,
    isLoading,
    error,
    fetchMenus,
    getMenuByPath,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
}
