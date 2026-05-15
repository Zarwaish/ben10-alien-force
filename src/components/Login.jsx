import React, { useState } from 'react';

function Login({ setView, onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsScanning(true);

    // Simulate Auth Scan
    setTimeout(() => {
      const success = onLogin(formData.email, formData.password);
      setIsScanning(false);
      if (!success) {
        alert("AUTHENTICATION FAILED: DNA Signature not recognized.");
      }
    }, 1500);
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
            <img src="/src/assets/images/watchn.png" alt="Omnitrix" />
          </div>
          <h2>ACCESS <span>{isScanning ? 'VERIFYING...' : 'TERMINAL'}</span></h2>
          <p>{isScanning ? 'Matching DNA sequence...' : 'Verify DNA sequence to unlock archive.'}</p>
        </div>
        {!isScanning ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>CODENAME / EMAIL</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="IDENTIFY..." 
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
              <span>START AUTHENTICATION</span>
              <div className="btn-glitch"></div>
            </button>
            <div className="auth-divider"><span>OR</span></div>
            <button type="button" className="google-btn" onClick={handleSubmit}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
              <span>LOGIN WITH GOOGLE</span>
            </button>
          </form>
        ) : (
          <div className="dna-loader">
            <div className="dna-strand"></div>
            <div className="dna-strand"></div>
            <div className="dna-text">MATCHING GENETIC SIGNATURE...</div>
          </div>
        )}
        <div className="auth-footer">
          NEW GENETIC SAMPLE? <span onClick={() => setView('signup')}>REGISTER</span>
        </div>
      </div>
    </section>
  );
}

export default Login;
