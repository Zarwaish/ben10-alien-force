import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, ShieldPlus } from 'lucide-react';

function SignUp({ setView }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          }
        }
      });

      if (error) throw error;

      // Create profile record (though ideally handled by a DB trigger)
      if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, username: formData.username, role: 'user' }
        ]);
      }

      toast.success('Access Request Sent. Please verify your email.');
      setView('login');
    } catch (error) {
      toast.error(error.message || 'Sign up failed');
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
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <ShieldPlus size={48} color="var(--primary)" />
          </div>
          <h2>AGENT <span>ENROLLMENT</span></h2>
          <p>Join the Plumber Academy</p>
        </div>

        <form className="auth-form" onSubmit={handleSignUp}>
          <div className="form-group">
            <label>CODENAME (USERNAME)</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Agent Name..." 
                required 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="form-group">
            <label>IDENTIFICATION (EMAIL)</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="academy@plumber.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <button type="submit" className="omnitrix-btn" disabled={loading}>
            {loading ? 'ENROLLING...' : 'INITIALIZE ENROLLMENT'}
            {!loading && <div className="btn-glitch"></div>}
          </button>
        </form>

        <div className="auth-footer">
          Already an agent? <span onClick={() => setView('login')}>Terminal Login</span>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
