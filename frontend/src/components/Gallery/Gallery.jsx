import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import './Gallery.css';

const Gallery = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') onClose();
  };

  return (
    <motion.div
      className="gallery-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button className="gallery-close" onClick={onClose}>
        <FiX />
      </button>

      <div className="gallery-container" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-nav prev" onClick={prevSlide}>
          <FiChevronLeft />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="gallery-slide"
            initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <img
              src={images[currentIndex]}
              alt={`Screenshot ${currentIndex + 1}`}
              className="gallery-image"
            />
          </motion.div>
        </AnimatePresence>

        <button className="gallery-nav next" onClick={nextSlide}>
          <FiChevronRight />
        </button>
      </div>

      <div className="gallery-indicators">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`gallery-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

      <div className="gallery-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
};

export default Gallery;
