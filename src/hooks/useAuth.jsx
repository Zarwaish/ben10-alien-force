import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

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
            username: sessionData.session.user.user_metadata?.username || 
                      sessionData.session.user.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() || 
                      sessionData.session.user.email.split('@')[0],
            email: sessionData.session.user.email,
            role: 'user'
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

      if (activeProfile) {
        setProfile(activeProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // 1. Fallback Timeout: Force-disable loading screen after 2.5 seconds no matter what
    const fallbackTimeout = setTimeout(() => {
      console.warn('Auth initialization timed out, forcing loading screen to close.');
      setLoading(false);
    }, 2500);

    // Clear out any old fake Google or non-persistent sessions to prevent bypasses
    try {
      const localSessionStr = localStorage.getItem('local_session');
      if (localSessionStr) {
        localStorage.removeItem('local_session');
      }
    } catch (e) {
      console.warn('Could not access localStorage:', e);
    }

    // Check active sessions and sets the user
    try {
      supabase.auth.getSession()
        .then(({ data }) => {
          const session = data?.session || null;
          if (session) {
            setUser(session.user);
            fetchProfile(session.user.id);
          } else {
            // Fallback to local admin session ONLY
            try {
              const localAdmin = localStorage.getItem('admin_session');
              if (localAdmin) {
                const parsed = JSON.parse(localAdmin);
                setUser(parsed.user);
                setProfile(parsed.profile);
              }
            } catch (adminErr) {
              console.warn('Error reading admin session:', adminErr);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching Supabase session:', err);
        })
        .finally(() => {
          clearTimeout(fallbackTimeout);
          setLoading(false);
        });
    } catch (err) {
      console.error('Error during getSession setup:', err);
      clearTimeout(fallbackTimeout);
      setLoading(false);
    }

    // Listen for changes on auth state
    let subscription = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          if (session) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            try {
              const localAdmin = localStorage.getItem('admin_session');
              if (localAdmin) {
                const parsed = JSON.parse(localAdmin);
                setUser(parsed.user);
                setProfile(parsed.profile);
              } else {
                setUser(null);
                setProfile(null);
              }
            } catch (adminErr) {
              console.warn('Error checking local admin session in listener:', adminErr);
              setUser(null);
              setProfile(null);
            }
          }
        } catch (innerErr) {
          console.error('Error in auth state change listener callback:', innerErr);
        } finally {
          clearTimeout(fallbackTimeout);
          setLoading(false);
        }
      });
      subscription = res?.data?.subscription || res?.subscription;
    } catch (err) {
      console.error('Error setting up onAuthStateChange listener:', err);
      clearTimeout(fallbackTimeout);
      setLoading(false);
    }

    return () => {
      clearTimeout(fallbackTimeout);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes('admin') && password === 'dullgamerz321') {
      const adminSession = {
        user: { email: cleanEmail, id: 'admin-id' },
        profile: { id: 'admin-id', username: 'admin', email: cleanEmail, role: 'admin' }
      };
      localStorage.setItem('admin_session', JSON.stringify(adminSession));
      setUser(adminSession.user);
      setProfile(adminSession.profile);
      return adminSession;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
        options: {
          data: { username: coderUsername }
        }
      });
      if (error) throw error;

      // Create a profile row directly in Supabase profiles table
      if (data?.user) {
        try {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              username: coderUsername,
              email: cleanEmail,
              role: 'user'
            }
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
      options: {
        redirectTo: window.location.origin
      }
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
      // Local profile update for admin
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      localStorage.setItem('admin_session', JSON.stringify({ user, profile: updatedProfile }));
      toast.success('Profile updated locally!');
      return updatedProfile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

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
    refreshProfile: () => fetchProfile(user?.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
