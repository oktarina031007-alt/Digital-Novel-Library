import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; bio?: string; avatarUrl?: string; newPassword?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user on start or auto-initialize with demo account for instant exploration
  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (stored) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
          setToken(stored);
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Session expired or invalid, re-initializing demo session:', err);
          setStoredToken(null);
          setToken(null);
          setUser(null);
        }
      }

      // Auto login as default demo user if fresh session so user sees complete populated library
      try {
        const res = await api.login({ email: 'demo@novelbox.app', password: 'password123' });
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
      } catch (e) {
        console.warn('Demo login failed:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    return login('demo@novelbox.app', 'password123');
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; bio?: string; avatarUrl?: string; newPassword?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
