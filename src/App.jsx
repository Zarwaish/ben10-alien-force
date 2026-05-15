import React, { useState, useEffect } from 'react';
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

// Data
import { aliensData } from './data/aliensData';

function App() {
  const [view, setView] = useState('home');
  const [selectedAlien, setSelectedAlien] = useState(null);
  
  // Database Persistence (LocalStorage)
  const [aliens, setAliens] = useState(() => {
    const savedAliens = localStorage.getItem('ben10_aliens');
    return savedAliens ? JSON.parse(savedAliens) : aliensData;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('ben10_users');
    return savedUsers ? JSON.parse(savedUsers) : [
      { username: 'Ben Tennyson', email: 'ben@plumber.com', password: '123', role: 'user' },
      { username: 'Gwen Tennyson', email: 'gwen@plumber.com', password: '123', role: 'user' }
    ];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem('ben10_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Sync to Database
  useEffect(() => {
    localStorage.setItem('ben10_aliens', JSON.stringify(aliens));
  }, [aliens]);

  useEffect(() => {
    localStorage.setItem('ben10_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ben10_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ben10_session');
    }
  }, [currentUser]);

  const handleSignUp = (newUser) => {
    const userWithRole = { ...newUser, role: 'user' };
    setUsers([...users, userWithRole]);
    setCurrentUser(userWithRole);
    setView('home');
  };

  const handleLogin = (email, password) => {
    // Admin Check
    if (email === 'dullgamerz321' && password === 'dullgamerz321') {
      const adminUser = { username: 'Admin', email: 'dullgamerz321', role: 'admin' };
      setCurrentUser(adminUser);
      setView('admin');
      return true;
    }

    // Regular User Check
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setView('home');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const handleTransform = (alien) => {
    setSelectedAlien(alien);
    setView('alien-detail');
  };

  const handleAddAlien = (newAlien) => {
    setAliens([...aliens, { ...newAlien, gallery: [newAlien.img] }]);
  };

  const handleDeleteAlien = (name) => {
    setAliens(aliens.filter(a => a.name !== name));
  };

  return (
    <div className="App">
      <div className="bg-glow glow-2"></div>
      <Navbar 
        currentView={view} 
        setView={setView} 
        currentUser={currentUser} 
        setLogout={handleLogout} 
      />

      {view === 'home' ? (
        <>
          <Hero setView={setView} />
          <About />
          <AlienShowcase aliens={aliens} />
        </>
      ) : view === 'omnitrix' ? (
        <DeviceSelector key="omnitrix-selector" type="omnitrix" onTransform={handleTransform} aliens={aliens} />
      ) : view === 'ultimatrix' ? (
        <DeviceSelector key="ultimatrix-selector" type="ultimatrix" onTransform={handleTransform} aliens={aliens} />
      ) : view === 'signup' ? (
        <SignUp setView={setView} onSignUp={handleSignUp} />
      ) : view === 'login' ? (
        <Login setView={setView} onLogin={handleLogin} />
      ) : view === 'admin' ? (
        currentUser && currentUser.role === 'admin' ? (
          <AdminPanel 
            registeredUsers={users} 
            aliens={aliens} 
            onAddAlien={handleAddAlien} 
            onDeleteAlien={handleDeleteAlien}
            onLogout={handleLogout} 
          />
        ) : (
          <Login setView={setView} onLogin={handleLogin} />
        )
      ) : (
        <AlienDetail alien={selectedAlien} onBack={() => setView('omnitrix')} />
      )}
    </div>
  );
}

export default App;
