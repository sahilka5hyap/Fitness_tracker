import React, { createContext, useState, useEffect } from 'react';
import api, { setUnauthorizedHandler } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState('');

  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    return localStorage.getItem('needsOnboarding') === 'true';
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // Keep localStorage in sync whenever needsOnboarding changes
  useEffect(() => {
    localStorage.setItem('needsOnboarding', needsOnboarding ? 'true' : 'false');
  }, [needsOnboarding]);

  const logout = React.useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('needsOnboarding');
    setUser(null);
    setNeedsOnboarding(false);
  }, []);

  // Any 401 from any api.js call (expired/invalid token) auto-logs the user out
  // and shows a message on the next Login screen, instead of every page
  // silently failing with a generic error.
  useEffect(() => {
    setUnauthorizedHandler((message) => {
      setSessionMessage(message || 'Your session expired. Please log in again.');
      logout();
    });
  }, [logout]);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setNeedsOnboarding(false);
      setSessionMessage('');
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Invalid credentials' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setNeedsOnboarding(true); // persisted via the useEffect above
      setSessionMessage('');
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Registration failed' };
    }
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, needsOnboarding, setNeedsOnboarding,
      login, register, logout, updateUser,
      sessionMessage, clearSessionMessage: () => setSessionMessage(''),
    }}>
      {children}
    </AuthContext.Provider>
  );
};
