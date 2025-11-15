import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppCard from '../../components/AppCard/AppCard';
import { useAuth } from '../../contexts/AuthContext';
import { FiRefreshCw, FiSliders } from 'react-icons/fi';
import './Recommendations.css';

const Recommendations = () => {
  const { user, token } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diversityFactor, setDiversityFactor] = useState(0.3);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user, diversityFactor]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/recommendations/personalized?limit=30&diversityFactor=${diversityFactor}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <div>
          <h1>🎯 Рекомендации для вас</h1>
          <p>Подобрано специально на основе ваших интересов</p>
        </div>

        <div className="recommendations-controls">
          <div className="diversity-control">
            <FiSliders />
            <label>
              Разнообразие
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={diversityFactor}
                onChange={(e) => setDiversityFactor(parseFloat(e.target.value))}
              />
            </label>
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
      ) : (
        <motion.div
          className="recommendations-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {recommendations.map((app) => (
            <motion.div
              key={app.appId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="recommendation-item"
            >
              <AppCard app={app} />
              <div className="recommendation-reason">
                {app.recommendationReason}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Recommendations;
