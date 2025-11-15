import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiDownload,
  FiStar,
  FiShare2,
  FiInfo,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Gallery from '../../components/Gallery/Gallery';
import AppCard from '../../components/AppCard/AppCard';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { appsAPI } from '../../services/api';
import './AppDetails.css';

const AppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('about'); // about, reviews

  useEffect(() => {
    loadAppDetails();
  }, [id]);

  const loadAppDetails = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId') || 1;
      const response = await appsAPI.getById(id, userId);
      setApp(response.data);
    } catch (error) {
      console.error('Error loading app details:', error);
      toast.error('Не удалось загрузить данные приложения');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const userId = localStorage.getItem('userId') || 1;
      await appsAPI.trackInstall(id, userId);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = app.apkUrl;
      link.download = `${app.packageName}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Загрузка началась');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Ошибка при загрузке');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: app.name,
          text: app.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована в буфер обмена');
    }
  };

  const openGallery = (index) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  const formatSize = (sizeMb) => {
    if (sizeMb >= 1000) return `${(sizeMb / 1000).toFixed(1)} ГБ`;
    return `${sizeMb.toFixed(1)} МБ`;
  };

  const formatDownloads = (downloads) => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M+`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K+`;
    return downloads;
  };

  if (loading) {
    return (
      <div className="app-details-loading">
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="app-details-error">
        <h2>Приложение не найдено</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="app-details-page">
      {/* Header */}
      <div className="app-details-header">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Назад
          </button>
        </div>
      </div>

      {/* Main Info */}
      <section className="app-main-info">
        <div className="container">
          <div className="app-info-grid">
            <div className="app-icon-large">
              <img src={app.iconUrl} alt={app.name} />
            </div>

            <div className="app-info-content">
              <div className="app-badges">
                {app.isEditorChoice && (
                  <span className="badge badge-editor">⭐ Выбор редакции</span>
                )}
                {app.isNew && (
                  <span className="badge badge-new">🆕 Новинка</span>
                )}
                {app.isFree && (
                  <span className="badge badge-free">Бесплатно</span>
                )}
              </div>

              <h1 className="app-title">{app.name}</h1>
              <p className="app-developer">{app.developer}</p>

              <div className="app-meta-info">
                <div className="meta-item">
                  <FiStar className="meta-icon" />
                  <span className="meta-value">{app.rating?.toFixed(1)}</span>
                  <span className="meta-label">Рейтинг</span>
                </div>
                <div className="meta-item">
                  <FiDownload className="meta-icon" />
                  <span className="meta-value">{formatDownloads(app.downloads)}</span>
                  <span className="meta-label">Загрузок</span>
                </div>
                <div className="meta-item">
                  <FiInfo className="meta-icon" />
                  <span className="meta-value">{app.ageRating}</span>
                  <span className="meta-label">Возраст</span>
                </div>
              </div>

              <div className="app-actions">
                <button className="btn btn-primary btn-large" onClick={handleDownload}>
                  <FiDownload />
                  {app.isFree ? 'Установить' : `Купить за ${app.price} ₽`}
                </button>
                <button className="btn btn-outline" onClick={handleShare}>
                  <FiShare2 />
                  Поделиться
                </button>
              </div>

              <div className="app-quick-info">
                <div className="quick-info-item">
                  <span className="label">Категория:</span>
                  <span className="value">{app.category}</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Версия:</span>
                  <span className="value">{app.version}</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Размер:</span>
                  <span className="value">{formatSize(app.sizeMb)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <section className="app-screenshots">
          <div className="container">
            <h2 className="section-title">Скриншоты</h2>
            <div className="screenshots-scroll">
              {app.screenshots.map((screenshot, index) => (
                <motion.div
                  key={index}
                  className="screenshot-item"
                  onClick={() => openGallery(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img src={screenshot} alt={`Screenshot ${index + 1}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="app-content">
        <div className="container">
          <div className="content-tabs">
            <button
              className={`tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              Описание
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Отзывы ({app.reviews?.length || 0})
            </button>
          </div>

          {activeTab === 'about' && (
            <motion.div
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="app-description">
                <h3>О приложении</h3>
                <p>{app.description}</p>
              </div>

              <div className="app-details-info">
                <h3>Информация</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Разработчик</span>
                    <span className="value">{app.developer}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Пакет</span>
                    <span className="value code">{app.packageName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Версия</span>
                    <span className="value">{app.version}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Размер</span>
                    <span className="value">{formatSize(app.sizeMb)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Категория</span>
                    <span className="value">{app.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Возрастной рейтинг</span>
                    <span className="value">{app.ageRating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              className="tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {app.reviews && app.reviews.length > 0 ? (
                <div className="reviews-list">
                  {app.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="empty-reviews">
                  <p>Пока нет отзывов. Будьте первым!</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Similar Apps */}
      {app.similarApps && app.similarApps.length > 0 && (
        <section className="similar-apps">
          <div className="container">
            <h2 className="section-title">Похожие приложения</h2>
            <div className="apps-grid">
              {app.similarApps.map((similarApp) => (
                <AppCard key={similarApp.id} app={similarApp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <Gallery
          images={app.screenshots}
          initialIndex={galleryIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

export default AppDetails;
