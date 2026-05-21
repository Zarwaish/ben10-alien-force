import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


/**
 * Guard component that ensures the wrapped element is only rendered when the
 * authentication state is ready and the user satisfies the required role.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children – element to render when authorized
 * @param {boolean} [props.requireAuth=true] – whether a logged‑in user is required
 * @param {string} [props.requiredRole] – optional role (e.g. "admin")
 */
export default function ProtectedRoute({ children, requireAuth = true, requiredRole }) {
  const { user, loading, isAdmin } = useAuth();

  // Show a loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="global-loader">
        <div className="omnitrix-spinner" />
        <span>Initializing DNA...</span>
      </div>
    );
  }

  // Not logged in – redirect to the login page
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch – restrict access if a specific role is required
  if (requiredRole && requiredRole === 'admin' && !isAdmin) {
    // Role mismatch – admin required but user is not admin
    return <Navigate to="/" replace />;
  }

  // All checks passed – render the protected content
  return <>{children}</>;
}
