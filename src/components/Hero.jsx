import React from 'react';
import { motion } from 'framer-motion';
import watchImg from '../assets/images/watch.png';

function Hero({ setView }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>UNLEASH YOUR <span>HERO WITHIN</span></h1>
          <p>
            Access the galaxy's most powerful DNA database. Transform into 
            incredible extraterrestrial life forms and protect the universe.
          </p>
          <div className="cta-group">
            <button className="cta-button" onClick={() => setView('omnitrix')}>
              ACTIVATE OMNITRIX
            </button>
            <button className="cta-button secondary" onClick={() => setView('ultimatrix')}>
              ULTIMATRIX MODE
            </button>
          </div>
        </motion.div>
      </div>

      <div className="hero-image">
        <motion.img 
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1,
            type: "spring",
            stiffness: 100
          }}
          src={watchImg}
          alt="Omnitrix" 
        />
        <div className="hero-glow"></div>
      </div>
    </section>
  );
}

export default Hero;
