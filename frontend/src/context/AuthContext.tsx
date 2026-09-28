import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  quickLogin: (role: 'FARMER' | 'OFFICIAL' | 'ADMIN') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('optifreight_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { identifier, password: pass });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        localStorage.setItem('optifreight_token', newToken);
        setToken(newToken);
        setUser(newUser);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const quickLogin = async (role: 'FARMER' | 'OFFICIAL' | 'ADMIN') => {
    if (role === 'FARMER') {
      await login('9876543210', 'farmer123');
    } else if (role === 'OFFICIAL') {
      await login('official@procurement.gov', 'official123');
    } else if (role === 'ADMIN') {
      await login('admin@procurement.gov', 'admin123');
    }
  };

  const logout = () => {
    localStorage.removeItem('optifreight_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
