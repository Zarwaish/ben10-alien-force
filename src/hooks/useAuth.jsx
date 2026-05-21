import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Utility for timestamped logs
const now = () => new Date().toISOString();

// Auth context
export const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastFetchedUid = useRef(null);

  const fetchProfile = async (uid) => {
    if (!uid) return;
    if (lastFetchedUid.current === uid) return;
    lastFetchedUid.current = uid;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      let activeProfile = data;
      if (error) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const newProfileObj = {
            id: uid,
            username:
              sessionData.session.user.user_metadata?.username ||
              sessionData.session.user.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() ||
              sessionData.session.user.email.split('@')[0],
            email: sessionData.session.user.email,
            role: 'user',
          };
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert([newProfileObj])
            .select()
            .single();
          if (!insertError && newProfile) {
            activeProfile = newProfile;
          } else {
            console.error('Failed to upsert profile to DB:', insertError);
            activeProfile = newProfileObj;
          }
        }
      }
      if (activeProfile) setProfile(activeProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Initialize auth on mount
  console.log(`[Auth] Hook init start ${now()}`);
  useEffect(() => {
    console.log(`[Auth] Starting session restoration ${now()}`);
    // Clear any stale local sessions
    try {
      const localSessionStr = localStorage.getItem('local_session');
      if (localSessionStr) localStorage.removeItem('local_session');
    } catch (e) {
      console.warn('Auth: localStorage clear error', e);
    }

    // Get current session from Supabase
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const session = data?.session || null;
        console.log(`[Auth] getSession result ${now()}`, session);
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      })
      .catch(err => {
        console.error(`[Auth] getSession error ${now()}`, err);
      })
      .finally(() => {
        console.log(`[Auth] Session restoration finished ${now()}`);
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] onAuthStateChange ${now()} event=${event}`, session);
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
    };
  }, []);

  // Auth actions
  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase login failed:', err);
      throw err;
    }
  };

  const signup = async (email, password, username) => {
    const cleanEmail = email.toLowerCase().trim();
    const coderUsername = username || cleanEmail.split('@')[0];
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: coderUsername } },
      });
      if (error) throw error;
      if (data?.user) {
        try {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              username: coderUsername,
              email: cleanEmail,
              role: 'user',
            },
          ]);
        } catch (dbErr) {
          console.warn('Direct profile insert failed:', dbErr);
        }
      }
      return data;
    } catch (err) {
      console.warn('Supabase signup failed:', err);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('local_session');
    lastFetchedUid.current = null;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signout ignored:', err);
    }
    setUser(null);
    setProfile(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates) => {
    if (localStorage.getItem('admin_session')) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      localStorage.setItem('admin_session', JSON.stringify({ user, profile: updatedProfile }));
      toast.success('Profile updated locally!');
      return updatedProfile;
    }
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
    if (error) throw error;
    setProfile(data);
    toast.success('Profile updated!');
    return data;
  };

  // Listen for profile deletion to instantly kick users
  useEffect(() => {
    if (!user?.id || user.id === 'admin-id') return;
    const channel = supabase.channel(`public:profiles:delete:${user.id}`)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => {
        toast.error('Your access has been revoked by an administrator.');
        logout();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshProfile: () => fetchProfile(user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for consuming auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
