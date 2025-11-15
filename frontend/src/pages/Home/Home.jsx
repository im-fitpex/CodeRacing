import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppCard from '../../components/AppCard/AppCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import RecommendationWeb from '../../components/RecommendationWeb/RecommendationWeb';
import { appsAPI, categoriesAPI } from '../../services/api';
import { FiTrendingUp, FiStar, FiClock, FiGrid } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [editorChoice, setEditorChoice] = useState([]);
  const [newApps, setNewApps] = useState([]);
  const [popularApps, setPopularApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showWeb, setShowWeb] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [editorRes, newRes, popularRes, categoriesRes] = await Promise.all([
        appsAPI.getEditorChoice(),
        appsAPI.getNew(),
        appsAPI.getPopular(),
        categoriesAPI.getAll(),
      ]);

      setEditorChoice(editorRes.data);
      setNewApps(newRes.data);
      setPopularApps(popularRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Добро пожаловать в <span className="gradient-text">RuStore</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Откройте для себя мир российских приложений
          </motion.p>
          
          {/* КНОПКА ПАУТИНЫ */}
          <motion.button
            className="btn-web-hero"
            onClick={() => setShowWeb(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiGrid className="btn-icon" />
            <span>🕸️ Показать паутину рекомендаций</span>
          </motion.button>
        </div>
      </section>

      {/* Categories Quick Access */}
      <section className="section">
        <div className="section-header">
          <h2>Категории</h2>
          <button className="view-all-btn" onClick={() => navigate('/categories')}>
            Все категории →
          </button>
        </div>
        <motion.div
          className="categories-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} type="category" />
              ))}
            </>
          ) : (
            categories.slice(0, 6).map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard category={category} />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Editor's Choice */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <FiStar className="section-icon" />
            <h2>Выбор редакции</h2>
          </div>
        </div>
        <motion.div
          className="apps-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} type="app" />
              ))}
            </>
          ) : (
            editorChoice.map((app) => (
              <motion.div key={app.id} variants={itemVariants}>
                <AppCard app={app} />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Popular Apps */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <FiTrendingUp className="section-icon" />
            <h2>Популярные приложения</h2>
          </div>
        </div>
        <motion.div className="apps-grid">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} type="app" />
              ))}
            </>
          ) : (
            popularApps.slice(0, 6).map((app) => <AppCard key={app.id} app={app} />)
          )}
        </motion.div>
      </section>

      {/* New Apps */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <FiClock className="section-icon" />
            <h2>Новинки</h2>
          </div>
        </div>
        <motion.div className="apps-grid">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} type="app" />
              ))}
            </>
          ) : (
            newApps.slice(0, 6).map((app) => <AppCard key={app.id} app={app} />)
          )}
        </motion.div>
      </section>

      {/* МОДАЛЬНОЕ ОКНО С ПАУТИНОЙ */}
      {showWeb && (
        <RecommendationWeb
          userId={1}
          onClose={() => setShowWeb(false)}
        />
      )}
    </div>
  );
};

export default Home;
