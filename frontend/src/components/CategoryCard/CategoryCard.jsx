import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="category-card"
      onClick={() => navigate(`/category/${category.id}`)}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="category-icon">{category.icon}</div>
      <h3 className="category-name">{category.name}</h3>
    </motion.div>
  );
};

export default CategoryCard;
