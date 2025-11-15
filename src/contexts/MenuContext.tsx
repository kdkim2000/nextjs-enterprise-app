'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import { MenuItem } from '@/types/menu';
import { api } from '@/lib/axios';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';

interface MenuContextType {
  menus: MenuItem[];
  currentMenu: MenuItem | null;
  favoriteMenus: MenuItem[];
  recentMenus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  fetchMenus: () => Promise<void>;
  getMenuByPath: (path: string) => Promise<MenuItem | null>;
  addToFavorites: (menuId: string) => Promise<void>;
  removeFromFavorites: (menuId: string) => Promise<void>;
  isFavorite: (menuId: string) => boolean;
  refreshMenus: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [favoriteMenus, setFavoriteMenus] = useState<MenuItem[]>([]);
  const [recentMenus, setRecentMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedPathRef = useRef<string>('');
  const isFetchingByPathRef = useRef<boolean>(false);

  // Fetch user's accessible menus
  const fetchMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setMenus([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/menu/user-menus');
      setMenus(response.menus || []);
      setError(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to fetch menus');
      console.error('Error fetching menus:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch favorite menus
  const fetchFavoriteMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavoriteMenus([]);
      return;
    }

    try {
      const response = await api.get('/user/favorite-menus');
      setFavoriteMenus(response.menus || []);
    } catch (err: unknown) {
      console.error('Error fetching favorite menus:', err);
    }
  }, [isAuthenticated, user]);

  // Fetch recent menus
  const fetchRecentMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setRecentMenus([]);
      return;
    }

    try {
      const response = await api.get('/user/recent-menus');
      setRecentMenus(response.menus || []);
    } catch (err: unknown) {
      console.error('Error fetching recent menus:', err);
    }
  }, [isAuthenticated, user]);

  // Get menu by path with deduplication
  const getMenuByPath = useCallback(async (path: string): Promise<MenuItem | null> => {
    // Prevent duplicate fetches for the same path
    if (path === lastFetchedPathRef.current) {
      return null; // Return null to avoid setting state
    }

    // Prevent concurrent fetches
    if (isFetchingByPathRef.current) {
      return null;
    }

    try {
      isFetchingByPathRef.current = true;
      lastFetchedPathRef.current = path;

      const response = await api.get('/menu/by-path', {
        params: { path }
      });
      const menu = response.menu || null;
      setCurrentMenu(menu);
      return menu;
    } catch (err: unknown) {
      console.error('Error fetching menu by path:', err);
      lastFetchedPathRef.current = ''; // Reset on error
      return null;
    } finally {
      isFetchingByPathRef.current = false;
    }
  }, []); // Empty deps - stable function

  // Add menu to favorites
  const addToFavorites = useCallback(async (menuId: string) => {
    try {
      await api.post('/user/favorite-menus', { menuId });
      await fetchFavoriteMenus();
    } catch (err: unknown) {
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, [fetchFavoriteMenus]);

  // Remove menu from favorites
  const removeFromFavorites = useCallback(async (menuId: string) => {
    try {
      await api.delete(`/user/favorite-menus/${menuId}`);
      await fetchFavoriteMenus();
    } catch (err: unknown) {
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

  // Refresh all menu data
  const refreshMenus = useCallback(async () => {
    await Promise.all([
      fetchMenus(),
      fetchFavoriteMenus(),
      fetchRecentMenus()
    ]);
  }, [fetchMenus, fetchFavoriteMenus, fetchRecentMenus]);

  // Initial data fetch - only when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch all menu data in parallel
      const loadMenus = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchMenus(),
            fetchFavoriteMenus(),
            fetchRecentMenus()
          ]);
        } catch (error) {
          console.error('Error loading menus:', error);
        } finally {
          setIsLoading(false);
        }
      };
      void loadMenus();
    } else {
      setMenus([]);
      setFavoriteMenus([]);
      setRecentMenus([]);
      setCurrentMenu(null);
      setIsLoading(false);
    }
    // fetchMenus, fetchFavoriteMenus, fetchRecentMenus are stable (useCallback with stable deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]); // Only depend on auth state and user id

  const value: MenuContextType = useMemo(() => ({
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
    isFavorite,
    refreshMenus
  }), [
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
    isFavorite,
    refreshMenus
  ]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}
