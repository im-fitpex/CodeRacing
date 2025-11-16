import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppCard from '../../components/AppCard/AppCard';
import { FiRefreshCw, FiSliders, FiTrendingUp } from 'react-icons/fi';
import { appsAPI } from '../../services/api';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diversityFactor, setDiversityFactor] = useState(0.3);
  const [filterType, setFilterType] = useState('all'); // all, popular, editor-choice, new

  useEffect(() => {
    loadRecommendations();
  }, [diversityFactor, filterType]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      let response;
      
      // Загружаем рекомендации на основе выбранного типа
      switch(filterType) {
        case 'popular':
          response = await appsAPI.getPopular();
          break;
        case 'editor-choice':
          response = await appsAPI.getEditorChoice();
          break;
        case 'new':
          response = await appsAPI.getNew();
          break;
        default:
          // По умолчанию показываем комбинацию популярных и рекомендованных
          const [popular, editorChoice] = await Promise.all([
            appsAPI.getPopular(),
            appsAPI.getEditorChoice()
          ]);
          response = { data: [...(editorChoice.data || []), ...(popular.data || [])] };
      }
      
      setRecommendations(response.data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <div>
          <h1>🎯 Рекомендации для вас</h1>
          <p>Популярные и рекомендуемые приложения</p>
        </div>

        <div className="recommendations-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Все
            </button>
            <button
              className={`filter-tab ${filterType === 'popular' ? 'active' : ''}`}
              onClick={() => setFilterType('popular')}
            >
              Популярное
            </button>
            <button
              className={`filter-tab ${filterType === 'editor-choice' ? 'active' : ''}`}
              onClick={() => setFilterType('editor-choice')}
            >
              Выбор редакции
            </button>
            <button
              className={`filter-tab ${filterType === 'new' ? 'active' : ''}`}
              onClick={() => setFilterType('new')}
            >
              Новинки
            </button>
          </div>

          <button className="btn-refresh" onClick={loadRecommendations}>
            <FiRefreshCw />
            Обновить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <motion.div
          className="recommendations-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {recommendations.map((app) => (
            <motion.div
              key={app.id || app.app_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="recommendation-item"
            >
              <AppCard app={app} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <FiTrendingUp className="empty-icon" />
          <h2>Рекомендаций не найдено</h2>
          <p>Попробуйте обновить или выбрать другой фильтр</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
