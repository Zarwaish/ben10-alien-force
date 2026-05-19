import React, { useState } from 'react';
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
import AdminPanel from './components/AdminPanel';
import DeviceSelector from './components/DeviceSelector';
import UserProfile from './components/UserProfile';

// Hooks & Services
import { useAliens } from './hooks/useAliens';
import { useAuth } from './hooks/useAuth';

function App() {
  const [view, setView] = useState('home');
  const [selectedAlien, setSelectedAlien] = useState(null);
  
  const { user, profile, loading: authLoading, isAdmin, logout } = useAuth();
  const { 
    aliens, 
    loading: aliensLoading, 
    addAlien, 
    updateAlien, 
    deleteAlien 
  } = useAliens();

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
        return user ? (
          <DeviceSelector key="omnitrix" type="omnitrix" onTransform={handleTransform} aliens={aliens} />
        ) : (
          <Login setView={setView} targetView="omnitrix" onLoginSuccess={() => setView('omnitrix')} />
        );
      case 'ultimatrix':
        return user ? (
          <DeviceSelector key="ultimatrix" type="ultimatrix" onTransform={handleTransform} aliens={aliens} />
        ) : (
          <Login setView={setView} targetView="ultimatrix" onLoginSuccess={() => setView('ultimatrix')} />
        );
      case 'signup':
        return <SignUp setView={setView} />;
      case 'login':
        return <Login setView={setView} onLoginSuccess={() => setView('home')} />;
      case 'profile':
        return <UserProfile />;
      case 'admin':
        return isAdmin ? (
          <AdminPanel 
            aliens={aliens}
            onAddAlien={addAlien}
            onUpdateAlien={updateAlien}
            onDeleteAlien={deleteAlien}
            onLogout={logout}
          />
        ) : (
          <Login setView={setView} targetView="admin" onLoginSuccess={() => setView('admin')} />
        );
      case 'alien-detail':
        return <AlienDetail alien={selectedAlien} onBack={() => setView('home')} />;
      default:
        return <Hero setView={setView} />;
    }
  };

  React.useEffect(() => {
    if (user) {
      const redirectView = sessionStorage.getItem('oauth_redirect_view');
      if (redirectView) {
        setView(redirectView);
        sessionStorage.removeItem('oauth_redirect_view');
      }
    }
  }, [user]);

  if (authLoading) {
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
        currentUser={profile} 
        setLogout={logout} 
      />

      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </div>
  );
}

export default App;

