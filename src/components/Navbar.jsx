import React, { useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function Navbar({ activeSection, setActiveSection }) {
  const { currentUser, login, logout, gymSettings } = useContext(GymContext);

  const handleSimulateRole = (role, email = '') => {
    if (role === 'guest') {
      logout();
      setActiveSection('home');
    } else {
      let simEmail = email;
      if (role === 'member' && !email) simEmail = 'member@gmail.com';
      if (role === 'trainer' && !email) simEmail = 't2'; // Marcus
      if (role === 'admin' && !email) simEmail = 'admin@thebasefitness.com';
      login(simEmail, role);
      setActiveSection('portal');
    }
  };

  const isTrainer = currentUser.role === 'trainer';

  const navItems = isTrainer 
    ? [
        { id: 'portal', label: 'Trainer Portal' },
        { id: 'logout', label: 'Log Out', action: () => { logout(); setActiveSection('home'); } }
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'Our Gym' },
        { id: 'classes', label: 'Timetable' },
        { id: 'pricing', label: 'Memberships' },
        { id: 'trainers', label: 'Trainers' },
        ...(currentUser.role === 'member' ? [{ id: 'shop', label: '🧪 Shop', isShop: true }] : []),
        { id: 'portal', label: currentUser.role !== 'guest' ? `${currentUser.role.toUpperCase()} Portal` : 'Join Us', isCTA: true },
      ];

  return (
    <>
      {/* Simulation Bar for Demo purposes */}
      <div className="role-simulator">
        <div className="container simulator-container">
          <div>
            <span>Demo Mode: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
          </div>
          <div className="simulator-actions">
            <span>Switch Role:</span>
            <button 
              className={`simulator-btn ${currentUser.role === 'guest' ? 'active' : ''}`}
              onClick={() => handleSimulateRole('guest')}
            >
              Guest
            </button>
            <button 
              className={`simulator-btn ${currentUser.role === 'member' && currentUser.email === 'member@gmail.com' ? 'active' : ''}`}
              onClick={() => handleSimulateRole('member', 'member@gmail.com')}
            >
              Member (Subscribed)
            </button>
            <button 
              className={`simulator-btn ${currentUser.role === 'member' && currentUser.email === 'guest_member@gmail.com' ? 'active' : ''}`}
              onClick={() => handleSimulateRole('member', 'guest_member@gmail.com')}
            >
              Member (No Sub)
            </button>
            <button 
              className={`simulator-btn ${currentUser.role === 'trainer' ? 'active' : ''}`}
              onClick={() => handleSimulateRole('trainer', 't2')}
            >
              Trainer
            </button>
            <button 
              className={`simulator-btn ${currentUser.role === 'admin' ? 'active' : ''}`}
              onClick={() => handleSimulateRole('admin', 'admin@thebasefitness.com')}
            >
              Admin/Manager
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar-header">
        <div className="container nav-container">
          <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); if (!isTrainer) setActiveSection('home'); }} aria-label="The Base Fitness" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="The Base Fitness Logo" style={{ height: '55px', width: 'auto', display: 'block' }} />
          </a>

          {/* Mobile Call To Action Button (Utilizing header space for Max Buy-In / Conversion) */}
          {!isTrainer && (
            <div className="mobile-header-cta">
              {currentUser.role === 'guest' ? (
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '0.4rem 0.9rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    borderRadius: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 0 10px var(--primary-glow)',
                    height: 'auto'
                  }}
                  onClick={() => setActiveSection('portal')}
                >
                  ⚡ Join Us
                </button>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  style={{ 
                    padding: '0.4rem 0.9rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    borderRadius: '0.5rem',
                    textTransform: 'uppercase',
                    borderColor: 'var(--primary-color)',
                    color: 'white',
                    height: 'auto'
                  }}
                  onClick={() => setActiveSection('portal')}
                >
                  Portal
                </button>
              )}
            </div>
          )}

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            {navItems.map((item) => {
              if (item.isCTA) {
                return (
                  <button
                    key={item.id}
                    className="btn btn-primary"
                    style={{ 
                      padding: '0.5rem 1.25rem', 
                      fontSize: '0.85rem', 
                      fontWeight: '800', 
                      borderRadius: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 0 10px var(--primary-glow)',
                      height: 'auto'
                    }}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.label === 'Join Us' ? '⚡ Join Us' : item.label}
                  </button>
                );
              }
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Sticky Bottom Thumb Navigation */}
      {isTrainer ? (
        <nav className="mobile-nav" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <a 
            href="#portal" 
            className={`mobile-nav-item ${activeSection === 'portal' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveSection('portal'); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Trainer Portal
          </a>
          <a 
            href="#logout" 
            className="mobile-nav-item"
            onClick={(e) => { e.preventDefault(); logout(); setActiveSection('home'); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </a>
        </nav>
      ) : (
        <nav className="mobile-nav" style={{ display: 'grid', gridTemplateColumns: currentUser.role === 'member' ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', width: '100%', boxSizing: 'border-box' }}>
          <a 
            href="#home" 
            className={`mobile-nav-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveSection('home'); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
          <a 
            href="#classes" 
            className={`mobile-nav-item ${activeSection === 'classes' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveSection('classes'); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Timetable
          </a>
          <a 
            href="#pricing" 
            className={`mobile-nav-item ${activeSection === 'pricing' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveSection('pricing'); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pricing
          </a>
          {currentUser.role === 'member' && (
            <a 
              href="#shop" 
              className={`mobile-nav-item ${activeSection === 'shop' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('shop'); }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop
            </a>
          )}
          <a 
            href="#portal" 
            className={`mobile-nav-item ${activeSection === 'portal' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveSection('portal'); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {currentUser.role === 'guest' ? 'Join Us' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
          </a>
        </nav>
      )}
    </>
  );
}
