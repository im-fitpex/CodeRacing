import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import SearchBar from '../SearchBar/SearchBar';
import './Header.css';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            {showMenu ? <FiX /> : <FiMenu />}
          </button>
          <div className="logo" onClick={() => navigate('/')}>
            <img src="/logo-rustore.svg" alt="RuStore" />
            <span className="logo-text">RuStore</span>
          </div>
        </div>

        <nav className={`nav-menu ${showMenu ? 'show' : ''}`}>
          <a href="/" className="nav-link">Главная</a>
          <a href="/categories" className="nav-link">Категории</a>
          <a href="/apps/games" className="nav-link">Игры</a>
          <a href="/apps" className="nav-link">Приложения</a>
        </nav>

        <div className="header-right">
          <button className="search-btn" onClick={() => setShowSearch(!showSearch)}>
            <FiSearch />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-overlay">
          <SearchBar onClose={() => setShowSearch(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
