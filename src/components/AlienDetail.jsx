import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

function AlienDetail({ alien, onBack }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isUltimate, setIsUltimate] = useState(false);
  const [ultimateImgIndex, setUltimateImgIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);
  // Store latest navigation refs to avoid stale closures in wheel handler
  const isUltimateRef = useRef(isUltimate);
  const activeImgIndexRef = useRef(activeImgIndex);
  const ultimateImgIndexRef = useRef(ultimateImgIndex);
  const galleryLenRef = useRef(1);
  const ultimateLenRef = useRef(1);

  if (!alien) return null;

  const gallery = Array.isArray(alien.gallery) && alien.gallery.length > 0
    ? alien.gallery
    : [alien.image_url || alien.img].filter(Boolean);
  const ultimateGallery = Array.isArray(alien.ultimate_gallery) && alien.ultimate_gallery.length > 0
    ? alien.ultimate_gallery
    : (alien.ultimate_image_url ? [alien.ultimate_image_url] : []);
  const hasUltimate = ultimateGallery.length > 0;

  // Keep refs current so wheel handler always has latest values
  isUltimateRef.current = isUltimate;
  activeImgIndexRef.current = activeImgIndex;
  ultimateImgIndexRef.current = ultimateImgIndex;
  galleryLenRef.current = gallery.length || 1;
  ultimateLenRef.current = ultimateGallery.length || 1;

  const displayImage = isUltimate
    ? (ultimateGallery[ultimateImgIndex] || alien.image_url || alien.img)
    : (gallery[activeImgIndex] || alien.image_url || alien.img);

  const nextImg = () => {
    if (isUltimateRef.current) {
      setUltimateImgIndex((prev) => (prev + 1) % ultimateLenRef.current);
    } else {
      setActiveImgIndex((prev) => (prev + 1) % galleryLenRef.current);
    }
  };
  const prevImg = () => {
    if (isUltimateRef.current) {
      setUltimateImgIndex((prev) => (prev - 1 + ultimateLenRef.current) % ultimateLenRef.current);
    } else {
      setActiveImgIndex((prev) => (prev - 1 + galleryLenRef.current) % galleryLenRef.current);
    }
  };

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
    if (distance > minSwipeDistance) nextImg();
    else if (distance < -minSwipeDistance) prevImg();
  };

  // Stable wheel handler using refs — never goes stale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        if (isUltimateRef.current) {
          setUltimateImgIndex((prev) => (prev + 1) % ultimateLenRef.current);
        } else {
          setActiveImgIndex((prev) => (prev + 1) % galleryLenRef.current);
        }
      } else if (e.deltaY < 0) {
        if (isUltimateRef.current) {
          setUltimateImgIndex((prev) => (prev - 1 + ultimateLenRef.current) % ultimateLenRef.current);
        } else {
          setActiveImgIndex((prev) => (prev - 1 + galleryLenRef.current) % galleryLenRef.current);
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []); // Empty deps — refs keep it fresh without re-binding

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
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={isUltimate ? `ultimate-${ultimateImgIndex}` : `gallery-${activeImgIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              src={displayImage}
              alt={alien.name}
              className="detail-image"
            />
          </AnimatePresence>
          
          {/* Nav controls — show for gallery OR ultimate gallery */}
          {((gallery.length > 1 && !isUltimate) || (ultimateGallery.length > 1 && isUltimate)) && (
            <div className="gallery-controls">
              <button className="gallery-btn" onClick={prevImg}><ChevronLeft /></button>
              <button className="gallery-btn" onClick={nextImg}><ChevronRight /></button>
            </div>
          )}

          {/* Dots — gallery or ultimate gallery */}
          {!isUltimate && gallery.length > 1 && (
            <div className="gallery-dots">
              {gallery.map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i === activeImgIndex ? 'active' : ''}`}
                  onClick={() => setActiveImgIndex(i)}
                />
              ))}
            </div>
          )}
          {isUltimate && ultimateGallery.length > 1 && (
            <div className="gallery-dots">
              {ultimateGallery.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === ultimateImgIndex ? 'active' : ''}`}
                  onClick={() => setUltimateImgIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="detail-name"
          >
            {alien.name}
          </motion.h1>
          
          {hasUltimate && (
            <button 
              className={`ultimate-toggle-btn ${isUltimate ? 'active' : ''}`}
              onClick={() => { setIsUltimate(!isUltimate); setUltimateImgIndex(0); }}
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
