import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authSession } from './authSession.js';
import { authService } from './authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authSession.getToken());
  const [user, setUser] = useState(() => authSession.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);

  useEffect(() => {
    // Subscribe to global 401 invalidation from httpClient/authSession
    const unsubscribe = authSession.subscribeToInvalidation((msg) => {
      setToken(null);
      setUser(null);
      setFlashMessage(msg || 'Sesi Anda telah kedaluwarsa. Silakan masuk kembali.');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password, role = 'user' }) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password, role });
      const newToken = res.token;
      const newUser = res.user;
      authSession.setSession(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
      setFlashMessage(null);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await authService.register({ email, password });
      const newToken = res.token;
      const newUser = res.user;
      authSession.setSession(newToken, newUser);
      setToken(newToken);
      setUser(newUser);
      setFlashMessage(null);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authSession.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async ({ password, permanent = false }) => {
    setIsLoading(true);
    try {
      const res = await authService.deleteAccount({ password, permanent });
      authSession.clearSession();
      setToken(null);
      setUser(null);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearFlashMessage = useCallback(() => {
    setFlashMessage(null);
  }, []);

  const value = {
    token,
    user,
    role: user ? user.role : null,
    isAuthenticated: !!token && !!user,
    isLoading,
    flashMessage,
    clearFlashMessage,
    login,
    register,
    logout,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
