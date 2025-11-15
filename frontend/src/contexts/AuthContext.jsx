import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored auth
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const loginWithVK = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/vk';
  };

  const handleAuthCallback = (token, userId, name) => {
    const userData = { id: userId, name };
    
    setToken(token);
    setUser(userData);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    navigate('/');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    loginWithVK,
    handleAuthCallback,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
