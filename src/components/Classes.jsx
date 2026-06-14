import React, { useState, useContext, useEffect } from 'react';
import { GymContext } from '../context/GymContext';

export default function Classes({ setActiveSection, isHomepage }) {
  const { timetable, bookClass, cancelClassBooking, currentUser, bookTrialClass } = useContext(GymContext);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New filters and views states
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'daily'
  const [selectedClassId, setSelectedClassId] = useState(null); // ID of class in detail modal
  const [trainerFilter, setTrainerFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [showOnlyBooked, setShowOnlyBooked] = useState(false);
  
  const [trialForm, setTrialForm] = useState({ name: '', email: '', phone: '' });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('class_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSelectedDay(getTodayDayName());
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Dynamically map class descriptions for richer UI
  const getClassDescription = (name) => {
    const defaultDesc = "Join our specialized group training session to challenge your limits, improve form mechanics, and build consistent habits under professional coaching.";
    const mappings = {
      'Functional Machine Training': 'Optimize your mechanical leverage and strength using specialized machines. Ideal for safe muscle building and movement patterns.',
      'HIIT Circuit': 'High-Intensity Interval Training circuit designed to maximize cardiovascular capacity and ignite metabolism through dynamic station rotations.',
      'Powerlifting & Competition Prep': 'Focus on competitive compound lifting: Squat, Bench Press, and Deadlift. Learn proper competition setup, rules, and peaking cycles.',
      'Athlete Body Recomp Clinic': 'Learn scientific body composition tracking, nutrition timing, and structural training protocols to build muscle and drop fat simultaneously.',
      'Vinyasa Flow Yoga': 'Connect breath with movement in a continuous flowing sequence. Improves athletic range of motion, flexibility, and mind-muscle recovery.',
      'HIIT Cardio Combat': 'An intense martial arts-inspired cardio training session combining kicks, punches, and explosive bodyweight intervals.',
      'Upper Body Blast': 'Targeted hypertrophy and strength session focusing on the chest, back, shoulders, and arms to build structural balance.',
      'Zumba & Aerobics': 'High energy dance fitness workout combining Latin and international music rhythms. Fun, active cardio training for everyone.',
      'Advanced Athlete Competition Prep': 'Elite level contest prep class targeting posing symmetry, stage presence, mental peaking, and advanced loading/depletion protocols.',
      'Functional Core Strength': 'Develop dynamic core stability, trunk rigidity, and rotational athletic power. Essential support for heavy compound movements.',
      'Core & Machine Circuit': 'A hybrid circuit focusing on core endurance and machine isolation to finish your training week with high metabolic stimulus.',
      'Weekend Yoga Flow': 'Decompress and reset after a taxing training week with mobility flows, myofascial releases, and restorative breathing exercises.',
      'Competition Posing & Athlete Conditioning': 'Master specific federation posing criteria, endurance holds, and athletic recovery routines to maximize your stage impact.',
      'Athlete Peak Performance Prep': 'Sunday peak session optimizing joint health, neuromuscular activation, and overall performance readiness for the week ahead.'
    };
    return mappings[name] || defaultDesc;
  };

  // Helper to parse time strings like "08:00 AM - 09:30 AM" into sortable minutes from midnight
  const parseTimeToMinutes = (timeStr) => {
    try {
      const startPart = timeStr.split('-')[0].trim();
      const [time, modifier] = startPart.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch (e) {
      return 0;
    }
  };

  // Determine current day of week to highlight column
  const getTodayDayName = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    return dayNames[todayIndex];
  };
  const todayDayName = getTodayDayName();

  // Extract unique values dynamically from timetable for filters
  const uniqueTrainers = [...new Set(timetable.map(c => c.trainer))].sort();
  const uniqueRooms = [...new Set(timetable.map(c => c.room))].sort();

  // Filter timetable classes globally
  const filteredClasses = timetable.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trainer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrainer = !trainerFilter || c.trainer === trainerFilter;
    const matchesRoom = !roomFilter || c.room === roomFilter;
    const matchesBooked = !showOnlyBooked || (currentUser.role === 'member' && c.enrolled.includes(currentUser.email));

    return matchesSearch && matchesTrainer && matchesRoom && matchesBooked;
  });

  // Handle class booking / trial booking modal trigger
  const handleCardClick = (classObj) => {
    setSelectedClassId(classObj.id);
  };

  const handleBook = (classId) => {
    if (currentUser.role === 'guest') {
      // Keep selected class open but guest modal gets processed inside
      return;
    }
    bookClass(classId);
  };

  // Find currently open class detail safely from the fresh state
  const activeClass = selectedClassId ? timetable.find(c => c.id === selectedClassId) : null;

  if (isHomepage) {
    const featuredClasses = [
      {
        name: 'Competition Physique & Body Recomp',
        coach: 'Coach Alex Tan',
        level: 'Beginner to Stage Athlete',
        desc: 'Build stage-ready muscle, master posing mechanics, and optimize body composition under certified contest-prep coaching.',
        tag: 'Physique & Stage',
        icon: '🏆'
      },
      {
        name: 'Powerlifting & Competition Strength',
        coach: 'Coach Marcus Lim',
        level: 'Beginner to Peaking Athlete',
        desc: 'Master competitive compound lifting (Squats, Bench, Deadlifts) and peaking protocols designed to set personal records.',
        tag: 'Contest Peaking',
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
        name: 'Athlete Mobility & Yoga Flow',
        coach: 'Coach Sarah Wong',
        level: 'Recovery & Flexibility Focus',
        desc: 'Deep stretching flows and joint decompression designed to accelerate muscle recovery and improve performance ranges.',
        tag: 'Recovery & Flow',
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

  // Mobile UI Helper functions
  const getClassEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('yoga') || lower.includes('vinyasa') || lower.includes('flow')) return '🧘';
    if (lower.includes('hiit') || lower.includes('cardio') || lower.includes('combat') || lower.includes('fiit')) return '🔥';
    if (lower.includes('strength') || lower.includes('powerlifting') || lower.includes('machine') || lower.includes('blast') || lower.includes('core')) return '💪';
    if (lower.includes('zumba') || lower.includes('aerobics')) return '💃';
    if (lower.includes('posing') || lower.includes('athlete') || lower.includes('recomp') || lower.includes('competition')) return '🏆';
    return '🏋️';
  };

  const getClassDuration = (timeStr) => {
    try {
      const parts = timeStr.split('-');
      if (parts.length < 2) return '45m';
      const startMin = parseTimeToMinutes(parts[0]);
      const endMin = parseTimeToMinutes(parts[1]);
      const diff = endMin - startMin;
      return `${diff > 0 ? diff : 45}m`;
    } catch (e) {
      return '45m';
    }
  };

  const getMobileDates = () => {
    const mobileDaysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
    return mobileDaysOrder.map((dayName, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + idx);
      return {
        name: dayName,
        shortName: dayName.substring(0, 3),
        dateNum: date.getDate(),
        fullDateObj: date
      };
    });
  };

  const getSelectedDayDateFormatted = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mobileDaysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const index = mobileDaysOrder.indexOf(selectedDay);
    if (index === -1) return '';
    const date = new Date(today);
    date.setDate(today.getDate() - dayOfWeek + index);
    
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${weekday} ${dayNum} ${month} ${year}`;
  };

  const handleActionButtonClick = (e, c) => {
    e.stopPropagation();
    if (currentUser.role === 'member') {
      const isEnrolled = c.enrolled.includes(currentUser.email);
      if (isEnrolled) {
        cancelClassBooking(c.id);
      } else {
        bookClass(c.id);
      }
    } else {
      handleCardClick(c);
    }
  };

  const toggleFavorite = (className, e) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(className)) {
      newFavs = favorites.filter(f => f !== className);
    } else {
      newFavs = [...favorites, className];
    }
    setFavorites(newFavs);
    try {
      localStorage.setItem('class_favorites', JSON.stringify(newFavs));
    } catch (err) {}
  };

  const renderDetailsModal = () => {
    if (!activeClass) return null;
    return (
      <div className="class-modal-overlay" onClick={() => setSelectedClassId(null)}>
        <div className="class-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button className="class-modal-close" onClick={() => setSelectedClassId(null)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Time / Day Badge */}
          <div className="class-modal-time-badge">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{activeClass.day} | {activeClass.time}</span>
          </div>

          {/* Class Title */}
          <h3 className="class-modal-title">{activeClass.name}</h3>

          {/* Class Meta Grid */}
          <div className="class-modal-meta-grid">
            <div className="class-modal-meta-item">
              <span className="class-modal-meta-label">Coach</span>
              <span className="class-modal-meta-val">👤 {activeClass.trainer}</span>
            </div>
            <div className="class-modal-meta-item">
              <span className="class-modal-meta-label">Location Room</span>
              <span className="class-modal-meta-val">📍 {activeClass.room}</span>
            </div>
          </div>

          {/* Class Description */}
          <div className="class-modal-desc">
            {getClassDescription(activeClass.name)}
          </div>

          {/* Class Capacity & slots */}
          <div className="class-modal-capacity">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Capacity Status</span>
              <span>{activeClass.enrolled.length} / {activeClass.capacity} Booked Slots</span>
            </div>
            
            {/* Progress Bar */}
            {(() => {
              const percentFull = (activeClass.enrolled.length / activeClass.capacity) * 100;
              return (
                <div style={{ width: '100%', height: '8px', backgroundColor: '#1f2937', borderRadius: '4px', overflow: 'hidden' }}>
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
              );
            })()}

            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: '500' }}>
              {(() => {
                const spotsLeft = activeClass.capacity - activeClass.enrolled.length;
                if (spotsLeft <= 0) return <span style={{ color: '#ef4444' }}>⚠️ Sorry, this class has reached maximum capacity.</span>;
                if (spotsLeft <= 3) return <span style={{ color: '#f59e0b' }}>🔥 Low availability! Only {spotsLeft} slots left.</span>;
                return <span style={{ color: '#22c55e' }}>✅ Class is open. {spotsLeft} slots currently available.</span>;
              })()}
            </div>
          </div>

          {/* Admin/Trainer View: Roster list */}
          {(currentUser.role === 'admin' || currentUser.role === 'trainer') && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                📋 Enrolled Members List ({activeClass.enrolled.length})
              </h4>
              {activeClass.enrolled.length > 0 ? (
                <div style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {activeClass.enrolled.map((email, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0' }}>
                        <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
                        {email}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No members booked yet.</p>
              )}
            </div>
          )}

          {/* Trial Booking Form for Guests inside detail modal */}
          {currentUser.role === 'guest' ? (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Book Your Free Guest Trial</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const success = bookTrialClass(activeClass.id, trialForm);
                if (success) {
                  alert(`Successfully requested trial for ${activeClass.name}! Our team will contact you shortly at ${trialForm.phone} or ${trialForm.email} to confirm your session.`);
                  setSelectedClassId(null);
                  setTrialForm({ name: '', email: '', phone: '' });
                }
              }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Your Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. John Doe"
                    value={trialForm.name}
                    onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="e.g. john@example.com"
                    value={trialForm.email}
                    onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Phone Number (Mobile)</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="e.g. +60 12-345 6789"
                    value={trialForm.phone}
                    onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, height: '42px', padding: 0 }} onClick={() => setSelectedClassId(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '42px', padding: 0 }}>
                    Submit Trial Request
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Booking / Cancellation Action Buttons for logged-in users */
            <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem 0', borderRadius: '0.75rem' }} onClick={() => setSelectedClassId(null)}>
                Close
              </button>

              {currentUser.role === 'member' ? (
                (() => {
                  const isEnrolled = activeClass.enrolled.includes(currentUser.email);
                  const spotsLeft = activeClass.capacity - activeClass.enrolled.length;
                  
                  if (isEnrolled) {
                    return (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ flex: 2, padding: '0.75rem 0', borderRadius: '0.75rem', border: '1px solid #ef4444', color: '#ef4444' }}
                        onClick={() => {
                          cancelClassBooking(activeClass.id);
                        }}
                      >
                        Cancel Booking
                      </button>
                    );
                  } else if (spotsLeft <= 0) {
                    return (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ flex: 2, padding: '0.75rem 0', borderRadius: '0.75rem' }} 
                        disabled
                      >
                        Class Full
                      </button>
                    );
                  } else {
                    return (
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        style={{ flex: 2, padding: '0.75rem 0', borderRadius: '0.75rem' }}
                        onClick={() => {
                          handleBook(activeClass.id);
                        }}
                      >
                        Book Session
                      </button>
                    );
                  }
                })()
              ) : (
                currentUser.role !== 'admin' && currentUser.role !== 'trainer' && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '0.75rem 0', borderRadius: '0.75rem' }}
                    onClick={() => alert('Please log in as a member to book group classes.')}
                  >
                    Sign In to Book
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isHomepage && isMobile) {
    const mobileDates = getMobileDates();
    const mobileClassesForDay = filteredClasses
      .filter(c => c.day === selectedDay)
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    return (
      <div className="mobile-classes-wrapper" id="classes">
        <div className="mobile-classes-header">
          <h1 className="mobile-classes-title">Classes</h1>
          <button className="mobile-classes-filter-btn" onClick={() => setIsMobileFilterOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>

        <div className="mobile-search-box">
          <svg width="18" height="18" fill="none" stroke="#6b7280" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input 
            type="text" 
            className="mobile-search-input" 
            placeholder="Search for classes or instructors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mobile-date-bar">
          {mobileDates.map((item) => {
            const isActive = selectedDay === item.name;
            return (
              <button 
                key={item.name}
                className={`mobile-date-card ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDay(item.name)}
              >
                <span className="mobile-date-card-day">{item.shortName}</span>
                <span className="mobile-date-card-num">{item.dateNum}</span>
                {isActive && <div className="mobile-date-card-dot" />}
              </button>
            );
          })}
        </div>

        <div className="mobile-day-title">
          {getSelectedDayDateFormatted()}
        </div>

        <div className="mobile-classes-list">
          {mobileClassesForDay.length > 0 ? (
            mobileClassesForDay.map(c => {
              const spotsLeft = c.capacity - c.enrolled.length;
              const isEnrolled = currentUser.role === 'member' && c.enrolled.includes(currentUser.email);
              const isFavorite = favorites.includes(c.name);

              return (
                <div 
                  key={c.id} 
                  className={`mobile-class-row ${isEnrolled ? 'booked' : ''}`}
                  onClick={() => handleCardClick(c)}
                >
                  <div className="mobile-class-time-col">
                    <span className="mobile-class-time">{c.time.split(' - ')[0]}</span>
                    <span className="mobile-class-duration">{getClassDuration(c.time)}</span>
                  </div>

                  <div className="mobile-class-info-col">
                    <div className="mobile-class-name-row">
                      <button 
                        onClick={(e) => toggleFavorite(c.name, e)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '0.2rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          color: isFavorite ? '#ef4444' : 'rgba(255,255,255,0.25)',
                          transition: 'all 0.2s ease',
                          marginRight: '0.25rem'
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorite ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <span className="mobile-class-name">
                        {getClassEmoji(c.name)} {c.name}
                      </span>
                      {spotsLeft <= 3 && spotsLeft > 0 && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" style={{ marginLeft: '0.25rem', flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                    </div>

                    <span className="mobile-class-instructor">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {c.trainer}
                    </span>

                    <span className="mobile-class-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {c.room}
                    </span>

                    {isEnrolled && (
                      <span className="mobile-class-status-you">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        You
                      </span>
                    )}
                  </div>

                  <div className="mobile-class-action-col">
                    {isEnrolled ? (
                      <button 
                        className="mobile-action-btn booked" 
                        onClick={(e) => handleActionButtonClick(e, c)}
                        title="Cancel booking"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <button 
                        className="mobile-action-btn unbooked" 
                        onClick={(e) => handleActionButtonClick(e, c)}
                        title="Book class"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#6b7280' }}>
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: '0.4' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <p style={{ fontSize: '0.9rem' }}>No classes scheduled for this day or matching your search criteria.</p>
            </div>
          )}
        </div>

        {/* Bottom Filter Drawer Portal / Overlay */}
        {isMobileFilterOpen && (
          <div className="mobile-filter-drawer" onClick={() => setIsMobileFilterOpen(false)}>
            <div className="mobile-filter-content" onClick={(e) => e.stopPropagation()}>
              <h4 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Filter Timetable
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Select Coach</label>
                  <select 
                    className="form-control" 
                    value={trainerFilter} 
                    onChange={(e) => setTrainerFilter(e.target.value)}
                    style={{ height: '42px', fontSize: '0.85rem', backgroundColor: '#1e1f22', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <option value="">All Coaches</option>
                    {uniqueTrainers.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Select Room</label>
                  <select 
                    className="form-control" 
                    value={roomFilter} 
                    onChange={(e) => setRoomFilter(e.target.value)}
                    style={{ height: '42px', fontSize: '0.85rem', backgroundColor: '#1e1f22', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <option value="">All Rooms</option>
                    {uniqueRooms.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {currentUser.role === 'member' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>Show My Bookings Only</span>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={showOnlyBooked} 
                        onChange={(e) => setShowOnlyBooked(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: showOnlyBooked ? 'var(--primary-color)' : '#374151',
                        transition: '.4s',
                        borderRadius: '24px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px', width: '18px',
                          left: showOnlyBooked ? '23px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#121214',
                          transition: '.4s',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.8rem 0', borderRadius: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {renderDetailsModal()}
      </div>
    );
  }

  return (
    <section className="section" id="classes" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        
        {/* Timetable Title */}
        <div className="timetable-header">
          <div>
            <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
              Gym Class Scheduler
            </span>
            <h2>Group Fitness Classes</h2>
          </div>
        </div>

        {/* Timetable Search & Filter Controls */}
        <div className="timetable-controls">
          <div className="timetable-filters">
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search class or coach..." 
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', margin: 0, height: '42px', fontSize: '0.85rem' }}
              />
              <svg 
                style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} 
                width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            {/* Coach Filter */}
            <select 
              className="filter-select"
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              style={{ height: '42px' }}
            >
              <option value="">All Coaches</option>
              {uniqueTrainers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Room Filter */}
            <select 
              className="filter-select"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              style={{ height: '42px' }}
            >
              <option value="">All Rooms</option>
              {uniqueRooms.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* My Bookings Checkbox (Member Only) */}
            {currentUser.role === 'member' && (
              <label className={`filter-checkbox-label ${showOnlyBooked ? 'active' : ''}`} style={{ height: '42px' }}>
                <input 
                  type="checkbox"
                  checked={showOnlyBooked}
                  onChange={(e) => setShowOnlyBooked(e.target.checked)}
                />
                <span>My Bookings Only</span>
              </label>
            )}
          </div>

          {/* View Toggler (Calendar vs Daily list) */}
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Weekly Calendar
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Daily Schedule
            </button>
          </div>
        </div>

        {/* --- WEEKLY CALENDAR GRID VIEW --- */}
        {viewMode === 'calendar' && (
          <div className="calendar-container">
            <div className="calendar-grid">
              {days.map(day => {
                const dayClasses = filteredClasses.filter(c => c.day === day);
                const sortedDayClasses = [...dayClasses].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
                const isToday = day === todayDayName;

                return (
                  <div key={day} className={`calendar-column ${isToday ? 'is-today' : ''}`}>
                    <div className="calendar-column-header">
                      <span className="calendar-day-name">{day}</span>
                      <span className="calendar-day-label">{isToday ? 'Today' : 'Gym Slot'}</span>
                    </div>

                    {sortedDayClasses.length > 0 ? (
                      sortedDayClasses.map(c => {
                        const spotsLeft = c.capacity - c.enrolled.length;
                        const isEnrolled = currentUser.role === 'member' && c.enrolled.includes(currentUser.email);
                        
                        return (
                          <div 
                            key={c.id} 
                            className={`calendar-class-card ${isEnrolled ? 'booked' : ''}`}
                            onClick={() => handleCardClick(c)}
                          >
                            <div className="calendar-card-time">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              <span>{c.time.split(' - ')[0]}</span>
                            </div>
                            <div className="calendar-card-title">{c.name}</div>
                            <div className="calendar-card-meta">
                              <span>👤 {c.trainer.split(' ').slice(-1)[0]}</span>
                              <span>📍 {c.room}</span>
                            </div>
                            <div className="calendar-card-spots">
                              {isEnrolled ? (
                                <span className="booked-badge">Booked</span>
                              ) : spotsLeft <= 0 ? (
                                <span className="spots-badge full">Full</span>
                              ) : spotsLeft <= 3 ? (
                                <span className="spots-badge low">{spotsLeft} left</span>
                              ) : (
                                <span className="spots-badge ok">{spotsLeft} slots</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                        No sessions
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- DAILY LIST VIEW --- */}
        {viewMode === 'daily' && (
          <>
            {/* Day Selection Tabs */}
            <div className="day-tabs">
              {days.map(day => {
                const dayClassesCount = filteredClasses.filter(c => c.day === day).length;
                return (
                  <button 
                    key={day}
                    className={`day-tab ${selectedDay === day ? 'active' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="day-full">{day} ({dayClassesCount})</span>
                    <span className="day-short">{day.substring(0, 3)} ({dayClassesCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Classes list for selected day */}
            {filteredClasses.filter(c => c.day === selectedDay).length > 0 ? (
              <div className="class-grid" style={{ marginTop: '2rem' }}>
                {filteredClasses
                  .filter(c => c.day === selectedDay)
                  .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
                  .map(c => {
                    const spotsLeft = c.capacity - c.enrolled.length;
                    const percentFull = (c.enrolled.length / c.capacity) * 100;
                    const isEnrolled = currentUser.role === 'member' && c.enrolled.includes(currentUser.email);

                    return (
                      <div 
                        key={c.id} 
                        className={`class-card ${isEnrolled ? 'booked' : ''}`}
                        onClick={() => handleCardClick(c)}
                      >
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
                          {isEnrolled ? (
                            <span className="spots-ok" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                              Booked
                            </span>
                          ) : spotsLeft <= 0 ? (
                            <span className="spots-left">⚠️ Full Capacity</span>
                          ) : spotsLeft <= 3 ? (
                            <span className="spots-left">🔥 Only {spotsLeft} slots left!</span>
                          ) : (
                            <span className="spots-ok">✅ {spotsLeft} slots available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: '0.5' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <p>No group fitness classes match your filters for {selectedDay}.</p>
              </div>
            )}
          </>
        )}

      </div>

      {/* --- CLASS DETAIL MODAL OVERLAY --- */}
      {renderDetailsModal()}
    </section>
  );
}
