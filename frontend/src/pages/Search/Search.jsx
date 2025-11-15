import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppCard from '../../components/AppCard/AppCard';
import { FiSearch } from 'react-icons/fi';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/apps/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Результаты поиска</h1>
        {query && (
          <p className="search-query">
            По запросу: <strong>"{query}"</strong>
          </p>
        )}
      </div>

      {loading ? (
        <div className="search-loading">
          <div className="spinner-large"></div>
          <p>Ищем приложения...</p>
        </div>
      ) : results.length > 0 ? (
        <motion.div
          className="search-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="results-count">Найдено: {results.length} приложений</p>
          <div className="apps-grid">
            {results.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="no-results">
          <FiSearch className="no-results-icon" />
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить запрос или использовать другие ключевые слова</p>
        </div>
      )}
    </div>
  );
};

export default Search;
