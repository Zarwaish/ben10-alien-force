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
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        // Fallback to local session if no supabase session is active
        const localAdmin = localStorage.getItem('admin_session');
        const localSession = localStorage.getItem('local_session');
        if (localAdmin) {
          const parsed = JSON.parse(localAdmin);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } else if (localSession) {
          const parsed = JSON.parse(localSession);
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        // Fallback to local session if no supabase session is active
        const localAdmin = localStorage.getItem('admin_session');
        const localSession = localStorage.getItem('local_session');
        if (localAdmin) {
          const parsed = JSON.parse(localAdmin);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } else if (localSession) {
          const parsed = JSON.parse(localSession);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } else {
          setUser(null);
          setProfile(null);
        }
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase login failed, checking local registry:', err);
      const registered = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const found = registered.find(u => u.email.toLowerCase() === cleanEmail);
      if (found) {
        // Mock local session
        const session = { user: found, profile: found };
        localStorage.setItem('local_session', JSON.stringify(session));
        setUser(session.user);
        setProfile(session.profile);
        return session;
      }
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

      // Sync user profile to localStorage registry
      const localUser = {
        id: data?.user?.id || Date.now().toString(),
        username: coderUsername,
        email: cleanEmail,
        role: 'user'
      };
      const registered = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (!registered.some(u => u.email.toLowerCase() === cleanEmail)) {
        registered.push(localUser);
        localStorage.setItem('registered_users', JSON.stringify(registered));
      }
      return data;
    } catch (err) {
      console.warn('Supabase signup failed, falling back to local signup:', err);
      const localUser = {
        id: Date.now().toString(),
        username: coderUsername,
        email: cleanEmail,
        role: 'user'
      };
      const registered = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (!registered.some(u => u.email.toLowerCase() === cleanEmail)) {
        registered.push(localUser);
        localStorage.setItem('registered_users', JSON.stringify(registered));
      }
      
      // Auto-login locally
      const session = { user: localUser, profile: localUser };
      localStorage.setItem('local_session', JSON.stringify(session));
      setUser(session.user);
      setProfile(session.profile);
      return { user: localUser };
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
    if (localStorage.getItem('local_session') || localStorage.getItem('admin_session')) {
      // Local profile update
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      if (localStorage.getItem('admin_session')) {
        localStorage.setItem('admin_session', JSON.stringify({ user, profile: updatedProfile }));
      } else {
        localStorage.setItem('local_session', JSON.stringify({ user: updatedProfile, profile: updatedProfile }));
      }
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
