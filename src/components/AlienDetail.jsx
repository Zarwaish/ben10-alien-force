import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

function AlienDetail({ alien, onBack }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isUltimate, setIsUltimate] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  if (!alien) return null;

  const gallery = alien.gallery || [alien.image_url || alien.img];
  const displayImage = isUltimate ? (alien.ultimate_image_url || alien.image_url || alien.img) : gallery[activeImgIndex];

  const nextImg = () => setActiveImgIndex((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImg();
    }
    if (isRightSwipe) {
      prevImg();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="alien-detail-view"
    >
      <button className="back-btn" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={24} />
      </button>
      
      <div className="detail-content">
        <div 
          className="detail-image-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={isUltimate ? 'ultimate' : activeImgIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              src={displayImage}
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
          
          {alien.ultimate_image_url && (
            <button 
              className={`ultimate-toggle-btn ${isUltimate ? 'active' : ''}`}
              onClick={() => setIsUltimate(!isUltimate)}
              style={{
                marginTop: '15px',
                marginBottom: '15px',
                padding: '12px 24px',
                background: isUltimate ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                border: isUltimate ? '2px solid #00ff00' : '1px solid rgba(0, 255, 0, 0.4)',
                color: '#fff',
                borderRadius: '50px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                boxShadow: isUltimate ? '0 0 20px rgba(0, 255, 0, 0.5)' : 'none',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                outline: 'none'
              }}
            >
              <motion.span 
                animate={isUltimate ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isUltimate ? '#00ff00' : 'rgba(0, 255, 0, 0.4)',
                  display: 'inline-block'
                }} 
              />
              {isUltimate ? 'ULTIMATE FORM ACTIVE' : 'EVOLVE TO ULTIMATE'}
            </button>
          )}

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
