import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './AppCard.css';

const AppCard = ({ app }) => {
  const navigate = useNavigate();

  const formatDownloads = (downloads) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads;
  };

  return (
    <motion.div
      className="app-card"
      onClick={() => navigate(`/app/${app.id}`)}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 102, 255, 0.15)' }}
      transition={{ duration: 0.2 }}
    >
      {/* BADGES - Правый верхний угол */}
      {(app.isEditorChoice || app.isNew || app.isPopular) && (
        <div className="app-card-badges">
          {app.isEditorChoice && (
            <span className="badge badge-editor">⭐ Выбор редакции</span>
          )}
          {app.isNew && <span className="badge badge-new">🆕 Новинка</span>}
          {app.isPopular && <span className="badge badge-popular">🔥 Популярное</span>}
        </div>
      )}

      <div className="app-card-icon">
        <img src={app.iconUrl} alt={app.name} />
      </div>

      <div className="app-card-content">
        <h3 className="app-name">{app.name}</h3>
        <p className="app-developer">{app.developer}</p>
        <p className="app-description">{app.shortDescription}</p>

        <div className="app-meta">
          <div className="app-rating">
            <FiStar className="star-icon" />
            <span>{app.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="app-downloads">
            <FiDownload className="download-icon" />
            <span>{formatDownloads(app.downloads)}</span>
          </div>
          <div className="app-category">{app.category}</div>
        </div>

        <div className="app-footer">
          <span className="app-price">
            {app.isFree ? 'Бесплатно' : `${app.price} ₽`}
          </span>
          <span className="app-age">{app.ageRating}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AppCard;
