import React, { useState, useEffect } from 'react';

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
      if (!isActive || isTransforming) return;
      
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIndex((prev) => (prev + 1) % displayData.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIndex((prev) => (prev - 1 + displayData.length) % displayData.length);
      } else if (e.key === "Enter" || e.key === " ") {
        handleAlienClick(displayData[currentIndex]);
      }
    };

    const handleWheel = (e) => {
      if (!isActive || isTransforming) return;
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
    // Cinematic delay for animation
    setTimeout(() => {
      onTransform(alien);
      setIsTransforming(false);
    }, 800);
  };

  return (
    <section className={`hero device-view ${isUltimatrix ? 'ultimatrix-theme' : ''}`}>
      <div className="glow"></div>

      <div className={`transformation-flash ${isTransforming ? 'active' : ''}`}></div>

      <div className="status">
        {isTransforming ? "TRANSFORMING..." : (isActive ? `${type.toUpperCase()} ACTIVATED` : `CLICK ${type.toUpperCase()} TO ACTIVATE`)}
      </div>

      <div className="alien-container">
        {displayData.map((alien, index) => (
          <div
            key={alien.name}
            className={`alien-entry-omni ${index === currentIndex && isActive ? 'active' : ''}`}
            onClick={() => handleAlienClick(alien)}
          >
            <img src={alien.img} alt={alien.name} />
          </div>
        ))}
      </div>

      <img
        src={isUltimatrix
          ? (isActive ? "/src/assets/images/ultimatrixopen.png" : "/src/assets/images/ultimatrix.png")
          : (isActive ? "/src/assets/images/watch.png" : "/src/assets/images/watchn.png")
        }
        className={`watch-omni ${isActive ? 'active' : ''}`}
        alt={type}
        onClick={toggleDevice}
      />

      <div className={`light-omni ${isActive ? 'active' : ''}`} id="light"></div>

      <div className={`controls-hint ${isActive ? 'visible' : ''}`}>
        {isTransforming ? '' : 'USE ARROW KEYS & CLICK ALIEN TO TRANSFORM'}
      </div>
    </section>
  );
}

export default DeviceSelector;
