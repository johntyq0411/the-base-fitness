import React, { useState, useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function Trainers({ setActiveSection }) {
  const { trainers, bookPtSession, currentUser, members, trainerBlocks, ptBookings, isTimeRangeOverlapping, addOneHour, matchesDay } = useContext(GymContext);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingDay, setBookingDay] = useState('Monday');
  const [bookingTime, setBookingTime] = useState('10:00 AM');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];

  const handleOpenBooking = (trainer) => {
    if (currentUser.role === 'guest') {
      alert('Please log in as a Member first to book Personal Trainer sessions. Use the Simulator Bar!');
      setActiveSection('portal');
      return;
    }
    // Check if Member has active subscription
    const profile = members.find(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
    if (!profile || !profile.subscription) {
      alert('Active subscription required to book training sessions. Please subscribe to a package first!');
      setActiveSection('pricing');
      return;
    }

    if (!profile.trainer || profile.trainer === 'Pending Assignment') {
      alert('Your Personal Trainer assignment is pending admin assignment. Please wait until your coach is assigned.');
      return;
    }

    if (profile.trainer.toLowerCase() !== trainer.name.toLowerCase()) {
      alert(`You are assigned to ${profile.trainer}. You can only book PT sessions with your assigned coach.`);
      setActiveSection('portal');
      return;
    }

    const defaultDay = 'Monday';
    const firstAvailable = times.find(t => {
      const isBooked = ptBookings.some(b => b.trainerId === trainer.id && matchesDay(b.day, defaultDay) && isTimeRangeOverlapping(b.time, addOneHour(b.time), t, addOneHour(t)));
      const isBlocked = trainerBlocks.some(b => b.trainerId === trainer.id && matchesDay(b.day, defaultDay) && isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), t, addOneHour(t)));
      return !isBooked && !isBlocked;
    }) || '10:00 AM';

    setBookingDay(defaultDay);
    setBookingTime(firstAvailable);
    setSelectedTrainer(trainer);
  };

  const handleDayChange = (day) => {
    setBookingDay(day);
    if (!selectedTrainer) return;
    const firstAvailable = times.find(t => {
      const isBooked = ptBookings.some(b => b.trainerId === selectedTrainer.id && matchesDay(b.day, day) && isTimeRangeOverlapping(b.time, addOneHour(b.time), t, addOneHour(t)));
      const isBlocked = trainerBlocks.some(b => b.trainerId === selectedTrainer.id && matchesDay(b.day, day) && isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), t, addOneHour(t)));
      return !isBooked && !isBlocked;
    }) || '10:00 AM';
    setBookingTime(firstAvailable);
  };

  const handleConfirmBooking = () => {
    if (!selectedTrainer) return;
    const success = bookPtSession(selectedTrainer.id, bookingDay, bookingTime);
    if (success) {
      setSelectedTrainer(null);
    }
  };

  return (
    <section className="section" id="trainers" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
            Meet the Pros
          </span>
          <h2>Expert Personal Trainers</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            Work 1-on-1 with Kluang's top fitness professionals. Accelerate weight loss, master functional posture, or scale up your heavy lifts.
          </p>
        </div>

        <div className="grid-3">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="card trainer-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ position: 'relative', overflow: 'hidden', height: '250px' }}>
                <img 
                  src={
                    trainer.photo 
                      ? (trainer.photo.startsWith('http') || trainer.photo.startsWith('data:')
                        ? trainer.photo 
                        : `${import.meta.env.BASE_URL}${trainer.photo.startsWith('/') ? trainer.photo.substring(1) : trainer.photo}`)
                      : `${import.meta.env.BASE_URL}hero.png`
                  } 
                  alt={trainer.name} 
                  className="trainer-img" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Experience floating badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: '0.75rem', 
                  left: '0.75rem', 
                  backgroundColor: 'var(--primary-color)', 
                  color: 'var(--bg-dark)', 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '0.5rem', 
                  fontSize: '0.7rem', 
                  fontWeight: '700', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 2
                }}>
                  ⚡ {trainer.experienceYears} Years Exp
                </div>

                {/* Transformations floating badge */}
                {trainer.clientSuccessCount && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '0.75rem', 
                    right: '0.75rem', 
                    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
                    border: '1px solid var(--primary-color)',
                    color: 'white', 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    backdropFilter: 'blur(4px)',
                    zIndex: 2
                  }}>
                    🏆 {trainer.clientSuccessCount}
                  </div>
                )}
              </div>
              
              <div className="trainer-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 className="trainer-name" style={{ margin: 0, fontSize: '1.25rem' }}>{trainer.name}</h3>
                  
                  {trainer.instagram && (
                    <a 
                      href={`https://instagram.com/${trainer.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        color: 'var(--primary-color)', 
                        textDecoration: 'none', 
                        fontSize: '0.75rem', 
                        fontWeight: '700'
                      }}
                      title={`Follow ${trainer.name} on Instagram`}
                    >
                      <svg style={{ width: '15px', height: '15px', fill: 'currentColor' }} viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                      @{trainer.instagram}
                    </a>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.2rem 0 1rem 0' }}>
                  {trainer.specialties.map((spec, i) => (
                    <span 
                      key={i} 
                      className="badge badge-primary"
                      style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                
                <p className="trainer-bio" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  {trainer.bio}
                </p>

                {/* Certifications list */}
                {trainer.certifications && trainer.certifications.length > 0 && (
                  <div style={{ marginTop: 'auto', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>
                      📋 Credentials & Certs
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {trainer.certifications.slice(0, 3).map((cert, idx) => (
                        <li key={idx} style={{ marginBottom: '0.15rem' }}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievements list */}
                {trainer.achievements && trainer.achievements.length > 0 && (
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>
                      🏅 Achievements
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {trainer.achievements.slice(0, 2).map((ach, idx) => (
                        <li key={idx} style={{ marginBottom: '0.15rem' }}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentUser.role === 'admin' || currentUser.role === 'trainer' ? (
                  <button 
                    className="btn btn-secondary" 
                    disabled 
                    style={{ marginTop: 'auto', width: '100%', cursor: 'not-allowed', fontSize: '0.85rem' }}
                  >
                    View Bio Only
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: 'auto', width: '100%', fontSize: '0.85rem' }}
                    onClick={() => handleOpenBooking(trainer)}
                  >
                    Book 1-on-1 Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Booking Modal / Bottom Sheet */}
      {selectedTrainer && (
        <div className="modal-overlay" onClick={() => setSelectedTrainer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
              Book PT Session with <span className="text-glow">{selectedTrainer.name}</span>
            </h3>

            <div className="form-group">
              <label>Select Day</label>
              <select 
                className="form-control"
                value={bookingDay}
                onChange={(e) => handleDayChange(e.target.value)}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Time Slot</label>
              <select 
                className="form-control"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              >
                {times.map(t => {
                  const isBooked = ptBookings.some(b => b.trainerId === selectedTrainer.id && matchesDay(b.day, bookingDay) && isTimeRangeOverlapping(b.time, addOneHour(b.time), t, addOneHour(t)));
                  const block = trainerBlocks.find(b => b.trainerId === selectedTrainer.id && matchesDay(b.day, bookingDay) && isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), t, addOneHour(t)));
                  const isBlocked = !!block;
                  let label = t;
                  if (isBooked) {
                    label = `${t} (Booked)`;
                  } else if (isBlocked) {
                    label = block.type === 'personal_training' ? `${t} (Trainer Comp Prep)` : `${t} (Unavailable)`;
                  }
                  return (
                    <option key={t} value={t} disabled={isBooked || isBlocked}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
              💡 <strong>Booking Terms:</strong> Sessions must be cancelled at least 2 hours before the scheduled time. VIP package users will have 1 session deducted from their remaining credits.
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedTrainer(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
