import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏎️ AgentTony Sports Hub
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/f1" 
            className={`navbar-item ${location.pathname === '/f1' ? 'active' : ''}`}
          >
            🏎️ F1 Races
          </Link>
          <Link 
            to="/basketball" 
            className={`navbar-item ${location.pathname === '/basketball' ? 'active' : ''}`}
          >
            🏀 Basketball
          </Link>
          <Link 
            to="/cricket" 
            className={`navbar-item ${location.pathname === '/cricket' ? 'active' : ''}`}
          >
            🏏 Cricket
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
