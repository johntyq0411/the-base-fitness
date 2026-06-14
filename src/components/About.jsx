import React, { useContext, useState } from 'react';
import { GymContext } from '../context/GymContext';

export default function About() {
  const { gymSettings } = useContext(GymContext);
  const [activeSlide, setActiveSlide] = useState(0);

  const competencies = [
    {
      title: 'Brand New Machines',
      subtitle: 'Premium strength and loading options',
      desc: 'Equipped with brand new, plate-loaded and pin-selected strength machines to target every muscle group with optimal biomechanics.',
      image: 'brand_new_machines.png',
      badge: 'Equipment'
    },
    {
      title: 'Certified Personal Trainers',
      subtitle: 'Contest prep & transformation coaches',
      desc: 'Our coaches hold top credentials (NASM, ASCA) with over 20+ years of combined experience guiding athletes to the stage and members to their weight loss goals.',
      image: 'personal_training.png',
      badge: 'Expert Coaching'
    },
    {
      title: 'Anovator Body Composition',
      subtitle: 'Precision metabolic assessment diagnostic',
      desc: 'Ditch the standard scale. Get deep insights into your skeletal muscle mass, body fat percentage, visceral fat, and water levels to customize your plans.',
      image: 'body_analyzer.png',
      badge: 'Diagnostics'
    },
    {
      title: 'Modern Training Environment',
      subtitle: 'Vibrant dark crimson club styling',
      desc: 'Train in a high-energy, clean, spacious facility with motivational LED lighting, premium rubber flooring, and state-of-the-art power racks.',
      image: 'modern_gym_env.png',
      badge: 'Facility'
    },
    {
      title: 'Competition Coaching & Athlete Prep',
      subtitle: 'Specialized stage peaking programs',
      desc: 'Peaking protocols, competition posing workshops, and custom macronutrient contest schedules designed to build stage-ready physiques.',
      image: 'competition_coaching.png',
      badge: 'Athlete Prep'
    }
  ];

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % competencies.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + competencies.length) % competencies.length);
  };

  return (
    <section className="section" id="about">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
            Why Choose Us
          </span>
          <h2>Our Core Competencies</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
            At <strong>{gymSettings.name}</strong>, we provide a modern, high-energy space built to maximize your training success. We pride ourselves on the following core values.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="card" style={{ 
          padding: '2.5rem', 
          border: '1px solid var(--border-color)', 
          borderRadius: '1.5rem', 
          backgroundColor: 'var(--bg-card)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          
          <div className="grid-2" style={{ gap: '2rem', alignItems: 'center', minHeight: '350px' }}>
            
            {/* Image Column */}
            <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', height: '320px', border: '1px solid var(--border-color)' }}>
              <img 
                src={`${import.meta.env.BASE_URL}${competencies[activeSlide].image}`} 
                alt={competencies[activeSlide].title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }}
              />
              <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: 'var(--primary-color)', color: 'var(--bg-dark)', padding: '0.25rem 0.60rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '700', zIndex: 2 }}>
                {competencies[activeSlide].badge}
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(10,10,12,0.8) 0%, rgba(10,10,12,0) 60%)', zIndex: 1 }} />
            </div>

            {/* Text Content Column */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '1rem' }}>
              <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>
                Competency {activeSlide + 1} of {competencies.length}
              </span>
              <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                {competencies[activeSlide].title}
              </h3>
              <h4 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1.25rem', fontWeight: '500' }}>
                {competencies[activeSlide].subtitle}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                {competencies[activeSlide].desc}
              </p>

              {/* Navigation Arrows inside Text Column for better control layout */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                <button 
                  onClick={handlePrev}
                  className="btn btn-secondary"
                  style={{ 
                    width: '45px', 
                    height: '45px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                  }}
                  title="Previous Competency"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button 
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ 
                    width: '45px', 
                    height: '45px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0,
                    cursor: 'pointer'
                  }}
                  title="Next Competency"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {/* Indicator Dots at the bottom of the card */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {competencies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: activeSlide === idx ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Quick Info Block below the carousel */}
        <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem', color: 'white' }}>Quick Info</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🏢 <strong>Company:</strong> THE BASE FITNESS SDN BHD (1660350-U)</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <span>📍 <strong>Location:</strong> {gymSettings.address}</span>
            <span>📞 <strong>Phone:</strong> {gymSettings.phone}</span>
            <span>⏰ <strong>Hours:</strong> {gymSettings.operatingHours}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
