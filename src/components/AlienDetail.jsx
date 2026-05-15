import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

function AlienDetail({ alien, onBack }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!alien) return null;

  const gallery = alien.gallery || [alien.image_url || alien.img];

  const nextImg = () => setActiveImgIndex((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="alien-detail-view"
    >
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>BACK TO SELECTOR</span>
      </button>

      <div className="detail-content">
        <div className="detail-image-container">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImgIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              src={gallery[activeImgIndex]}
              alt={alien.name}
              className="detail-image"
            />
          </AnimatePresence>
          
          {gallery.length > 1 && (
            <div className="gallery-controls">
              <button className="gallery-btn" onClick={prevImg}><ChevronLeft /></button>
              <button className="gallery-btn" onClick={nextImg}><ChevronRight /></button>
            </div>
          )}

          <div className="gallery-dots">
            {gallery.map((_, i) => (
              <div 
                key={i} 
                className={`dot ${i === activeImgIndex ? 'active' : ''}`}
                onClick={() => setActiveImgIndex(i)}
              />
            ))}
          </div>
        </div>

        <div className="detail-info">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="detail-name"
          >
            {alien.name}
          </motion.h1>
          <div className="detail-divider"></div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="detail-desc"
          >
            {alien.description || alien.desc}
          </motion.p>

          <div className="ability-list">
            {(alien.power || "Super Strength, Durability").split(',').map((ability, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="ability-item"
              >
                {ability.trim().toUpperCase()}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AlienDetail;
