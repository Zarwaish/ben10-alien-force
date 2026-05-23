// src/components/RequireAdmin.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Wrapper that protects admin routes.
 * It reads the `isAdmin` flag from the auth context and redirects
 * non‑admin users to the home page.
 */
export default function RequireAdmin({ children }) {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    // If we have a user and they are admin@gmail.com, we bypass the redirect
    if (user && user.email === 'admin@gmail.com') {
      return;
    }
    
    // Otherwise rely on isAdmin flag
    if (user && !isAdmin) {
      // Give it a tiny delay to allow isAdmin to sync after login
      const timer = setTimeout(() => {
        if (!isAdmin && user.email !== 'admin@gmail.com') {
          navigate('/');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (!user) {
      navigate('/');
    }
  }, [isAdmin, user, navigate]);

  // Render children if admin or if they are the hardcoded admin email
  const isAuthorized = isAdmin || (user && user.email === 'admin@gmail.com');
  return isAuthorized ? children : null;
}
