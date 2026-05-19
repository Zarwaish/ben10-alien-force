import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ultimatrixOpenImg from '../assets/images/ultimatrixopen.png';
import ultimatrixImg from '../assets/images/ultimatrix.png';
import watchImg from '../assets/images/watch.png';
import watchnImg from '../assets/images/watchn.png';

// Import new watch face images
import omx1 from '../assets/images/omx1.png';
import omx2 from '../assets/images/omx2.png';
import omx3 from '../assets/images/omx3.png';
import omx4 from '../assets/images/omx4.png';
import omx5 from '../assets/images/omx5.png';
import omx6 from '../assets/images/omx6.png';
import omx7 from '../assets/images/omx7.png';
import omx8 from '../assets/images/omx8.png';
import omx9 from '../assets/images/omx9.png';
import omx10 from '../assets/images/omx10.png';

const getOmxImage = (alien, index) => {
  if (!alien) return omx1;

  // Verify if it is one of the hardcoded default fallback aliens
  const isDefaultAlien = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(String(alien.id));

  // If it is a custom uploaded alien, use the uploaded image directly
  if (!isDefaultAlien && alien.image_url) {
    return alien.image_url;
  }

  const cleanName = alien.name ? alien.name.replace('Ultimate ', '').toLowerCase().trim() : '';
  if (cleanName.includes('swampfire')) return omx1;
  if (cleanName.includes('humungousaur') || cleanName.includes('humangasour')) return omx2;
  if (cleanName.includes('jetray') || cleanName.includes('jetrey')) return omx3;
  if (cleanName.includes('big chill') || cleanName.includes('bigchill')) return omx4;
  if (cleanName.includes('chromastone')) return omx5;
  if (cleanName.includes('echo echo') || cleanName.includes('echoecho')) return omx6;
  if (cleanName.includes('alien x') || cleanName.includes('alienx')) return omx7;
  if (cleanName.includes('goop')) return omx8;
  if (cleanName.includes('way big') || cleanName.includes('waybig')) return omx9;
  if (cleanName.includes('spidermonkey') || cleanName.includes('spm')) return omx10;
  
  // Fallback by ID for compatibility
  const idNum = parseInt(alien.id, 10);
  if (!isNaN(idNum) && idNum >= 1 && idNum <= 10) {
    const fallbacks = [omx1, omx2, omx3, omx4, omx5, omx6, omx7, omx8, omx9, omx10];
    return fallbacks[idNum - 1];
  }
  
  // Final fallback to uploaded image if available
  if (alien.image_url) {
    return alien.image_url;
  }
  
  // Fallback by index
  const fallbacks = [omx1, omx2, omx3, omx4, omx5, omx6, omx7, omx8, omx9, omx10];
  return fallbacks[index % 10] || omx1;
};

function DeviceSelector({ type, onTransform, aliens }) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransforming, setIsTransforming] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % displayData.length);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + displayData.length) % displayData.length);
    }
  };

  const isUltimatrix = type === 'ultimatrix';
  
  const filteredList = (aliens || []).filter(a => {
    if (!a) return false;
    const watch = a.watch_type || 'both';
    return watch === 'both' || (isUltimatrix ? watch === 'ultimatrix' : watch === 'omnitrix');
  });

  const displayData = [...filteredList]
    .sort((a, b) => {
      const idxA = a.order_index !== undefined && a.order_index !== null ? Number(a.order_index) : 999;
      const idxB = b.order_index !== undefined && b.order_index !== null ? Number(b.order_index) : 999;
      return idxA - idxB;
    })
    .map(a => {
      if (isUltimatrix && a.name && !a.name.toLowerCase().startsWith('ultimate')) {
        return { ...a, name: `Ultimate ${a.name}` };
      }
      return a;
    });

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

      <div 
        className="alien-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndEvent}
      >
        {displayData.length > 0 && isActive && (
          <button className="mobile-nav-btn left" onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + displayData.length) % displayData.length); }}>
            <ChevronLeft size={30} />
          </button>
        )}
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
              <img src={getOmxImage(displayData[currentIndex], currentIndex)} alt="Selected Alien" />
            </motion.div>
          )}
        </AnimatePresence>
        {displayData.length > 0 && isActive && (
          <button className="mobile-nav-btn right" onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % displayData.length); }}>
            <ChevronRight size={30} />
          </button>
        )}
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
