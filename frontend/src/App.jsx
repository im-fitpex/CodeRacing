import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header/Header';
import ChatBot from './components/ChatBot/ChatBot';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import Recommendations from './pages/Recommendations/Recommendations';
import VideoFeed from './pages/VideoFeed/VideoFeed';
import AppDetails from './pages/AppDetails/AppDetails';
import Categories from './pages/Categories/Categories';
import Search from './pages/Search/Search';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const location = useLocation();
  
  // Hide chat on video feed page
  const showChat = !location.pathname.includes('/video-feed');

  return (
    <div className="app">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/app/:id" element={<AppDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        
        {/* Protected Routes */}
        <Route 
          path="/recommendations" 
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/video-feed" 
          element={
            <ProtectedRoute>
              <VideoFeed />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {/* AI Chat Bot - показывается везде кроме видео */}
      {showChat && <ChatBot />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
