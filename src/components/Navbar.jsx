import React from 'react';

function Navbar({ currentView, setView, currentUser, setLogout }) {
  return (
    <nav>
      <div className="logo" onClick={() => setView('home')}>BEN 10</div>
      <div className="nav-links">
        <button
          className={currentView === 'home' ? 'active' : ''}
          onClick={() => setView('home')}
        >
          Home
        </button>
        <button
          className={currentView === 'omnitrix' ? 'active' : ''}
          onClick={() => setView('omnitrix')}
        >
          Omnitrix
        </button>
        <button
          className={currentView === 'ultimatrix' ? 'active' : ''}
          onClick={() => setView('ultimatrix')}
        >
          Ultimatrix
        </button>
        <div className="auth-btns">
          {currentUser && currentUser.role === 'admin' && (
            <button
              className={`admin-nav-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setView('admin')}
            >
              Admin
            </button>
          )}
          {currentUser ? (
            <div className="user-nav-info">
              <span className="user-welcome">HI, {currentUser.username.toUpperCase()}</span>
              <button className="logout-nav-btn" onClick={setLogout}>LOGOUT</button>
            </div>
          ) : (
            <>
              <button
                className={`login-nav-btn ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => setView('login')}
              >
                Login
              </button>
              <button
                className={`signup-nav-btn ${currentView === 'signup' ? 'active' : ''}`}
                onClick={() => setView('signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
