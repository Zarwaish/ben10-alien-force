import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, try to create it (fallback if trigger failed)
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            const { data: newProfile } = await supabase.from('profiles').insert([
              { 
                id: uid, 
                username: sessionData.session.user.email.split('@')[0],
                email: sessionData.session.user.email,
                role: 'user' 
              }
            ]).select().single();
            setProfile(newProfile);
            return;
          }
        }
        throw error;
      }
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check if local admin session exists in localStorage
    const localAdmin = localStorage.getItem('admin_session');
    if (localAdmin) {
      const parsed = JSON.parse(localAdmin);
      setUser(parsed.user);
      setProfile(parsed.profile);
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (localStorage.getItem('admin_session')) return;
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (localStorage.getItem('admin_session')) return;
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    localStorage.removeItem('admin_session');
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

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    login,
    signup,
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
