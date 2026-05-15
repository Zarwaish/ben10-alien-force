import React from 'react';
import { motion } from 'framer-motion';

function AlienShowcase({ aliens, loading }) {
  if (loading) {
    return (
      <section className="alien-showcase">
        <div className="section-header">
          <h2 className="section-title">DNA <span>ARCHIVE</span></h2>
          <p className="section-subtitle">Initializing Genetic Database...</p>
        </div>
        <div className="dna-loader">
          <div className="dna-strand"></div>
          <span className="dna-text">SEQUENCING DATA...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="alien-showcase" id="aliens">
      <div className="section-header">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title"
        >
          DNA <span>ARCHIVE</span>
        </motion.h2>
        <p className="section-subtitle">Explore the collection of extraterrestrial DNA samples.</p>
      </div>

      <div className="aliens-grid">
        {aliens.map((alien, index) => (
          <motion.div 
            key={alien.id || alien.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="alien-card"
          >
            <div className="alien-card-image">
              <div className="alien-card-glow"></div>
              <img src={alien.image_url || alien.img} alt={alien.name} loading="lazy" />
            </div>
            <div className="alien-card-content">
              <h3>{alien.name}</h3>
              <p>{alien.description || alien.desc}</p>
              {alien.power && (
                <div className="power-tag">
                  <span>{alien.power.split(',')[0]}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default AlienShowcase;
