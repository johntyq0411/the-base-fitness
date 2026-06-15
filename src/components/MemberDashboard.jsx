import React, { useState, useContext } from 'react';
import { GymContext } from '../context/GymContext';

// Helper to generate a rolling 14-day timeline starting from Today (inclusive)
const get14Days = () => {
  const list = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const monthStr = months[monthIndex];
    const dateNum = d.getDate();
    const dateNumStr = String(dateNum).padStart(2, '0');
    
    const dayName = dayNames[d.getDay()];
    const dateLabel = `${dateNumStr}/${monthStr}`;
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${dateNumStr}`;
    
    list.push({
      dayName,
      dateLabel,
      dateKey,
      dateNum,
      shortName: dayName.substring(0, 3),
      fullDateObj: d,
      isToday: i === 0
    });
  }
  return list;
};

// Helper to format date label from YYYY-MM-DD
const getFormattedDateFromKey = (key) => {
  if (!key) return '';
  const parts = key.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month - 1, day);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[d.getMonth()];
    const dayName = dayNames[d.getDay()];
    return `${dayName} ${day}/${monthName}`;
  }
  return key;
};

export default function MemberDashboard({ setActiveSection }) {
  const { 
    currentUser, 
    members, 
    setMembers,
    timetable, 
    cancelClassBooking, 
    ptBookings, 
    cancelPtBooking,
    logout,
    trainers,
    bookPtSession,
    trainerBlocks,
    isTimeRangeOverlapping,
    addOneHour,
    matchesDay,
    anovatorRequests,
    requestAnovatorScan
  } = useContext(GymContext);

  const [photoUploading, setPhotoUploading] = useState(false);

  const handleMemberPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        
        // Update member's photo in context
        setMembers(prev => prev.map(m => {
          if (m.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return { ...m, photo: dataUrl };
          }
          return m;
        }));
        
        setPhotoUploading(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Find member profile details
  const profile = members.find(m => m.email.toLowerCase() === currentUser.email.toLowerCase()) || {
    email: currentUser.email,
    name: currentUser.name,
    subscription: null,
    trainer: null,
    ptSessionsLeft: 0,
    phone: '',
    trainingPlan: '',
    mealPlan: ''
  };

  // Find classes the user has enrolled in specifically, including date-specific bookings
  const bookedSessionsList = [];
  timetable.forEach(c => {
    c.enrolled.forEach(e => {
      if (e.includes(':')) {
        const [email, dateStr] = e.split(':');
        if (email.toLowerCase() === currentUser.email.toLowerCase()) {
          bookedSessionsList.push({
            ...c,
            bookingKey: `${c.id}:${dateStr}`,
            dateStr,
            displayDate: getFormattedDateFromKey(dateStr)
          });
        }
      } else if (e.toLowerCase() === currentUser.email.toLowerCase()) {
        bookedSessionsList.push({
          ...c,
          bookingKey: `${c.id}:generic`,
          dateStr: '',
          displayDate: c.day
        });
      }
    });
  });

  // Find PT bookings for this user
  const userPtBookings = ptBookings.filter(b => b.memberEmail.toLowerCase() === currentUser.email.toLowerCase());

  // Personal training booking local state
  const [ptDay, setPtDay] = useState(() => {
    const daysList = get14Days();
    return daysList.length > 0 ? daysList[0].dateKey : '';
  });
  const [ptTime, setPtTime] = useState('10:00 AM');

  // Anovator A5 scan booking state
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanDate, setScanDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scanTime, setScanTime] = useState('10:00 AM');
  const [scanNotes, setScanNotes] = useState('');

  // Filter scan requests for this member
  const memberScanRequests = anovatorRequests.filter(
    r => r.memberEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  // Find assigned coach details
  const assignedCoach = trainers.find(t => t.name.toLowerCase() === (profile.trainer || '').toLowerCase());

  const handlePtDayChange = (day) => {
    setPtDay(day);
    if (!assignedCoach) return;
    const times = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
    const firstAvailable = times.find(t => {
      const isBooked = ptBookings.some(b => b.trainerId === assignedCoach.id && matchesDay(b.day, day) && isTimeRangeOverlapping(b.time, addOneHour(b.time), t, addOneHour(t)));
      const isBlocked = trainerBlocks.some(b => b.trainerId === assignedCoach.id && matchesDay(b.day, day) && isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), t, addOneHour(t)));
      return !isBooked && !isBlocked;
    });
    if (firstAvailable) {
      setPtTime(firstAvailable);
    }
  };

  return (
    <div className="section" style={{ minHeight: '70vh' }}>
      <div className="container">
        
        {/* Profile Info Header */}
        <div className="portal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Clickable Profile Photo */}
            <div 
              onClick={() => document.getElementById('member-photo-input').click()}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                overflow: 'hidden', border: '2px solid var(--primary-color)',
                cursor: 'pointer', position: 'relative',
                background: 'rgba(255,255,255,0.04)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)', flexShrink: 0
              }}
              title="Click to change profile picture"
            >
              {profile.photo ? (
                <img 
                  src={profile.photo} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>👤</div>
              )}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%'
              }}
                className="hover-edit-overlay"
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: '700' }}>EDIT</span>
              </div>
            </div>
            
            <input 
              id="member-photo-input"
              type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={handleMemberPhotoUpload}
            />

            <div className="profile-card-details">
              <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Welcome Back
              </span>
              <h3>
                {profile.name}
                {photoUploading && <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>⏳ Updating...</span>}
              </h3>
              <p>📧 {profile.email}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="subscription-status-badge">
              {profile.subscription ? (
                <span>⚡ Membership: <strong>{profile.subscription}</strong></span>
              ) : (
                <span style={{ color: '#ef4444' }}>⚠️ No Active Subscription</span>
              )}
            </div>
            
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem', borderRadius: '0.75rem' }}
              onClick={() => { logout(); setActiveSection('home'); }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Action Suggestion if No Subscription */}
        {!profile.subscription && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px dashed #ef4444', borderRadius: '1rem', padding: '2rem', textAlign: 'center', marginBottom: '3rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Start Training Today!</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              You need an active subscription pass to book group training classes and lock in personal coaching hours.
            </p>
            <button className="btn btn-primary" onClick={() => setActiveSection('pricing')}>
              Browse Subscription Plans
            </button>
          </div>
        )}

        {/* Supplement Shop Promo Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0505 60%, #0d0d0d 100%)',
          border: '1px solid rgba(220, 38, 38, 0.25)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          flexWrap: 'wrap',
          boxShadow: '0 4px 24px rgba(220, 38, 38, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧪</span>
              <div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(220,38,38,0.8)', fontWeight: '800', textTransform: 'uppercase' }}>Member Exclusive</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'white', fontWeight: '800' }}>MUTANT® Supplement Shop</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Official distributor — get exclusive member discounts on Whey, Mass, Creatine, ISO, BCAA & EAA
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            {profile.subscription && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#34d399', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  UP TO 20%
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>member savings</div>
              </div>
            )}
            <button
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.4rem', fontWeight: '700', borderRadius: '10px', fontSize: '0.85rem', flexShrink: 0 }}
              onClick={() => setActiveSection('shop')}
            >
              Shop Now →
            </button>
          </div>
        </div>

        {/* Training & Meal Plans Section */}
        {profile.subscription && profile.trainer && profile.trainer !== 'Pending Assignment' && (
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-color)', boxShadow: '0 8px 32px var(--shadow-color)' }}>
            <span style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              My Personalized Coach Programs
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Training & Meal Plans (by {profile.trainer})
            </h3>
            
            <div className="grid-2" style={{ gap: '2rem', alignItems: 'stretch' }}>
              {/* Training Plan Card */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
                <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏋️ Workout Schedule & Routine
                </h4>
                {Array.isArray(profile.trainingPlan) ? (
                  profile.trainingPlan.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {profile.trainingPlan.map((ex, idx) => (
                        <div key={idx} style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <strong style={{ color: 'white', fontSize: '0.95rem' }}>{ex.name}</strong>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{ex.sets} Sets x {ex.reps} Reps</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>Weight/Load: <strong style={{ color: 'white' }}>{ex.load || 'N/A'}</strong></span>
                            <span>Rest: <strong style={{ color: 'white' }}>{ex.rest || 'N/A'}</strong></span>
                          </div>
                          {ex.notes && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                              💡 Notes: {ex.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No exercises assigned yet. Your coach will update this shortly.</p>
                  )
                ) : (
                  <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {profile.trainingPlan || 'No training plan has been assigned yet. Your coach will update this shortly.'}
                  </div>
                )}
              </div>

              {/* Meal Plan Card */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
                <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🥗 Diet & Nutrition Guidelines
                </h4>
                {profile.mealPlan && typeof profile.mealPlan === 'object' && profile.mealPlan.targets ? (
                  <div>
                    {/* Calories & Macros Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Daily Calories</span>
                        <strong style={{ fontSize: '1.1rem', color: '#f97316' }}>{profile.mealPlan.targets.calories} <span style={{ fontSize: '0.75rem' }}>kcal</span></strong>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Protein</span>
                        <strong style={{ fontSize: '1.1rem', color: '#06b6d4' }}>{profile.mealPlan.targets.protein} <span style={{ fontSize: '0.75rem' }}>g</span></strong>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Carbohydrates</span>
                        <strong style={{ fontSize: '1.1rem', color: '#a3e635' }}>{profile.mealPlan.targets.carbs} <span style={{ fontSize: '0.75rem' }}>g</span></strong>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Fats</span>
                        <strong style={{ fontSize: '1.1rem', color: '#ec4899' }}>{profile.mealPlan.targets.fats} <span style={{ fontSize: '0.75rem' }}>g</span></strong>
                      </div>
                    </div>

                    {/* Macro Split visual bar */}
                    {(() => {
                      const targets = profile.mealPlan.targets;
                      const totalGrams = Number(targets.protein) + Number(targets.carbs) + Number(targets.fats);
                      if (totalGrams <= 0) return null;
                      const pPct = ((targets.protein / totalGrams) * 100).toFixed(0);
                      const cPct = ((targets.carbs / totalGrams) * 100).toFixed(0);
                      const fPct = ((targets.fats / totalGrams) * 100).toFixed(0);
                      return (
                        <div style={{ marginBottom: '1.25rem', padding: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Macro Grams Split Ratio</span>
                          <div style={{ display: 'flex', height: '8px', borderRadius: '99px', overflow: 'hidden', backgroundColor: 'var(--bg-dark)' }}>
                            <div style={{ width: `${pPct}%`, backgroundColor: '#06b6d4' }} />
                            <div style={{ width: `${cPct}%`, backgroundColor: '#a3e635' }} />
                            <div style={{ width: `${fPct}%`, backgroundColor: '#ec4899' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <span>P: {pPct}%</span>
                            <span>C: {cPct}%</span>
                            <span>F: {fPct}%</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Meal items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Meals Schedule</span>
                      {Array.isArray(profile.mealPlan.meals) && profile.mealPlan.meals.length > 0 ? (
                        profile.mealPlan.meals.map((meal, mIdx) => (
                          <div key={mIdx} style={{ backgroundColor: 'var(--bg-dark)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                            <strong style={{ display: 'block', color: 'white', fontSize: '0.85rem', marginBottom: '0.2rem' }}>🍳 {meal.name}</strong>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              {meal.items || 'No menu details added.'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No meals planned yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {profile.mealPlan || 'No nutritional plan has been assigned yet. Your coach will update this shortly.'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Photos Card */}
            {profile.progressPhotos && profile.progressPhotos.length > 0 && (
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <h4 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
                  📸 My Transformations & Progress Photos
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {profile.progressPhotos.map((set) => (
                    <div key={set.id} style={{ border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem', backgroundColor: 'var(--bg-dark)' }}>
                      <div style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                        <strong style={{ color: 'white', fontSize: '1rem' }}>📅 Date: {getFormattedDateFromKey(set.date) || set.date}</strong>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
                        {/* Before photo */}
                        <div style={{ textAlign: 'center', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 'bold', zIndex: 5 }}>
                            BEFORE
                          </span>
                          <img 
                            src={set.before} 
                            alt="Before Progress" 
                            style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} 
                          />
                        </div>

                        {/* After photo */}
                        <div style={{ textAlign: 'center', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#10b981', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 'bold', zIndex: 5 }}>
                            AFTER
                          </span>
                          <img 
                            src={set.after} 
                            alt="After Progress" 
                            style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} 
                          />
                        </div>
                      </div>
                      
                      {set.notes && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                          💡 Coach Comments: {set.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid-2" style={{ alignItems: 'start' }}>
          
          {/* Class Bookings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>My Booked Classes</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                onClick={() => setActiveSection('classes')}
              >
                + Book New
              </button>
            </div>
            {bookedSessionsList.length > 0 ? (
              <div className="list-table-container">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Class Details</th>
                      <th>Schedule</th>
                      <th>Room</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookedSessionsList.map(b => (
                      <tr key={b.bookingKey}>
                        <td data-label="Class Details">
                          <strong>{b.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Coach: {b.trainer}
                          </span>
                        </td>
                        <td data-label="Schedule">
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{b.displayDate}</span>
                          <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.2rem' }}>{b.time.split(' - ')[0]}</span>
                        </td>
                        <td data-label="Room">{b.room}</td>
                        <td data-label="Action">
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => cancelClassBooking(b.id, b.dateStr)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>You haven't reserved any group classes.</p>
              </div>
            )}
          </div>

          {/* Personal Trainer Bookings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>1-on-1 PT Sessions</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                onClick={() => setActiveSection('trainers')}
              >
                + Schedule PT
              </button>
            </div>

            {/* Coach Assignment info */}
            {profile.subscription && (profile.subscription.includes('VIP') || profile.ptSessionsLeft > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Assigned Coach</span>
                    <h4 style={{ color: 'white', fontSize: '1.1rem', marginTop: '0.1rem' }}>{profile.trainer || 'Assigning soon...'}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PT Balance</span>
                    <h4 style={{ color: 'var(--primary-color)', fontSize: '1.25rem', marginTop: '0.1rem' }}>{profile.ptSessionsLeft} Sessions</h4>
                  </div>
                </div>

                {profile.trainer === 'Pending Assignment' ? (
                  <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px dashed var(--primary-color)', borderRadius: '1rem', padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    ⚠️ <strong>Coach Assignment Pending:</strong> Our administrator is manually assigning a personal coach to your profile. You will be able to book sessions and view plans once a coach is linked.
                  </div>
                ) : assignedCoach ? (
                  /* Booking form inside portal */
                  <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
                    <h4 style={{ color: 'white', marginBottom: '0.75rem', fontSize: '0.95rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📅 Book Session with {assignedCoach.name}
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Select Day</label>
                        <select className="form-control" value={ptDay} onChange={(e) => handlePtDayChange(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem', height: 'auto' }}>
                          {get14Days().map(d => (
                            <option key={d.dateKey} value={d.dateKey}>{d.dayName} {d.dateLabel}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Time Slot</label>
                        <select className="form-control" value={ptTime} onChange={(e) => setPtTime(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem', height: 'auto' }}>
                          {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map(t => {
                            const isBooked = ptBookings.some(b => b.trainerId === assignedCoach.id && matchesDay(b.day, ptDay) && isTimeRangeOverlapping(b.time, addOneHour(b.time), t, addOneHour(t)));
                            const block = trainerBlocks.find(b => b.trainerId === assignedCoach.id && matchesDay(b.day, ptDay) && isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), t, addOneHour(t)));
                            const isBlocked = !!block;
                            let label = t;
                            if (isBooked) {
                              label = `${t} (Booked)`;
                            } else if (isBlocked) {
                              label = block.type === 'personal_training' ? `${t} (Trainer Comp Prep)` : `${t} (Unavailable)`;
                            }
                            return (
                              <option key={t} value={t} disabled={isBooked || isBlocked}>{label}</option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}
                      onClick={() => bookPtSession(assignedCoach.id, ptDay, ptTime)}
                      disabled={profile.ptSessionsLeft <= 0}
                    >
                      {profile.ptSessionsLeft <= 0 ? 'No Session Credits Left' : 'Confirm Book Slot'}
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {userPtBookings.length > 0 ? (
              <div className="list-table-container">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Trainer</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPtBookings.map(b => (
                      <tr key={b.id}>
                        <td data-label="Trainer">
                          <strong>{b.trainerName}</strong>
                        </td>
                        <td data-label="Day">{getFormattedDateFromKey(b.day)}</td>
                        <td data-label="Time">{b.time}</td>
                        <td data-label="Action">
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => cancelPtBooking(b.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No personal training sessions scheduled.</p>
              </div>
            )}
          </div>

        {/* ─── Anovator A5 Health Assessment Section ─── */}
        {profile.subscription && (
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>🩺 Anovator A5 Health Assessment</h3>
              <button 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.6rem 1.4rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, #f97316 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
                }}
                onClick={() => setShowScanModal(true)}
              >
                📋 Book Anovator A5 Health Assessment
              </button>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(249,115,22,0.05) 100%)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              💡 <strong style={{ color: 'white' }}>How it works:</strong> Book a 30-minute full body scan session. 
              {profile.trainer && profile.trainer !== 'Pending Assignment' 
                ? <> Your request will be sent to <strong style={{ color: '#06b6d4' }}>{profile.trainer}</strong> for acceptance.</>
                : <> Your request will be visible to all available trainers. Once a trainer accepts, your slot is confirmed.</>}
            </div>

            {/* Scan Requests List */}
            {memberScanRequests.length > 0 ? (
              <div className="list-table-container">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Trainer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberScanRequests.map(r => (
                      <tr key={r.id}>
                        <td data-label="Date">
                          <strong>{getFormattedDateFromKey(r.date)}</strong>
                        </td>
                        <td data-label="Time">
                          {r.startTime} – {r.endTime}
                        </td>
                        <td data-label="Status">
                          {r.status === 'pending' ? (
                            <span className="badge" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>⏳ Pending Approval</span>
                          ) : r.status === 'accepted' ? (
                            <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>✅ Confirmed</span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>❌ {r.status}</span>
                          )}
                        </td>
                        <td data-label="Trainer">
                          {r.acceptedByTrainerName 
                            ? <strong style={{ color: '#10b981' }}>{r.acceptedByTrainerName}</strong>
                            : r.assignedTrainerName 
                              ? <span style={{ color: 'var(--text-secondary)' }}>Assigned: {r.assignedTrainerName}</span>
                              : <span style={{ color: 'var(--text-secondary)' }}>Any Available</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔬</div>
                <p>No scan sessions booked yet. Click the button above to schedule your first Anovator A5 Health Assessment!</p>
              </div>
            )}
          </div>
        )}

        {/* Anovator Scan Booking Modal */}
        {showScanModal && (
          <div className="modal-overlay" onClick={() => setShowScanModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{ 
              maxWidth: '480px', 
              width: '90%', 
              padding: '2rem', 
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              border: '1px solid rgba(6,182,212,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <button 
                onClick={() => setShowScanModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩺</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.3rem' }}>Book Anovator A5 Health Assessment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>30-minute full body diagnostic scan</p>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Select Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={scanDate}
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })()}
                  onChange={e => setScanDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Select Time Slot</label>
                <select className="form-control" value={scanTime} onChange={e => setScanTime(e.target.value)}>
                  {['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Notes (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Any specific concerns or areas to focus on..."
                  value={scanNotes}
                  onChange={e => setScanNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ 
                background: 'rgba(6,182,212,0.08)', 
                border: '1px solid rgba(6,182,212,0.2)', 
                borderRadius: '8px', 
                padding: '0.75rem', 
                marginBottom: '1.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                ⏱️ Duration: <strong style={{ color: 'white' }}>30 minutes</strong><br/>
                📋 Includes: 3D Posture Analysis, BIA Body Composition, Blood Pressure, SpO₂, Balance Testing<br/>
                {profile.trainer && profile.trainer !== 'Pending Assignment' 
                  ? <>👨‍🏫 Assigned Trainer: <strong style={{ color: '#06b6d4' }}>{profile.trainer}</strong></>
                  : <>👨‍🏫 Request will be sent to: <strong style={{ color: '#fbbf24' }}>All Available Trainers</strong></>}
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem', fontWeight: '700', fontSize: '0.95rem', borderRadius: '10px' }}
                onClick={() => {
                  const result = requestAnovatorScan(scanDate, scanTime, scanNotes);
                  if (result) {
                    setShowScanModal(false);
                    setScanNotes('');
                  }
                }}
              >
                Submit Scan Request
              </button>
            </div>
          </div>
        )}

        </div>

      </div>
    </div>
  );
}
