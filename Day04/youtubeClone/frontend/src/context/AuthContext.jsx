import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.currentUser();
      setUser(data?.data || null);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    await authApi.login(credentials);
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [user, loading, error, fetchCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
