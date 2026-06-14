import React, { useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function About() {
  const { gymSettings } = useContext(GymContext);

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="grid-2">
          
          <div>
            <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
              Why Choose Us
            </span>
            <h2>Why Join THE BASE FITNESS?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              At <strong>{gymSettings.name}</strong>, we provide a modern, high-energy space built to maximize your training success. Rebuild your health, track your progress, and unlock your true physical potential with our premium services.
            </p>
            
            <div className="about-features" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>
                <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>✅</span> Brand New Machines
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>
                <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>✅</span> Certified Personal Trainer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>
                <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>✅</span> Anovator Body Composition Analyze
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>
                <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>✅</span> Modern Training Environment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>
                <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>✅</span> Stronger Community, Better Results
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: 'white' }}>Quick Info</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                🏢 <strong>Company:</strong> THE BASE FITNESS SDN BHD (1660350-U)<br />
                📍 <strong>Location:</strong> {gymSettings.address}<br />
                📞 <strong>Phone:</strong> {gymSettings.phone}<br />
                ⏰ <strong>Hours:</strong> {gymSettings.operatingHours}
              </p>
            </div>
          </div>
          
          <div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '-15px', right: '15px', bottom: '15px', border: '2px solid var(--primary-color)', borderRadius: '1.5rem', zIndex: '0' }}></div>
              <img 
                src={`${import.meta.env.BASE_URL}personal_training.png`} 
                alt="Gym Training Session" 
                className="about-img"
                style={{ position: 'relative', zIndex: '1' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
