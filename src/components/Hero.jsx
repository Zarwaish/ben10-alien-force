import React from 'react';

function Hero({ setView }) {
  return (
    <section className="hero" id="home">
      <div className="bg-glow glow-1"></div>
      <div className="hero-content">
        <h1>BEN 10<br /><span>ALIEN FORCE</span></h1>
        <p>Unlock the ultimate power of the Omnitrix. Transform into the galaxy's most powerful heroes and protect the universe.</p>
        <div className="cta-group">
          <button className="cta-button" onClick={() => setView('omnitrix')}>OMNITRIX</button>
          <button className="cta-button secondary" onClick={() => setView('ultimatrix')}>ULTIMATRIX</button>
        </div>
      </div>
      <div className="hero-image">
        <img src="/src/assets/images/ben.png" alt="Ben Tennyson" />
      </div>
    </section>
  );
}

export default Hero;
