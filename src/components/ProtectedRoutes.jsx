import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="global-loader">
        <div className="omnitrix-spinner"></div>
        <span>Authenticating DNA...</span>
      </div>
    );
  }

  if (!user) {
    // Optionally redirect or show login
    return (
      <div className="restricted-access">
        <h2>ACCESS DENIED</h2>
        <p>You must be logged in to access this terminal.</p>
        <button className="cta-button" onClick={() => window.location.href = '/'}>Return to Base</button>
      </div>
    );
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="global-loader">
        <div className="omnitrix-spinner"></div>
        <span>Verifying Clearances...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="restricted-access">
        <div className="warning-icon">⚠️</div>
        <h2>LEVEL 10 CLEARANCE REQUIRED</h2>
        <p>This sector is restricted to Plumber Command only.</p>
        <button className="cta-button" onClick={() => window.location.href = '/'}>Emergency Evac</button>
      </div>
    );
  }

  return children;
};
