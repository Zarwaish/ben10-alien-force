import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GlobalLoader from './GlobalLoader';

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

  if (loading) {
    // Show a global spinner while auth state is being resolved
    return <GlobalLoader />;
  }

  if (requireAuth && !user) {
    // Not logged in – redirect to the login page
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && requiredRole !== 'admin' && isAdmin) {
    // Role mismatch – for now only admin is a special case
    return <Navigate to="/" replace />;
  }

  // All checks passed – render the protected content
  return <>{children}</>;
}
