import React, { useState } from 'react';

function SignUp({ setView, onSignUp }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsScanning(true);
    
    // Simulate DNA Scan
    setTimeout(() => {
      onSignUp(formData);
      setIsScanning(false);
      setView('home');
      alert("GENETIC MATCH FOUND: Welcome to the DNA Archive!");
    }, 2000);
  };

  return (
    <section className="auth-section">
      <div className={`omnitrix-bg-effect ${isScanning ? 'scanning-active' : ''}`}>
        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
        <div className="scan-line"></div>
      </div>
      
      <div className={`auth-card ${isScanning ? 'is-scanning' : ''}`}>
        <div className="auth-header">
          <div className="auth-icon">
            <img src="/src/assets/images/watch.png" alt="Omnitrix" />
          </div>
          <h2>DNA <span>{isScanning ? 'SCANNING...' : 'REGISTRATION'}</span></h2>
          <p>{isScanning ? 'Analyzing genetic blueprints...' : 'Scan your genetic signature to proceed.'}</p>
        </div>
        {!isScanning ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>CODENAME</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="HERO ID..." 
                  required 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <div className="input-glow"></div>
              </div>
            </div>
            <div className="form-group">
              <label>GALACTIC EMAIL</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="COMM-CHANNEL..." 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <div className="input-glow"></div>
              </div>
            </div>
            <div className="form-group">
              <label>SECURITY KEY</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <div className="input-glow"></div>
              </div>
            </div>
            <button type="submit" className="omnitrix-btn">
              <span>INITIALIZE SCAN</span>
              <div className="btn-glitch"></div>
            </button>
            <div className="auth-divider"><span>OR</span></div>
            <button type="button" className="google-btn" onClick={handleSubmit}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
              <span>SIGN UP WITH GOOGLE</span>
            </button>
          </form>
        ) : (
          <div className="dna-loader">
            <div className="dna-strand"></div>
            <div className="dna-strand"></div>
            <div className="dna-text">DNA SEQUENCE: 100,912 SAMPLES CHECKED</div>
          </div>
        )}
        <div className="auth-footer">
          ALREADY VERIFIED? <span onClick={() => setView('login')}>LOG IN</span>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
