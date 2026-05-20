import React from 'react';
import { motion } from 'framer-motion';
import watchImg from '../assets/images/watch.png';
import watchnImg from '../assets/images/watchn.png';
import ultimatrixOpenImg from '../assets/images/ultimatrixopen.png';
import ultimatrixImg from '../assets/images/ultimatrix.png';

/**
 * Reusable watch/ultimatrix control component.
 * Props:
 *   - isUltimatrix: boolean – true for ultimate device
 *   - isActive: boolean – current activation state
 *   - toggleDevice: () => void – click handler to toggle state
 */
export const WatchControl = ({ isUltimatrix, isActive, toggleDevice }) => {
  const imgSrc = isUltimatrix
    ? isActive
      ? ultimatrixOpenImg
      : ultimatrixImg
    : isActive
    ? watchImg
    : watchnImg;

  return (
    <div className="watch-controls">
      <motion.img
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        src={imgSrc}
        className={`watch-omni ${isActive ? 'active' : ''}`}
        alt={isUltimatrix ? 'Ultimatrix' : 'Omnitrix'}
        onClick={toggleDevice}
      />
      <div className={`light-omni ${isActive ? 'active' : ''}`} id="light" />
    </div>
  );
};

export default WatchControl;
