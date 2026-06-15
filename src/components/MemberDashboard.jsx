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
    matchesDay
  } = useContext(GymContext);

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
          <div className="profile-card-details">
            <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
              Welcome Back
            </span>
            <h3>{profile.name}</h3>
            <p>📧 {profile.email}</p>
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

        </div>

      </div>
    </div>
  );
}
