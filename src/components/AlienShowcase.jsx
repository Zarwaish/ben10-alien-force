import React from 'react';

function AlienShowcase({ aliens }) {
  return (
    <section className="alien-showcase">
      <div className="section-header">
        <h2 className="section-title">THE <span>DNA</span> ARCHIVE</h2>
        <p className="section-subtitle">Browse through the genetic blueprints of the universe's most elite warriors.</p>
      </div>
      <div className="aliens-grid">
        {aliens.map((alien) => (
          <div key={alien.name} className="alien-card">
            <div className="alien-card-image">
              <img src={alien.img} alt={alien.name} />
              <div className="alien-card-glow"></div>
            </div>
            <div className="alien-card-content">
              <h3>{alien.name}</h3>
              <p>{alien.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="home-stats">
        <div className="stat-item">
          <span className="stat-value">1,000,912</span>
          <span className="stat-label">DNA SAMPLES</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">10</span>
          <span className="stat-label">ACTIVE SLOTS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">GALAXY</span>
          <span className="stat-label">PROTECTION RANGE</span>
        </div>
      </div>
    </section>
  );
}

export default AlienShowcase;
