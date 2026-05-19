import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

function Login({ setView, onLoginSuccess, targetView }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Access Granted. Welcome back, Agent.');
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (targetView) {
        sessionStorage.setItem('oauth_redirect_view', targetView);
      } else {
        sessionStorage.setItem('oauth_redirect_view', 'home');
      }
      await loginWithGoogle();
      // Redirection to Google OAuth page happens next
    } catch (error) {
      toast.error(error.message || 'Google login failed');
      setLoading(false);
    }
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
            <ShieldCheck size={48} color="var(--primary)" />
          </div>
          <h2>AGENT <span>LOGIN</span></h2>
          <p>Secure connection required</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>IDENTIFICATION (EMAIL)</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="Enter your email..." 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="form-group">
            <label>DNA KEY (PASSWORD)</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <button type="submit" className="omnitrix-btn" disabled={loading}>
            {loading ? 'VERIFYING...' : 'INITIALIZE SESSION'}
            {!loading && <div className="btn-glitch"></div>}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        <div className="auth-footer">
          Don't have an account? <span onClick={() => setView('signup')}>Request Access</span>
        </div>
      </div>
    </section>
  );
}

export default Login;
