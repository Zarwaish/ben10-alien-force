import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { alienService } from '../services/alienService';
import WatchControl from './WatchControl';
import './WatchGallery.css';

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

export default function WatchGallery({ type, onTransform }) {
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const containerRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    async function fetchAliens() {
      try {
        const data = await alienService.fetchAliens();

        const filtered = data.filter(
          (a) => a.watch_type === type || a.watch_type === 'both'
        );

        setAliens(filtered);
        setSelectedIdx(0);

      } catch {

        const { mockWatches } = await import('../services/mockWatches');

        const filtered = mockWatches.filter(
          (a) => a.watch_type === type || a.watch_type === 'both'
        );

        setAliens(filtered);
        setSelectedIdx(0);

      } finally {
        setLoading(false);
      }
    }

    fetchAliens();

  }, [type]);

useEffect(() => {
  setActive(false);
  setSelectedIdx(0);
}, [type]);

  const handleWheel = useCallback(
    (e) => {
      if (!active) return;

      e.preventDefault();

      const delta = Math.sign(e.deltaY);

      setSelectedIdx(
        (prev) => (prev + delta + aliens.length) % aliens.length
      );
    },
    [active, aliens]
  );

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const deltaX =
      e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(deltaX) > 30) {

      const direction = deltaX > 0 ? -1 : 1;

      setSelectedIdx(
        (prev) =>
          (prev + direction + aliens.length) %
          aliens.length
      );
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!active || aliens.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % aliens.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev - 1 + aliens.length) % aliens.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (aliens[selectedIdx]) {
          onTransform(aliens[selectedIdx]);
        }
      }
    },
    [active, aliens, selectedIdx, onTransform]
  );

  useEffect(() => {
    const el = containerRef.current;

    if (!el || !active) return;

    if (!isMobile) {
      el.addEventListener(
        'wheel',
        handleWheel,
        { passive: false }
      );
      window.addEventListener('keydown', handleKeyDown);
    }

    if (isMobile) {
      el.addEventListener(
        'touchstart',
        handleTouchStart
      );

      el.addEventListener(
        'touchend',
        handleTouchEnd
      );
    }

    return () => {

      if (!isMobile) {
        el.removeEventListener(
          'wheel',
          handleWheel
        );
        window.removeEventListener('keydown', handleKeyDown);
      }

      if (isMobile) {
        el.removeEventListener(
          'touchstart',
          handleTouchStart
        );

        el.removeEventListener(
          'touchend',
          handleTouchEnd
        );
      }
    };

  }, [active, handleWheel, handleKeyDown]);

  const toggleActive = () => {
    setActive(prev => !prev);
  };

  const selectedAlien = aliens[selectedIdx];

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className={`watch-gallery-root ${type === 'ultimatrix' ? 'ultimatrix-view' : ''}`}
      ref={containerRef}
    >

      <div className="watch-stack">

        {active && selectedAlien && (
          <div className="alien-center">
            <div className="alien-beam"/>
            <img src={selectedAlien.image_url} alt={selectedAlien.name} className="alien-image-large" onClick={() => onTransform(selectedAlien)} />
          </div>
        )}

        <div className="watch-control-wrapper">

          <WatchControl
            isUltimatrix={
              type === 'ultimatrix'
            }
            isActive={active}
            toggleDevice={toggleActive}
          />

        </div>

      </div>

    </div>
  );
}