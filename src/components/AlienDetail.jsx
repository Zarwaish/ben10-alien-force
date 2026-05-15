import React, { useState } from 'react';

function AlienDetail({ alien, onBack }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!alien) return null;

  const nextImg = () => {
    setCurrentImgIndex((prev) => (prev + 1) % alien.gallery.length);
  };

  const prevImg = () => {
    setCurrentImgIndex((prev) => (prev - 1 + alien.gallery.length) % alien.gallery.length);
  };

  return (
    <section className="alien-detail-view">
      <div className="back-btn" onClick={onBack}>BACK TO DEVICE</div>
      <div className="detail-content">
        <div className="detail-image-container">
          {alien.gallery && alien.gallery.length > 1 && (
            <div className="gallery-controls">
              <button className="gallery-btn prev" onClick={prevImg}>&lt;</button>
              <button className="gallery-btn next" onClick={nextImg}>&gt;</button>
            </div>
          )}
          <img src={alien.gallery ? alien.gallery[currentImgIndex] : alien.img} alt={alien.name} className="detail-image" />
          <div className="detail-glow"></div>
          {alien.gallery && alien.gallery.length > 1 && (
            <div className="gallery-dots">
              {alien.gallery.map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i === currentImgIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImgIndex(i)}
                ></div>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <h1 className="detail-name">{alien.name}</h1>
          <div className="detail-divider"></div>
          <p className="detail-desc">{alien.desc}</p>
          <div className="ability-list">
            <div className="ability-item">ULTIMATE STRENGTH</div>
            <div className="ability-item">DNA REPLICATION</div>
            <div className="ability-item">PLANETARY DEFENSE</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AlienDetail;
