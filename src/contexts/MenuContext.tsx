'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import { MenuItem } from '@/types/menu';
import { adminApi } from '@/lib/axios';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';
import { useMobile } from '@/hooks/useMobile';

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
  const { isMobileLayout } = useMobile();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [favoriteMenus, setFavoriteMenus] = useState<MenuItem[]>([]);
  const [recentMenus, setRecentMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedPathRef = useRef<string>('');
  const isFetchingByPathRef = useRef<boolean>(false);
  const lastPlatformRef = useRef<string>('');

  // Get current platform based on screen size
  const platform = isMobileLayout ? 'mobile' : 'desktop';

  // Fetch user's accessible menus
  const fetchMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setMenus([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await adminApi.get('/menus/user-menus', {
        params: { platform }
      });
      setMenus(response.menus || []);
      setError(null);
      lastPlatformRef.current = platform;
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { status?: number } };
      // Only log non-401 errors (401 is expected when not authenticated)
      if ((err as any)?.response?.status !== 401) {
        setError(error.message || 'Failed to fetch menus');
        console.error('Error fetching menus:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, platform]);

  // Fetch favorite menus
  const fetchFavoriteMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavoriteMenus([]);
      return;
    }

    try {
      const response = await adminApi.get('/users/favorite-menus');
      setFavoriteMenus(response.menus || []);
    } catch (err: unknown) {
      // Only log non-401 errors (401 is expected when not authenticated)
      if ((err as any)?.response?.status !== 401) {
        console.error('Error fetching favorite menus:', err);
      }
      // Set empty array on error to prevent UI issues
      setFavoriteMenus([]);
    }
  }, [isAuthenticated, user]);

  // Fetch recent menus
  const fetchRecentMenus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setRecentMenus([]);
      return;
    }

    try {
      const response = await adminApi.get('/users/recent-menus');
      setRecentMenus(response.menus || []);
    } catch (err: unknown) {
      // Only log non-401 errors (401 is expected when not authenticated)
      if ((err as any)?.response?.status !== 401) {
        console.error('Error fetching recent menus:', err);
      }
      // Set empty array on error to prevent UI issues
      setRecentMenus([]);
    }
  }, [isAuthenticated, user]);

  // Get menu by path with deduplication
  const getMenuByPath = useCallback(async (path: string): Promise<MenuItem | null> => {
    // Skip if not authenticated
    if (!isAuthenticated || !user) {
      return null;
    }

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

      const response = await adminApi.get('/menus/by-path', {
        params: { path }
      });
      const menu = response.menu || null;
      setCurrentMenu(menu);
      return menu;
    } catch (err: unknown) {
      // Only log non-401 errors (401 is expected when not authenticated)
      const error = err as { response?: { status?: number } };
      if (error.response?.status !== 401) {
        console.error('Error fetching menu by path:', err);
      }
      lastFetchedPathRef.current = ''; // Reset on error
      return null;
    } finally {
      isFetchingByPathRef.current = false;
    }
  }, [isAuthenticated, user]); // Depend on auth state

  // Add menu to favorites
  const addToFavorites = useCallback(async (menuId: string) => {
    try {
      await adminApi.post('/users/favorite-menus', { menuId });
      await fetchFavoriteMenus();
    } catch (err: unknown) {
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, [fetchFavoriteMenus]);

  // Remove menu from favorites
  const removeFromFavorites = useCallback(async (menuId: string) => {
    try {
      await adminApi.delete(`/users/favorite-menus/${menuId}`);
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
  // Note: We call APIs directly here instead of using fetchMenus/fetchFavoriteMenus/fetchRecentMenus
  // to avoid closure issues where the callback's captured isAuthenticated/user values might be stale
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch all menu data in parallel - call APIs directly to avoid stale closure values
      const loadMenus = async () => {
        setIsLoading(true);
        try {
          const [menusResponse, favoritesResponse, recentResponse] = await Promise.all([
            adminApi.get('/menus/user-menus', { params: { platform } }),
            adminApi.get('/users/favorite-menus'),
            adminApi.get('/users/recent-menus')
          ]);
          setMenus(menusResponse.menus || []);
          setFavoriteMenus(favoritesResponse.menus || []);
          setRecentMenus(recentResponse.menus || []);
          setError(null);
          lastPlatformRef.current = platform;
        } catch (error: any) {
          // Only log non-401 errors (401 is expected when not authenticated)
          if (error?.response?.status !== 401) {
            console.error('Error loading menus:', error);
            setError(error.message || 'Failed to fetch menus');
          }
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
  }, [isAuthenticated, user?.id, platform]); // Include platform to refetch when screen size changes

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
