import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import SearchModal from '../SearchModal/SearchModal';
import './Header.css';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            {showMenu ? <FiX /> : <FiMenu />}
          </button>

          <Link to="/" className="logo">
            <img src="/logo.svg" alt="RuStore" />
            <span className="logo-text">RuStore</span>
          </Link>
        </div>

        <nav className={`nav-menu ${showMenu ? 'show' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setShowMenu(false)}>
            Главная
          </Link>
          <Link to="/categories" className="nav-link" onClick={() => setShowMenu(false)}>
            Категории
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/recommendations" className="nav-link" onClick={() => setShowMenu(false)}>
                🎯 Рекомендации
              </Link>
              <Link to="/video-feed" className="nav-link" onClick={() => setShowMenu(false)}>
                🎬 Видео
              </Link>
            </>
          )}
        </nav>

        <div className="header-right">
          <button className="search-btn" onClick={() => setShowSearch(true)}>
            <FiSearch />
          </button>

          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-avatar-btn" 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FiUser />
                <span>{user?.name?.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="user-info">
                      <strong>{user?.name}</strong>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item">
                      <FiUser /> Профиль
                    </Link>
                    <button className="dropdown-item" onClick={logout}>
                      <FiLogOut /> Выйти
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              Войти
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </header>
  );
};

export default Header;
