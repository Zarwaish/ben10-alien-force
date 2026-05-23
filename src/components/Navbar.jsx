import React, { useState } from 'react';
import { Menu, X, Shield, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar({ currentView, setView, currentUser, setLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'omnitrix', label: 'Omnitrix' },
    { id: 'ultimatrix', label: 'Ultimatrix' },
  ];

  const handleNavClick = (viewId) => {
    setView(viewId);
    setIsMenuOpen(false);
  };

  const displayName = currentUser?.user_metadata?.username ||
    currentUser?.email?.split('@')[0] || '';

  return (
    <nav className="navbar-v2">
      <div className="nav-container">
        <div className="nav-left">
          <div className="logo-v2" onClick={() => handleNavClick('home')}>
            <Shield size={28} color="var(--primary)" />
            <span>BEN 10</span>
          </div>
        </div>

        <div className="nav-center desktop-only">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
              {currentView === item.id && (
                <motion.div layoutId="nav-underline" className="nav-underline" />
              )}
            </button>
          ))}
        </div>

        <div className="nav-right desktop-only">
          {currentUser ? (
            <div className="user-profile-nav">
              {currentUser.email === 'admin@gmail.com' && (
                <button
                  className="admin-panel-btn"
                  onClick={() => handleNavClick('admin')}
                  title="Admin Panel"
                >
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </button>
              )}
              <div className="user-info-v2">
                <div
                  className="user-nav-identity"
                  onClick={() => handleNavClick('profile')}
                >
                  <User size={18} />
                  <span className="user-name">Hello, {displayName}</span>
                </div>
                <button className="logout-icon-btn" onClick={setLogout} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-group">
              <button className="login-link" onClick={() => handleNavClick('login')}>Login</button>
              <button className="signup-btn" onClick={() => handleNavClick('signup')}>Sign Up</button>
            </div>
          )}
        </div>

        <div className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-menu"
            >
              <div className="mobile-menu-header">
                <div className="logo-v2">
                  <Shield size={28} color="var(--primary)" />
                  <span>BEN 10</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)}><X size={28} /></button>
              </div>

              <div className="mobile-nav-links">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
                {currentUser ? (
                  <>
                    <button
                      className={`mobile-nav-item ${currentView === 'profile' ? 'active' : ''}`}
                      onClick={() => handleNavClick('profile')}
                    >
                      My Profile
                    </button>
                    {currentUser.email === 'admin@gmail.com' && (
                      <button
                        className={`mobile-nav-item admin-mobile-item ${currentView === 'admin' ? 'active' : ''}`}
                        onClick={() => handleNavClick('admin')}
                      >
                        ⚡ Admin Panel
                      </button>
                    )}
                  </>
                ) : null}
              </div>

              <div className="mobile-menu-footer">
                {currentUser ? (
                  <div className="mobile-user-card">
                    <div className="user-details">
                      <div className="user-avatar-v2">
                        {currentUser.avatar_url ? (
                          <img src={currentUser.avatar_url} alt="Avatar" />
                        ) : (
                          displayName[0]
                        )}
                      </div>
                      <div className="user-text">
                        <p>{displayName}</p>
                      </div>
                    </div>
                    <button className="mobile-logout-btn" onClick={setLogout}>
                      <LogOut size={18} /> LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="mobile-auth-btns">
                    <button className="mobile-login-btn" onClick={() => handleNavClick('login')}>LOGIN</button>
                    <button className="mobile-signup-btn" onClick={() => handleNavClick('signup')}>SIGN UP</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </nav>
  );
}

export default Navbar;
