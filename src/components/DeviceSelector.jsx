import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ultimatrixOpenImg from '../assets/images/ultimatrixopen.png';
import ultimatrixImg from '../assets/images/ultimatrix.png';
import watchImg from '../assets/images/watch.png';
import watchnImg from '../assets/images/watchn.png';

function DeviceSelector({ type, onTransform, aliens }) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransforming, setIsTransforming] = useState(false);

  const isUltimatrix = type === 'ultimatrix';
  const displayData = isUltimatrix
    ? aliens.map(a => ({ ...a, name: `Ultimate ${a.name}` }))
    : aliens;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isActive || isTransforming || displayData.length === 0) return;
      
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIndex((prev) => (prev + 1) % displayData.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIndex((prev) => (prev - 1 + displayData.length) % displayData.length);
      } else if (e.key === "Enter" || e.key === " ") {
        handleAlienClick(displayData[currentIndex]);
      }
    };

    const handleWheel = (e) => {
      if (!isActive || isTransforming || displayData.length === 0) return;
      if (e.deltaY > 0) {
        setCurrentIndex((prev) => (prev + 1) % displayData.length);
      } else if (e.deltaY < 0) {
        setCurrentIndex((prev) => (prev - 1 + displayData.length) % displayData.length);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isActive, isTransforming, displayData, currentIndex]);

  const toggleDevice = () => {
    setIsActive(!isActive);
  };

  const handleAlienClick = (alien) => {
    if (!isActive || isTransforming) return;
    setIsTransforming(true);
    setTimeout(() => {
      onTransform(alien);
      setIsTransforming(false);
    }, 800);
  };

  return (
    <section className={`device-view ${isUltimatrix ? 'ultimatrix-theme' : ''}`}>
      <div className="glow"></div>
      <div className={`transformation-flash ${isTransforming ? 'active' : ''}`}></div>

      <div className="status">
        {displayData.length === 0 
          ? "DNA DATABASE EMPTY" 
          : isTransforming 
            ? "TRANSFORMING..." 
            : (isActive ? `${type.toUpperCase()} ACTIVATED` : `CLICK ${type.toUpperCase()} TO ACTIVATE`)}
      </div>

      <div className="alien-container">
        <AnimatePresence mode="wait">
          {displayData.length > 0 && isActive && (
            <motion.div
              key={displayData[currentIndex]?.id || currentIndex}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="alien-entry-omni active"
              onClick={() => handleAlienClick(displayData[currentIndex])}
            >
              <img src={displayData[currentIndex]?.image_url || displayData[currentIndex]?.img} alt="Selected Alien" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="watch-controls">
        <motion.img
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          src={isUltimatrix
            ? (isActive ? ultimatrixOpenImg : ultimatrixImg)
            : (isActive ? watchImg : watchnImg)
          }
          className={`watch-omni ${isActive ? 'active' : ''}`}
          alt={type}
          onClick={toggleDevice}
        />
        <div className={`light-omni ${isActive ? 'active' : ''}`} id="light"></div>
      </div>

      <div className={`controls-hint ${isActive ? 'visible' : ''}`}>
        {isTransforming ? '' : 'USE ARROW KEYS & CLICK ALIEN TO TRANSFORM'}
      </div>
    </section>
  );
}

export default DeviceSelector;
