import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const name = searchParams.get('name');

    if (token && userId && name) {
      handleAuthCallback(token, parseInt(userId), name);
    } else {
      navigate('/login');
    }
  }, [searchParams, handleAuthCallback, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner-large"></div>
      <p>Авторизация...</p>
    </div>
  );
};

export default AuthCallback;
