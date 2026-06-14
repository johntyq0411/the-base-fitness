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
            <h2>Kluang's Premier Training Hub</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              At <strong>{gymSettings.name}</strong>, we believe fitness is not a chore—it's a lifestyle. We offer a high-octane environment designed to motivate and push you. Our specialized Muay Thai Arena, heavy-duty power racks, and specialized recovery support are crafted to meet the needs of absolute beginners and experienced athletes alike.
            </p>
            
            <div className="about-features" style={{ marginBottom: '2rem' }}>
              <div className="about-feature-box">
                <h4>Muay Thai Arena</h4>
                <p>Authentic training bag station & sparring boxing ring.</p>
              </div>
              <div className="about-feature-box">
                <h4>Powerlifting Zone</h4>
                <p>Heavy lifting racks, Olympic barbells, and free weights.</p>
              </div>
              <div className="about-feature-box">
                <h4>Cardio Burn</h4>
                <p>Equipped with treadmills, spinning cycles, and HIIT rigs.</p>
              </div>
              <div className="about-feature-box">
                <h4>Elite Coaches</h4>
                <p>1-on-1 personalized programs and progress tracking.</p>
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: 'white' }}>Quick Info</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
                src="muay_thai.png" 
                alt="Gym Muay Thai Session" 
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
