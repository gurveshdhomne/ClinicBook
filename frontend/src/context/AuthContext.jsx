import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cb_user'));
    } catch {
      return null;
    }
  });

  const save = ({ token, user }) => {
    localStorage.setItem('cb_token', token);
    localStorage.setItem('cb_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (payload) => save((await api.post('/auth/register', payload)).data);
  const logout = () => {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
