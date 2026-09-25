import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, bookmarkService } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'campus_notes_token';
const SAVED_IDS_KEY = 'campus_notes_saved_ids';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_IDS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const fetchBookmarkIds = useCallback(async () => {
    try {
      const res = await bookmarkService.getBookmarkIds();
      if (res && res.data && Array.isArray(res.data)) {
        setSavedIds(res.data);
        localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(res.data));
      }
    } catch {
      // Ignored if unauthenticated or network error
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response && response.data) {
        setUser(response.data);
        fetchBookmarkIds();
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookmarkIds]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    fetchBookmarkIds();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SAVED_IDS_KEY);
    setToken(null);
    setUser(null);
    setSavedIds([]);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const toggleBookmark = async (resourceId) => {
    if (!resourceId) return false;
    
    // Optimistic UI update
    const exists = savedIds.includes(resourceId);
    const nextSavedIds = exists ? savedIds.filter((id) => id !== resourceId) : [...savedIds, resourceId];
    setSavedIds(nextSavedIds);
    localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(nextSavedIds));

    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      try {
        await bookmarkService.toggleBookmark(resourceId);
      } catch (err) {
        // Revert on failure
        setSavedIds(savedIds);
        localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(savedIds));
        throw err;
      }
    }
    return !exists;
  };

  const isSaved = (resourceId) => savedIds.includes(resourceId);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    savedIds,
    isSaved,
    toggleBookmark,
    login,
    logout,
    updateUser,
    refreshUser: fetchCurrentUser,
    refreshBookmarks: fetchBookmarkIds,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
