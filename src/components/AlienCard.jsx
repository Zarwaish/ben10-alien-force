import React from 'react';
import './AlienCard.css';

export default function AlienCard({ alien, onSelect }) {
  const handleClick = () => {
    if (onSelect) onSelect(alien);
  };

  return (
    <div className="alien-card" onClick={handleClick}>
      <img src={alien.image_url} alt={alien.name} className="alien-image" />
      <h3 className="alien-name">{alien.name}</h3>
      <p className="alien-species">{alien.species || 'Unknown Species'}</p>
      <p className="alien-planet">{alien.planet || 'Unknown Planet'}</p>
      <p className="alien-power">Power: {alien.power || 'N/A'}</p>
    </div>
  );
}
