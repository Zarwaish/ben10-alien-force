import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/App.css';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import AlienShowcase from './components/AlienShowcase';
import AlienDetail from './components/AlienDetail';
import SignUp from './components/SignUp';
import Login from './components/Login';
import AuthRequired from './components/AuthRequired';
import WatchGallery from './components/WatchGallery';
import RequireAdmin from './components/RequireAdmin';
import AdminPanel from './components/AdminPanel';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

function App() {
  const [view, setView] = useState('home');
  const [selectedAlien, setSelectedAlien] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading: authLoading, logout, login, loginWithGoogle } = useAuth();

  // Mapping of view names to URL paths
  const viewPathMap = {
    home: '/',
    omnitrix: '/omnitrix',
    ultimatrix: '/ultimatrix',
    admin: '/admin',
    signup: '/signup',
    login: '/login',
  };

  // Sync view ↔ URL
  useEffect(() => {
    if (view !== 'home') {
      const path = viewPathMap[view];
      if (path && path !== location.pathname) {
        navigate(path, { replace: true });
      }
    }
  }, [view, navigate, location.pathname]);

  // Removed automatic view sync from URL pathname to prevent route persistence on refresh

  const handleTransform = (alien) => {
    setPreviousView(view);
    setSelectedAlien(alien);
    setView('alien-detail');
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Hero setView={setView} />
            <About />
            {/* Placeholder showcase – no data */}
            <AlienShowcase aliens={[]} loading={false} />
          </motion.div>
        );
      case 'admin':
        return (
          <RequireAdmin>
            <AdminPanel />
          </RequireAdmin>
        );
      case 'omnitrix':
        return user ? (
          <WatchGallery type="omnitrix" onTransform={handleTransform} />
        ) : (
          <AuthRequired targetView="omnitrix" setView={setView} />
        );
      case 'ultimatrix':
        return user ? (
          <WatchGallery type="ultimatrix" onTransform={handleTransform} />
        ) : (
          <AuthRequired targetView="ultimatrix" setView={setView} />
        );
      case 'signup':
        return <SignUp setView={setView} />;
      case 'login':
        return <Login setView={setView} onLoginSuccess={() => setView('home')} />;
      case 'alien-detail':
        return <AlienDetail alien={selectedAlien} onBack={() => setView(previousView)} />;
      default:
        return <Hero setView={setView} />;
    }
  };

  // Removed OAuth redirect persistence logic to avoid storing route state

  if (authLoading) {
    return (
      <div className="global-loader">
        <div className="omnitrix-spinner" />
        <span>Initializing DNA...</span>
      </div>
    );
  }

  return (
    <div className="App">
        {view !== 'admin' && (
          <>
            <div className="bg-glow glow-1" />
            <div className="bg-glow glow-2" />
          </>
        )}
      <Navbar currentView={view} setView={setView} currentUser={user} setLogout={logout} />
      <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
    </div>
  );
}

export default App;
