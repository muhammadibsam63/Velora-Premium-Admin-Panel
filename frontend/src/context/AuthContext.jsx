import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('velora_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('velora_token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async (tok) => {
    try {
      const data = await api.get('/auth/me', { token: tok });
      if (data.success) {
        setUser(data.user);
        return data.user;
      }
      logout();
      return null;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      fetchMe(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchMe]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('velora_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const signup = async (fullName, email, password) => {
    const data = await api.post('/auth/signup', { fullName, email, password });
    if (data.success) {
      localStorage.setItem('velora_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isAuthenticated,
        login,
        signup,
        logout,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
