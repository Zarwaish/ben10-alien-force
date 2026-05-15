import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';

function Login({ setView, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Access Granted. Welcome back, Agent.');
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
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

        <div className="auth-footer">
          Don't have an account? <span onClick={() => setView('signup')}>Request Access</span>
        </div>
      </div>
    </section>
  );
}

export default Login;
