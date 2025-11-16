import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { appsAPI } from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import './SearchBar.css';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchApps(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const searchApps = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          top_k: 10,
        }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppClick = (appId) => {
    navigate(`/app/${appId}`);
    onClose();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Поиск приложений..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button className="clear-btn" onClick={clearSearch}>
            <FiX />
          </button>
        )}
      </div>

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
              key={app.app_id}
              className="search-result-item"
              onClick={() => handleAppClick(app.app_id)}
            >
              <img src={app.icon_url} alt={app.name} className="result-icon" />
              <div className="result-info">
                <h4>{app.name}</h4>
                <p>{app.developer}</p>
              </div>
              <span className="result-category">{app.category}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="search-empty">
          <p>Ничего не найдено по запросу "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
