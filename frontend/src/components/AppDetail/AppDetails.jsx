import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDownload, FiHeart, FiShare2, FiStar, FiChevronLeft,
  FiUsers, FiCalendar, FiPackage, FiShield 
} from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import AppCard from '../../components/AppCard/AppCard';
import './AppDetails.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const AppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [similarApps, setSimilarApps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    loadAppDetails();
    checkWishlistStatus();
    checkInstalledStatus();
  }, [id]);

  const loadAppDetails = async () => {
    setLoading(true);
    try {
      const [appRes, similarRes, reviewsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/apps/${id}`),
        fetch(`http://localhost:8080/api/apps/${id}/similar`),
        fetch(`http://localhost:8080/api/reviews/${id}`)
      ]);

      const appData = await appRes.json();
      const similarData = await similarRes.json();
      const reviewsData = await reviewsRes.json();

      setApp(appData);
      setSimilarApps(similarData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading app details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(parseInt(id)));
  };

  const checkInstalledStatus = () => {
    const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
    setIsInstalled(installed.includes(parseInt(id)));
  };

  const handleInstall = () => {
    const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
    if (!installed.includes(parseInt(id))) {
      installed.push(parseInt(id));
      localStorage.setItem('installedApps', JSON.stringify(installed));
      setIsInstalled(true);
    }
  };

  const handleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isWishlisted) {
      const updated = wishlist.filter(appId => appId !== parseInt(id));
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsWishlisted(false);
    } else {
      wishlist.push(parseInt(id));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: app.name,
          text: app.shortDescription,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована!');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="error-container">
        <h2>Приложение не найдено</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          На главную
        </button>
      </div>
    );
  }

  const screenshots = app.screenshots || [
    '/screenshots/screenshot1.png',
    '/screenshots/screenshot2.png',
    '/screenshots/screenshot3.png'
  ];

  return (
    <div className="app-details-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FiChevronLeft /> Назад
      </button>

      {/* Header Section */}
      <motion.section 
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="app-header-content">
          <img src={app.iconUrl} alt={app.name} className="app-icon-large" />
          
          <div className="app-header-info">
            <div className="app-title-section">
              <h1>{app.name}</h1>
              {app.isEditorChoice && (
                <span className="editor-badge">⭐ Выбор редакции</span>
              )}
            </div>
            
            <p className="app-developer">{app.developer}</p>
            <p className="app-category">{app.category}</p>
            
            <div className="app-stats">
              <div className="stat">
                <FiStar className="stat-icon" />
                <span>{app.rating.toFixed(1)}</span>
              </div>
              <div className="stat">
                <FiDownload className="stat-icon" />
                <span>{(app.downloads / 1000000).toFixed(1)}M</span>
              </div>
              <div className="stat">
                <FiPackage className="stat-icon" />
                <span>{app.size}</span>
              </div>
            </div>

            <div className="app-actions">
              <button 
                className={`btn-install ${isInstalled ? 'installed' : ''}`}
                onClick={handleInstall}
                disabled={isInstalled}
              >
                <FiDownload />
                {isInstalled ? 'Установлено' : app.isFree ? 'Установить' : `${app.price} ₽`}
              </button>
              
              <button 
                className={`btn-icon ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
              >
                <FiHeart />
              </button>
              
              <button className="btn-icon" onClick={handleShare}>
                <FiShare2 />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Description */}
      <section className="app-section">
        <h2>📝 Описание</h2>
        <p className="app-description">{app.description}</p>
      </section>

      {/* Screenshots with Swiper */}
      {screenshots.length > 0 && (
        <section className="app-section">
          <h2>📸 Скриншоты</h2>
          <Swiper
            modules={[Navigation, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            className="screenshots-swiper"
          >
            {screenshots.map((screenshot, index) => (
              <SwiperSlide key={index}>
                <img 
                  src={screenshot} 
                  alt={`Screenshot ${index + 1}`}
                  className="screenshot-image"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Info Grid */}
      <section className="app-section">
        <h2>ℹ️ Информация</h2>
        <div className="info-grid">
          <div className="info-item">
            <FiCalendar className="info-icon" />
            <div>
              <span className="info-label">Обновлено</span>
              <span className="info-value">{app.lastUpdated || '15 ноя 2025'}</span>
            </div>
          </div>
          <div className="info-item">
            <FiUsers className="info-icon" />
            <div>
              <span className="info-label">Возраст</span>
              <span className="info-value">{app.ageRating || '12+'}+</span>
            </div>
          </div>
          <div className="info-item">
            <FiPackage className="info-icon" />
            <div>
              <span className="info-label">Версия</span>
              <span className="info-value">{app.version || '1.0.0'}</span>
            </div>
          </div>
          <div className="info-item">
            <FiShield className="info-icon" />
            <div>
              <span className="info-label">Безопасность</span>
              <span className="info-value">Проверено</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="app-section">
          <h2>⭐ Отзывы</h2>
          <div className="reviews-list">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <div className="user-avatar">{review.userName[0]}</div>
                    <div>
                      <strong>{review.userName}</strong>
                      <div className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Apps */}
      {similarApps.length > 0 && (
        <section className="app-section">
          <h2>🎯 Похожие приложения</h2>
          <div className="similar-apps-grid">
            {similarApps.map((similarApp) => (
              <AppCard key={similarApp.id} app={similarApp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AppDetails;
