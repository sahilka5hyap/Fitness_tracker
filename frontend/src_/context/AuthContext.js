import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);


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

  const login = async (email, password) => {
    try {
      const res  = await fetch('https://fitness-backend-z4vd.onrender.com/api/users/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setNeedsOnboarding(false);
        return { success: true };
      } else {
        return { error: data.message || 'Invalid credentials' };
      }
    } catch {
      return { error: 'Server error. Is your backend running?' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res  = await fetch('https://fitness-backend-z4vd.onrender.com/api/users/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setNeedsOnboarding(true); // persisted via the useEffect above
        return { success: true };
      } else {
        return { error: data.message || 'Registration failed' };
      }
    } catch {
      return { error: 'Server error. Is your backend running?' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('needsOnboarding');
    setUser(null);
    setNeedsOnboarding(false);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loading, needsOnboarding, setNeedsOnboarding, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};