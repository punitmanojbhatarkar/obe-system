import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('obe_user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('obe_token');
    if (token) {
      API.get('/auth/me').then(res => {
        setUser(res.data);
        localStorage.setItem('obe_user', JSON.stringify(res.data));
      }).catch(() => {
        localStorage.removeItem('obe_token');
        localStorage.removeItem('obe_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (employeeId, password, role) => {
    const res = await API.post('/auth/login', { employeeId, password, role });
    localStorage.setItem('obe_token', res.data.token);
    localStorage.setItem('obe_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('obe_token');
    localStorage.removeItem('obe_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
