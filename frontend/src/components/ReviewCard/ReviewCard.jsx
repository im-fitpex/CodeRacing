import React, { useState } from 'react';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);

  const handleHelpful = () => {
    if (!helpful) {
      setHelpful(true);
      setHelpfulCount(helpfulCount + 1);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FiStar
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="review-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="review-header">
        <div className="review-user">
          <div className="user-avatar">
            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <h4 className="user-name">
              {review.userName || `Пользователь ${review.userId}`}
            </h4>
            <div className="review-stars">{renderStars(review.rating)}</div>
          </div>
        </div>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>

      {review.comment && (
        <p className="review-comment">{review.comment}</p>
      )}

      <div className="review-footer">
        <button
          className={`helpful-btn ${helpful ? 'active' : ''}`}
          onClick={handleHelpful}
          disabled={helpful}
        >
          <FiThumbsUp />
          Полезно ({helpfulCount})
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
