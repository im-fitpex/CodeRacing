import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'app' }) => {
  if (type === 'app') {
    return (
      <div className="skeleton-app">
        <div className="skeleton skeleton-icon"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-footer"></div>
      </div>
    );
  }

  if (type === 'category') {
    return (
      <div className="skeleton-category">
        <div className="skeleton skeleton-cat-icon"></div>
        <div className="skeleton skeleton-cat-text"></div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
