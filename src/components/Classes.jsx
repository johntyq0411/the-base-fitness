import React, { useState, useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function Classes({ setActiveSection, isHomepage }) {
  const { timetable, bookClass, currentUser, bookTrialClass } = useContext(GymContext);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassForTrial, setSelectedClassForTrial] = useState(null);
  const [trialForm, setTrialForm] = useState({ name: '', email: '', phone: '' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter timetable by day and search query (matches name or trainer)
  const filteredClasses = timetable.filter(c => 
    c.day === selectedDay &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.trainer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBook = (classId) => {
    if (currentUser.role === 'guest') {
      const targetClass = timetable.find(c => c.id === classId);
      setSelectedClassForTrial(targetClass);
      return;
    }
    bookClass(classId);
  };

  if (isHomepage) {
    const featuredClasses = [
      {
        name: 'Functional Strength & Recomposition',
        coach: 'Coach Alex Tan',
        level: 'All Experience Levels',
        desc: 'Build functional strength, master movement mechanics, and optimize body composition under personalized instruction.',
        tag: 'Strength & Machine',
        icon: '💪'
      },
      {
        name: 'Strength & Powerlifting Elite',
        coach: 'Coach Marcus Lim',
        level: 'Beginner to Competitive Athlete',
        desc: 'Master compound movement patterns (Squats, Bench, Deadlifts) and correct postures to build core physical power.',
        tag: 'Strength & Iron',
        icon: '🏋️'
      },
      {
        name: 'HIIT & Fat Loss Circuits',
        coach: 'Coach Sarah Wong',
        level: 'High Energy Interval Training',
        desc: 'Combine intense bodyweight movements with cardiorespiratory intervals to supercharge metabolism and lose fat.',
        tag: 'Cardio Burn',
        icon: '⚡'
      },
      {
        name: 'Vinyasa Flow Yoga',
        coach: 'Coach Sarah Wong',
        level: 'Stretching & Recovery focus',
        desc: 'Restorative posture stretches and core muscle activation flows designed to increase joint mobility and accelerate recovery.',
        tag: 'Mind & Body Flow',
        icon: '🧘'
      }
    ];

    return (
      <section className="section" id="classes" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
              Gym Classes Offered
            </span>
            <h2>Our Signature Training Programs</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
              We provide expert-led group programs tailored to unlock your full physical capabilities and keep you consistent.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
            {featuredClasses.map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-card)', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{item.tag}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' }}>{item.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>{item.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Coach: <strong style={{ color: 'white' }}>{item.coach}</strong></span>
                  <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{item.level}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '0.8rem 2rem', fontWeight: '700', fontSize: '0.9rem', borderRadius: '0.75rem' }}
              onClick={() => setActiveSection('classes')}
            >
              📅 View Weekly Timetable & Book Class
            </button>
          </div>

        </div>
      </section>
    );
  }

  return (
    <section className="section" id="classes" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        
        <div className="timetable-header">
          <div>
            <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
              Weekly Timetable
            </span>
            <h2>Group Fitness Classes</h2>
          </div>
          
          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Search class or coach..." 
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <svg 
              style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} 
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="day-tabs">
          {days.map(day => (
            <button 
              key={day}
              className={`day-tab ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="day-full">{day}</span>
              <span className="day-short">{day.substring(0, 3)}</span>
            </button>
          ))}
        </div>

        {/* Classes List */}
        {filteredClasses.length > 0 ? (
          <div className="class-grid" style={{ marginTop: '2rem' }}>
            {filteredClasses.map(c => {
              const spotsLeft = c.capacity - c.enrolled.length;
              const percentFull = (c.enrolled.length / c.capacity) * 100;
              const isEnrolled = currentUser.role === 'member' && c.enrolled.includes(currentUser.email);

              return (
                <div key={c.id} className="class-card">
                  <div className="class-time">{c.time}</div>
                  <h3 className="class-title">{c.name}</h3>
                  
                  <div className="class-meta">
                    <span>👤 <strong>Coach:</strong> {c.trainer}</span>
                    <span>📍 <strong>Location:</strong> {c.room}</span>
                  </div>

                  {/* Enrollment Progress Bar */}
                  <div style={{ margin: '1rem 0 0.5rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', fontWeight: '500' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Capacity Booking</span>
                      <span>{c.enrolled.length} / {c.capacity} Slots</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${percentFull}%`, 
                          height: '100%', 
                          backgroundColor: percentFull >= 100 ? '#ef4444' : 'var(--primary-color)',
                          boxShadow: percentFull < 100 ? '0 0 8px var(--primary-color)' : 'none',
                          transition: 'width 0.4s ease'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="class-spots">
                    {spotsLeft <= 0 ? (
                      <span className="spots-left">⚠️ Full Capacity</span>
                    ) : spotsLeft <= 3 ? (
                      <span className="spots-left">🔥 Only {spotsLeft} slots left!</span>
                    ) : (
                      <span className="spots-ok">✅ {spotsLeft} slots available</span>
                    )}
                  </div>

                  {/* Contextual Action Buttons */}
                  {currentUser.role === 'admin' || currentUser.role === 'trainer' ? (
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                      <strong style={{ color: 'white', display: 'block', marginBottom: '0.3rem' }}>Enrolled Members:</strong>
                      {c.enrolled.length > 0 ? (
                        <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-secondary)' }}>
                          {c.enrolled.map((email, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
                              {email}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No members booked yet</span>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ marginTop: 'auto', width: '100%' }}
                      onClick={() => handleBook(c.id)}
                      disabled={spotsLeft <= 0 && !isEnrolled && currentUser.role !== 'guest'}
                    >
                      {currentUser.role === 'guest' ? (
                        'Book Trial Class'
                      ) : isEnrolled ? (
                        <>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Booked
                        </>
                      ) : spotsLeft <= 0 ? (
                        'Class Full'
                      ) : (
                        'Book Session'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: '0.5' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p>No group fitness classes scheduled for {selectedDay}.</p>
          </div>
        )}

      </div>

      {/* Trial Booking Modal for Guests */}
      {selectedClassForTrial && (
        <div className="modal-overlay" onClick={() => setSelectedClassForTrial(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              Book Free Trial: <span className="text-glow">{selectedClassForTrial.name}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Selected Slot: <strong>{selectedClassForTrial.day} at {selectedClassForTrial.time}</strong> with {selectedClassForTrial.trainer}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const success = bookTrialClass(selectedClassForTrial.id, trialForm);
              if (success) {
                alert(`Successfully requested trial for ${selectedClassForTrial.name}! Our team will contact you shortly at ${trialForm.phone} or ${trialForm.email} to confirm your session.`);
                setSelectedClassForTrial(null);
                setTrialForm({ name: '', email: '', phone: '' });
              }
            }}>
              <div className="form-group">
                <label>Your Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. John Doe"
                  value={trialForm.name}
                  onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. john@example.com"
                  value={trialForm.email}
                  onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number (Mobile)</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="e.g. +60 12-345 6789"
                  value={trialForm.phone}
                  onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                  required
                />
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
                📝 <strong>Trial Policy:</strong> Free trial is valid for first-time visitors only. Standard gym rules and attire guidelines apply.
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedClassForTrial(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Trial Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
