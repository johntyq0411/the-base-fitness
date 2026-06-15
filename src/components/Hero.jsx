import React, { useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function Hero({ setActiveSection }) {
  const { gymSettings } = useContext(GymContext);

  return (
    <section className="hero-wrapper" id="home">
      <div 
        className="hero-bg-media" 
        style={{ backgroundImage: `url("${import.meta.env.BASE_URL}hero.png")` }}
      ></div>
      <div className="hero-overlay"></div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-tagline">
            Welcome to {gymSettings.name}
          </div>
          
          <h1 className="hero-title">
            Crush Your <span className="text-glow">Limits</span>.<br className="hero-br" /> Build Your <span className="text-glow">Legacy</span>.
          </h1>
          
          <p className="hero-description">
            {gymSettings.description}
          </p>
          
          <div className="hero-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setActiveSection('classes')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Gym Class
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveSection('pricing')}
            >
              Explore Memberships
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
