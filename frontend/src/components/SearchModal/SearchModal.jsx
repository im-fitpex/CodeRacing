import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import './SearchModal.css';

const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-focus input
    inputRef.current?.focus();

    // Load recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);

    // Close on Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (query.trim().length > 2) {
      const debounce = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/apps/search?query=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchQuery, ...recent.filter(q => q !== searchQuery)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search page
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  const handleResultClick = (app) => {
    navigate(`/app/${app.id}`);
    onClose();
  };

  return (
    <motion.div
      className="search-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="search-modal"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="search-input-container">
          <FiSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск приложений..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(query);
            }}
            className="search-input"
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery('')}>
              <FiX />
            </button>
          )}
        </div>

        <div className="search-results-container">
          {loading && (
            <div className="search-loading">
              <div className="spinner"></div>
              <span>Поиск...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results">
              {results.map((app) => (
                <div
                  key={app.id}
                  className="search-result-item"
                  onClick={() => handleResultClick(app)}
                >
                  <img src={app.iconUrl} alt={app.name} className="result-icon" />
                  <div className="result-info">
                    <h4>{app.name}</h4>
                    <p>{app.category}</p>
                  </div>
                  <div className="result-rating">
                    ⭐ {app.rating.toFixed(1)}
                  </div>
                </div>
              ))}
              
              {results.length >= 5 && (
                <button
                  className="view-all-results"
                  onClick={() => handleSearch(query)}
                >
                  Показать все результаты →
                </button>
              )}
            </div>
          )}

          {!loading && query.length > 2 && results.length === 0 && (
            <div className="no-results-message">
              <p>Ничего не найдено по запросу "{query}"</p>
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="recent-searches">
              <h4>
                <FiTrendingUp /> Недавние поиски
              </h4>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="recent-search-item"
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                >
                  <FiSearch />
                  <span>{search}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchModal;
