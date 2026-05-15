import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import './styles/App.css';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import AlienShowcase from './components/AlienShowcase';
import AlienDetail from './components/AlienDetail';
import SignUp from './components/SignUp';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import DeviceSelector from './components/DeviceSelector';

// Hooks & Services
import { useAliens } from './hooks/useAliens';
import { supabase } from './lib/supabase';

function App() {
  const [view, setView] = useState('home');
  const [selectedAlien, setSelectedAlien] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  const { 
    aliens, 
    loading: aliensLoading, 
    addAlien, 
    updateAlien, 
    deleteAlien 
  } = useAliens();

  // Handle Supabase Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setSessionLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setSessionLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCurrentUser({ ...user, ...data });
      } else {
        // Fallback for users without profile record
        setCurrentUser({ ...user, role: 'user', username: user.email.split('@')[0] });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView('home');
  };

  const handleTransform = (alien) => {
    setSelectedAlien(alien);
    setView('alien-detail');
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <Hero setView={setView} />
            <About />
            <AlienShowcase aliens={aliens} loading={aliensLoading} />
          </motion.div>
        );
      case 'omnitrix':
        return <DeviceSelector key="omnitrix" type="omnitrix" onTransform={handleTransform} aliens={aliens} />;
      case 'ultimatrix':
        return <DeviceSelector key="ultimatrix" type="ultimatrix" onTransform={handleTransform} aliens={aliens} />;
      case 'signup':
        return <SignUp setView={setView} />;
      case 'login':
        return <Login setView={setView} onLoginSuccess={() => setView('home')} />;
      case 'admin':
        return currentUser?.role === 'admin' ? (
          <AdminPanel 
            aliens={aliens}
            onAddAlien={addAlien}
            onUpdateAlien={updateAlien}
            onDeleteAlien={deleteAlien}
            onLogout={handleLogout}
          />
        ) : (
          <Login setView={setView} onLoginSuccess={() => setView('admin')} />
        );
      case 'alien-detail':
        return <AlienDetail alien={selectedAlien} onBack={() => setView('omnitrix')} />;
      default:
        return <Hero setView={setView} />;
    }
  };

  if (sessionLoading) {
    return (
      <div className="global-loader">
        <div className="omnitrix-spinner"></div>
        <span>Initializing DNA...</span>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      
      <Navbar 
        currentView={view} 
        setView={setView} 
        currentUser={currentUser} 
        setLogout={handleLogout} 
      />

      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </div>
  );
}

export default App;
