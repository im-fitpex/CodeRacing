import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid } from 'react-icons/fi';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import AppCard from '../../components/AppCard/AppCard';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { categoriesAPI, appsAPI } from '../../services/api';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, app, game
  const navigate = useNavigate();
  const { id: categoryIdFromUrl } = useParams();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryIdFromUrl) {
      // Если есть ID в URL, найти категорию и выбрать её
      const category = categories.find(cat => cat.id === parseInt(categoryIdFromUrl));
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [categoryIdFromUrl, categories]);

  useEffect(() => {
    if (selectedCategory) {
      loadAppsByCategory(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      console.log('Categories response:', response);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Categories loaded:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppsByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await appsAPI.getByCategory(categoryId);
      console.log('Apps by category response:', response);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Apps loaded for category', categoryId, ':', data);
      setApps(data);
    } catch (error) {
      console.error('Error loading apps for category', categoryId, ':', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setApps([]);
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterType === 'all') return true;
    return cat.type === filterType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="categories-page">
      <section className="categories-hero">
        <div className="categories-hero-content">
          <FiGrid className="hero-icon" />
          <h1>Категории</h1>
          <p>Найдите приложения и игры по интересующим категориям</p>
        </div>
      </section>

      {!selectedCategory ? (
        <div className="container">
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Все категории
            </button>
            <button
              className={`filter-tab ${filterType === 'app' ? 'active' : ''}`}
              onClick={() => setFilterType('app')}
            >
              Приложения
            </button>
            <button
              className={`filter-tab ${filterType === 'game' ? 'active' : ''}`}
              onClick={() => setFilterType('game')}
            >
              Игры
            </button>
          </div>

          {/* Categories Grid */}
          <motion.div
            className="categories-grid-large"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              <>
                {[...Array(12)].map((_, i) => (
                  <SkeletonLoader key={i} type="category" />
                ))}
              </>
            ) : (
              filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      ) : (
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <button onClick={handleBackToCategories} className="breadcrumb-link">
              Категории
            </button>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-current">{selectedCategory.name}</span>
          </div>

          {/* Apps Grid */}
          <motion.div
            className="apps-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <SkeletonLoader key={i} type="app" />
                ))}
              </>
            ) : apps.length > 0 ? (
              apps.map((app) => (
                <motion.div key={app.id} variants={itemVariants}>
                  <AppCard app={app} />
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <p>В этой категории пока нет приложений</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Categories;
