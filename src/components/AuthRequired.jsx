import React from 'react';
import Login from './Login';
import SignUp from './SignUp';

/**
 * Component displayed when a user attempts to access a protected page without being authenticated.
 * It explains that authentication is required and offers direct navigation to the login or sign‑up flows.
 *
 * @param {object} props
 * @param {string} props.targetView – the view that the user originally wanted to access (e.g. "omnitrix").
 * @param {function} props.setView – state setter from App to change the current view.
 */
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
    <div className="auth-required">
      <h2>Authentication Required</h2>
      <p>You need to be logged in to access the <strong>{targetView}</strong> page.</p>
      <div className="auth-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleLogin} className="btn btn-primary">
          Log In
        </button>
        <button onClick={handleSignUp} className="btn btn-secondary">
          Sign Up
        </button>
      </div>
    </div>
  );
}
