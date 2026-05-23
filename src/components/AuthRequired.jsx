import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AuthRequired({ targetView, setView }) {
  const handleLogin = () => {
    // Store the intended view so that after successful login we can redirect back
    try {
      sessionStorage.setItem('oauth_redirect_view', targetView);
    } catch (e) {
      console.warn('Failed to set redirect view in sessionStorage', e);
    }
    setView('login');
  };

  const handleSignUp = () => {
    setView('signup');
  };

  return (
    <section className="auth-section">
      <div className="omnitrix-bg-effect">
        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
        <div className="scan-line"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <ShieldAlert size={48} color="var(--primary)" />
          </div>
          <h2>ACCESS <span>RESTRICTED</span></h2>
          <p>Secure authorization required</p>
        </div>

        <div className="auth-required-container">
          <p className="auth-required-desc">
            You need to be logged in with an active agent session to access the <strong>{targetView.toUpperCase()}</strong> interface.
          </p>

          <div className="auth-required-btn-group">
            <button onClick={handleLogin} className="omnitrix-btn">
              LOG IN
            </button>
            <button onClick={handleSignUp} className="auth-outline-btn">
              REQUEST ACCESS (SIGN UP)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
