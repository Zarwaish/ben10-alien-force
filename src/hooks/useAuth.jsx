import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { login as supLogin, signup as supSignup, loginWithGoogle as supGoogle, logout as supLogout, getSession } from '../services/authService';

// Context provides user state and auth actions
export const AuthContext = createContext({
  user: null,
  loading: false,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialise session on mount (Supabase + localStorage fallback)
  useEffect(() => {
    const init = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('auth_user', JSON.stringify(session.user));
        } else {
          const stored = localStorage.getItem('auth_user');
          if (stored) setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Auth init error', e);
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('auth_user', JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem('auth_user');
      }
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  // Wrapper functions that also keep context in sync
  const handleSignup = async (email, password, username) => {
    const { data, error } = await supSignup(email, password, username);
    if (error) throw error;
    const newUser = data?.user ?? data?.session?.user;
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    }
    return newUser;
  };

  const handleLogin = async (email, password) => {
    const { data, error } = await supLogin(email, password);
    if (error) throw error;
    const loggedUser = data?.user ?? data?.session?.user;
    if (loggedUser) {
      setUser(loggedUser);
      localStorage.setItem('auth_user', JSON.stringify(loggedUser));
    }
    return loggedUser;
  };

  const handleGoogle = async () => {
    await supGoogle(); // redirects to Google OAuth; session will be handled by onAuthStateChange
  };

  const handleLogout = async () => {
    await supLogout();
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  // Refresh admin flag whenever the user changes
  useEffect(() => {
    if (user?.id) {
      refreshAdminStatus(user.id, setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup: handleSignup,
        login: handleLogin,
        loginWithGoogle: handleGoogle,
        logout: handleLogout,
        isAdmin,
        refreshAdminStatus,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Helper to refresh admin status (called after login or on auth changes)
export const refreshAdminStatus = async (userId, setIsAdmin) => {
  if (!userId) { setIsAdmin(false); return; }

  try {
    // Check session email (client-safe — no admin API needed)
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;

    if (email === 'admin@gmail.com') {
      setIsAdmin(true);
      return;
    }
  } catch (e) {
    console.warn('Could not check session email', e);
  }

  // Fallback: check admin_users table
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Admin status error', error);
    setIsAdmin(false);
  } else {
    setIsAdmin(!!data);
  }
};

