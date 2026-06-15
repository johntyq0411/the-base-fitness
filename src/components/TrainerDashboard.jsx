import React, { useState, useContext, useEffect } from 'react';
import { GymContext } from '../context/GymContext';

export default function TrainerDashboard({ setActiveSection }) {
  const { 
    trainers, 
    members, 
    ptBookings, 
    cancelPtBooking, 
    currentUser, 
    login, 
    logout,
    trainerBlocks,
    addTrainerBlock,
    removeTrainerBlock,
    updateTrainingPlan,
    updateMealPlan,
    updateTrainerProfile
  } = useContext(GymContext);

  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedMemberEmail, setSelectedMemberEmail] = useState(null);

  // Identify active trainer details from currentUser
  const activeTrainerId = currentUser.email.startsWith('t') ? currentUser.email : 't2';
  const activeTrainer = trainers.find(t => t.id === activeTrainerId) || trainers[1];

  // SWITCH COACH SIMULATION
  const handleTrainerChange = (e) => {
    const targetId = e.target.value;
    const coach = trainers.find(t => t.id === targetId);
    if (coach) {
      login(coach.id, 'trainer');
    }
  };

  // MEMBERS ASSIGNED
  const assignedMembers = members.filter(m => 
    m.trainer && m.trainer.toLowerCase().includes(activeTrainer.name.toLowerCase())
  );

  // PT BOOKINGS
  const scheduledSessions = ptBookings.filter(b => b.trainerId === activeTrainer.id);

  // --- CALENDAR AVAILABILITY STATE ---
  const [calDay, setCalDay] = useState('Monday');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const times = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];

  // --- CLIENT EDITING PLAN STATE ---
  const selectedMember = members.find(m => m.email === selectedMemberEmail);
  
  // Exercise Builder form state
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('4');
  const [exReps, setExReps] = useState('10');
  const [exLoad, setExLoad] = useState('');
  const [exRest, setExRest] = useState('90s');
  const [exNotes, setExNotes] = useState('');

  // Nutrition Builder form state
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fats, setFats] = useState(65);
  const [mealsState, setMealsState] = useState([]);

  // --- WHATSAPP TEMPLATES STATE ---
  const [waTemplate, setWaTemplate] = useState('checkin');
  const [waCustomText, setWaCustomText] = useState('');

  // Sync client plans to local inputs when active client changes
  useEffect(() => {
    if (selectedMember) {
      // Load Nutrition
      setCalories(selectedMember.mealPlan?.targets?.calories || 2000);
      setProtein(selectedMember.mealPlan?.targets?.protein || 150);
      setCarbs(selectedMember.mealPlan?.targets?.carbs || 200);
      setFats(selectedMember.mealPlan?.targets?.fats || 65);
      
      const defaultMeals = [
        { name: 'Breakfast', items: '' },
        { name: 'Lunch', items: '' },
        { name: 'Dinner', items: '' },
        { name: 'Snacks', items: '' }
      ];
      const clientMeals = selectedMember.mealPlan?.meals || [];
      const merged = defaultMeals.map(dm => {
        const match = clientMeals.find(cm => cm.name.toLowerCase() === dm.name.toLowerCase());
        return match ? { ...dm, items: match.items } : dm;
      });
      setMealsState(merged);

      // Default WhatsApp text based on selected template
      const defaultText = `Hey ${selectedMember.name}! Just checking in on your progress this week. How are you feeling after our last training session?`;
      setWaCustomText(defaultText);
      setWaTemplate('checkin');
    }
  }, [selectedMemberEmail]);

  // Open Client plans editor
  const handleSelectClient = (email) => {
    setSelectedMemberEmail(email);
  };

  // Handle template selection change for WhatsApp
  const handleTemplateChange = (e) => {
    const templateType = e.target.value;
    setWaTemplate(templateType);
    if (!selectedMember) return;

    let text = '';
    if (templateType === 'checkin') {
      text = `Hey ${selectedMember.name}! Just checking in on your progress this week. How are you feeling after our last training session?`;
    } else if (templateType === 'missed') {
      text = `Hi ${selectedMember.name}, noticed you missed our scheduled PT session. Let me know when you'd like to reschedule so we keep the momentum going!`;
    } else if (templateType === 'meal') {
      text = `Hi ${selectedMember.name}, just a friendly reminder to stay consistent with your meal plan today. Make sure to hit your protein targets!`;
    } else {
      text = `Hi ${selectedMember.name}, `;
    }
    setWaCustomText(text);
  };

  // Add Exercise to Client plan
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!selectedMemberEmail) return;
    if (!exName) {
      alert('Please enter an exercise name.');
      return;
    }

    const currentPlan = Array.isArray(selectedMember.trainingPlan) ? selectedMember.trainingPlan : [];
    const newEx = {
      name: exName,
      sets: exSets,
      reps: exReps,
      load: exLoad || 'Bodyweight',
      rest: exRest,
      notes: exNotes
    };

    updateTrainingPlan(selectedMemberEmail, [...currentPlan, newEx]);
    
    // Clear inputs
    setExName('');
    setExLoad('');
    setExNotes('');
    alert('Exercise added to workout plan!');
  };

  // Delete Exercise from Client plan
  const handleDeleteExercise = (idx) => {
    if (!selectedMemberEmail) return;
    const currentPlan = Array.isArray(selectedMember.trainingPlan) ? selectedMember.trainingPlan : [];
    const updatedPlan = currentPlan.filter((_, i) => i !== idx);
    updateTrainingPlan(selectedMemberEmail, updatedPlan);
  };

  // Save Nutrition and macros
  const handleSaveNutrition = () => {
    if (!selectedMemberEmail) return;
    updateMealPlan(selectedMemberEmail, {
      targets: {
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats)
      },
      meals: mealsState
    });
    alert('Nutrition targets and meal schedule saved successfully!');
  };

  // Trigger WhatsApp follow up
  const handleSendWhatsApp = () => {
    if (!selectedMember) return;
    const phone = selectedMember.phone || '+60123456789';
    const link = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(waCustomText)}`;
    window.open(link, '_blank');
  };

  // Update specific meal items
  const handleMealItemChange = (idx, text) => {
    setMealsState(prev => prev.map((m, i) => i === idx ? { ...m, items: text } : m));
  };

  // --- TRAINER PROFILE STATE ---
  const [profName, setProfName] = useState(activeTrainer.name);
  const [profSpecs, setProfSpecs] = useState(activeTrainer.specialties.join(', '));
  const [profBio, setProfBio] = useState(activeTrainer.bio);
  const [profPhoto, setProfPhoto] = useState(activeTrainer.photo);
  const [profExp, setProfExp] = useState(activeTrainer.experienceYears || 0);
  const [profCerts, setProfCerts] = useState('');
  const [profAchieve, setProfAchieve] = useState('');
  const [profSuccess, setProfSuccess] = useState('');
  const [profInsta, setProfInsta] = useState('');

  // Sync profile inputs when Simulated Coach changes
  useEffect(() => {
    if (activeTrainer) {
      setProfName(activeTrainer.name || '');
      setProfSpecs(activeTrainer.specialties?.join(', ') || '');
      setProfBio(activeTrainer.bio || '');
      setProfPhoto(activeTrainer.photo || '');
      setProfExp(activeTrainer.experienceYears || 0);
      setProfCerts(activeTrainer.certifications?.join(', ') || '');
      setProfAchieve(activeTrainer.achievements?.join(', ') || '');
      setProfSuccess(activeTrainer.clientSuccessCount || '');
      setProfInsta(activeTrainer.instagram || '');
    }
  }, [activeTrainer.id]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateTrainerProfile(activeTrainer.id, {
      name: profName,
      specialties: profSpecs.split(',').map(s => s.trim()).filter(Boolean),
      bio: profBio,
      photo: profPhoto,
      experienceYears: Number(profExp),
      certifications: profCerts.split(',').map(s => s.trim()).filter(Boolean),
      achievements: profAchieve.split(',').map(s => s.trim()).filter(Boolean),
      clientSuccessCount: profSuccess,
      instagram: profInsta
    });
    alert('Your Trainer profile details were updated and linked live to the home cards!');
  };

  const getWeekdayDateFormatted = (dayName) => {
    const today = new Date();
    const todayIndex = today.getDay();
    const dayIndexMap = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    const targetIndex = dayIndexMap[dayName];
    if (targetIndex === undefined) return '';
    const diff = targetIndex - todayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    const dayNum = String(targetDate.getDate()).padStart(2, '0');
    const month = targetDate.toLocaleDateString('en-US', { month: 'short' });
    return `${dayNum}/${month}`;
  };

  const getTodayDayName = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    return dayNames[todayIndex];
  };
  const todayDayName = getTodayDayName();

  const renderSlotModal = () => {
    if (!selectedSlot) return null;
    const { day, time } = selectedSlot;
    
    const booking = scheduledSessions.find(
      b => b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
    );
    
    const block = trainerBlocks.find(
      b => b.trainerId === activeTrainer.id && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
    );
    
    return (
      <div className="class-modal-overlay" onClick={() => setSelectedSlot(null)}>
        <div className="class-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="class-modal-close" onClick={() => setSelectedSlot(null)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="class-modal-time-badge">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{day} | {time}</span>
          </div>
          
          <h3 className="class-modal-title" style={{ color: 'white', marginBottom: '1.25rem' }}>
            {booking ? `Session with ${booking.memberName}` : block ? `${block.label}` : 'Available Session Slot'}
          </h3>
          
          <div className="class-modal-meta-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="class-modal-meta-item">
              <span className="class-modal-meta-label">Status</span>
              <span className="class-modal-meta-val">
                {booking ? '🟢 Booked' : block ? '🔴 Blocked' : '🔵 Available'}
              </span>
            </div>
            <div className="class-modal-meta-item">
              <span className="class-modal-meta-label">Type</span>
              <span className="class-modal-meta-val">
                {booking ? 'PT Session' : block ? (block.type === 'personal_training' ? 'Comp Training' : 'Unavailable') : 'Coaching Slot'}
              </span>
            </div>
          </div>
          
          {booking && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Client Information</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Name: <strong>{booking.memberName}</strong><br />
                Email: <strong>{booking.memberEmail}</strong>
              </p>
            </div>
          )}
          
          <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedSlot(null)}>
              Close
            </button>
            
            {booking ? (
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ flex: 2 }}
                onClick={() => {
                  cancelPtBooking(booking.id);
                  setSelectedSlot(null);
                }}
              >
                Cancel Session
              </button>
            ) : block ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                onClick={() => {
                  removeTrainerBlock(activeTrainer.id, day, time);
                  setSelectedSlot(null);
                }}
              >
                Unblock Slot
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flex: 2 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    addTrainerBlock(activeTrainer.id, day, time, 'general_block', 'Unavailable');
                    setSelectedSlot(null);
                  }}
                >
                  Block
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', backgroundColor: '#d97706', borderColor: '#d97706' }}
                  onClick={() => {
                    addTrainerBlock(activeTrainer.id, day, time, 'personal_training', 'Comp Prep');
                    setSelectedSlot(null);
                  }}
                >
                  Comp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="section" style={{ minHeight: '75vh' }}>
      <div className="container">
        
        {/* Trainer Header Area */}
        <div className="portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Staff & Coach Portal
            </span>
            <h3>{activeTrainer.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              🏆 {activeTrainer.experienceYears} Years Exp &middot; {activeTrainer.clientSuccessCount || 'Expert Personal Trainer'}
            </p>
          </div>

          {/* Switch coach / log out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                Simulate Coach:
              </label>
              <select 
                className="form-control" 
                value={activeTrainer.id}
                onChange={handleTrainerChange}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundColor: 'var(--bg-card)', border: 'none', minWidth: '180px', height: 'auto' }}
              >
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem', borderRadius: '0.75rem', height: 'fit-content' }}
              onClick={() => { logout(); setActiveSection('home'); }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Schedule & Availability
          </button>
          <button 
            className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('clients')}
          >
            👥 Client Management ({assignedMembers.length})
          </button>
          <button 
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('profile')}
          >
            👤 My PT Profile
          </button>
        </div>

        {/* TAB 1: SCHEDULE & AVAILABILITY */}
        {/* TAB 1: SCHEDULE & AVAILABILITY */}
        {activeTab === 'schedule' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'white', marginBottom: '0.5rem' }}>
                Availability & Timetable Columns
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Review member bookings, block slots for your own competition training, or toggle unavailability.
              </p>
            </div>

            {/* Weekly Calendar Columns */}
            <div className="calendar-container">
              <div className="calendar-grid">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const isToday = day === todayDayName;

                  return (
                    <div key={day} className={`calendar-column ${isToday ? 'is-today' : ''}`}>
                      <div className="calendar-column-header">
                        <span className="calendar-day-name">{day}</span>
                        <span className="calendar-day-label">
                          <strong style={{ color: 'var(--text-primary)' }}>{getWeekdayDateFormatted(day)}</strong>
                          {isToday ? ' • Today' : ' • Gym Slot'}
                        </span>
                      </div>

                      {times.map(time => {
                        // Find booking
                        const booking = scheduledSessions.find(
                          b => b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
                        );

                        // Find block
                        const block = trainerBlocks.find(
                          b => b.trainerId === activeTrainer.id && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
                        );

                        const isEnrolled = !!booking;
                        const isBlocked = !!block;
                        const isComp = block?.type === 'personal_training';

                        return (
                          <div
                            key={time}
                            className={`calendar-class-card ${isEnrolled ? 'booked' : ''}`}
                            onClick={() => setSelectedSlot({ day, time })}
                          >
                            <div className="calendar-card-time">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              <span>{time}</span>
                            </div>

                            <div className="calendar-card-title">
                              {booking ? '👤' : block ? (isComp ? '🏋️' : '🚫') : '🟢'} {booking ? `Booked` : block ? (isComp ? 'Comp Prep' : 'Blocked') : 'Available'}
                            </div>

                            <div className="calendar-card-meta">
                              {booking ? (
                                <>
                                  <span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                      <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {booking.memberName.split(' ').slice(-1)[0]}
                                  </span>
                                  <span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Gym Floor
                                  </span>
                                </>
                              ) : block ? (
                                <span>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                  {block.label}
                                </span>
                              ) : (
                                <span>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  PT Coaching
                                </span>
                              )}
                            </div>

                            <div className="calendar-card-bottom">
                              <div className="calendar-card-spots-col">
                                {booking ? (
                                  <span className="spots-badge booked">Booked</span>
                                ) : block ? (
                                  <span className="spots-badge full">{isComp ? 'Comp' : 'Blocked'}</span>
                                ) : (
                                  <span className="spots-badge ok">Open</span>
                                )}
                              </div>

                              <div className="calendar-card-action-col">
                                {booking ? (
                                  <button
                                    className="calendar-action-btn booked"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelPtBooking(booking.id);
                                    }}
                                    title="Cancel session"
                                  >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                ) : block ? (
                                  <button
                                    className="calendar-action-btn booked"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTrainerBlock(activeTrainer.id, day, time);
                                    }}
                                    title="Unblock slot"
                                  >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    className="calendar-action-btn unbooked"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSlot({ day, time });
                                    }}
                                    title="Block slot"
                                  >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT MANAGEMENT */}
        {activeTab === 'clients' && (
          <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
            
            {/* Left Column: Assigned Clients list */}
            <div>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'white', marginBottom: '1.5rem' }}>
                Assigned Clients ({assignedMembers.length})
              </h3>
              
              {assignedMembers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {assignedMembers.map((member) => (
                    <div 
                      key={member.email}
                      className="card"
                      style={{ 
                        padding: '1.5rem', 
                        cursor: 'pointer', 
                        border: selectedMemberEmail === member.email ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        backgroundColor: selectedMemberEmail === member.email ? 'var(--primary-glow)' : 'var(--bg-card)',
                        transition: 'var(--transition-smooth)'
                      }}
                      onClick={() => handleSelectClient(member.email)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: 'white' }}>{member.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            {member.email}
                          </span>
                        </div>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                          {member.subscription}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Credits: <strong>{member.ptSessionsLeft} Left</strong></span>
                        <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>Manage Programs &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>No members are currently assigned under your personal coaching plan.</p>
                </div>
              )}
            </div>

            {/* Right Column: Plans editor & WhatsApp assistant */}
            <div>
              {selectedMember ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* WORKOUT PLAN BUILDER */}
                  <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        ASCA Training Builder
                      </span>
                      <h3 style={{ color: 'white', marginTop: '0.25rem' }}>{selectedMember.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Set up structured exercises for client execution.</p>
                    </div>

                    {/* Exercise Table list */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '1rem' }}>Active Workout Program</h4>
                      {Array.isArray(selectedMember.trainingPlan) && selectedMember.trainingPlan.length > 0 ? (
                        <div className="list-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table className="list-table" style={{ fontSize: '0.85rem' }}>
                            <thead>
                              <tr>
                                <th>Exercise</th>
                                <th>Sets & Reps</th>
                                <th>Load</th>
                                <th>Rest</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedMember.trainingPlan.map((ex, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <strong>{ex.name}</strong>
                                    {ex.notes && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Note: {ex.notes}</span>}
                                  </td>
                                  <td>{ex.sets}x{ex.reps}</td>
                                  <td>{ex.load}</td>
                                  <td>{ex.rest}</td>
                                  <td>
                                    <button 
                                      className="btn btn-danger" 
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                      onClick={() => handleDeleteExercise(idx)}
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          No exercises added yet. Use the builder form below.
                        </div>
                      )}
                    </div>

                    {/* Add Exercise Form */}
                    <form onSubmit={handleAddExercise} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '1rem' }}>➕ Add Exercise to Plan</h4>
                      <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Exercise Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Barbell Bench Press" 
                            value={exName}
                            onChange={(e) => setExName(e.target.value)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Load / Weight</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. 80 kg or Bodyweight" 
                            value={exLoad}
                            onChange={(e) => setExLoad(e.target.value)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Sets</label>
                          <select 
                            className="form-control" 
                            value={exSets} 
                            onChange={(e) => setExSets(e.target.value)}
                            style={{ padding: '0.4rem', fontSize: '0.85rem', height: 'auto' }}
                          >
                            {['1','2','3','4','5','6'].map(num => <option key={num} value={num}>{num}</option>)}
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Reps</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={exReps}
                            onChange={(e) => setExReps(e.target.value)}
                            placeholder="e.g. 10 or 8-12"
                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Rest Period</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={exRest} 
                            onChange={(e) => setExRest(e.target.value)}
                            placeholder="e.g. 90s"
                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem' }}>Coaching / Form Notes</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Keep chest high, slow negative phase" 
                          value={exNotes}
                          onChange={(e) => setExNotes(e.target.value)}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                        ＋ Add Exercise to Table
                      </button>
                    </form>
                  </div>

                  {/* NUTRITION & DIET BUILDER */}
                  <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        TrueCoach Diet & Macros
                      </span>
                      <h3 style={{ color: 'white', marginTop: '0.25rem' }}>Dietary targets</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage daily macronutrient splits and meal blocks.</p>
                    </div>

                    {/* Macro Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem' }}>Calories (kcal)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={calories} 
                          onChange={(e) => setCalories(e.target.value)}
                          style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem' }}>Protein (g)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={protein} 
                          onChange={(e) => setProtein(e.target.value)}
                          style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem' }}>Carbs (g)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={carbs} 
                          onChange={(e) => setCarbs(e.target.value)}
                          style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem' }}>Fats (g)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={fats} 
                          onChange={(e) => setFats(e.target.value)}
                          style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    {/* Meal Schedule Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '0.5rem' }}>Meals Breakdown</h4>
                      {mealsState.map((meal, idx) => (
                        <div key={idx} className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white' }}>🍳 {meal.name}</label>
                          <textarea 
                            className="form-control" 
                            rows="2" 
                            value={meal.items} 
                            placeholder={`Define foods/ingredients for ${meal.name}...`}
                            onChange={(e) => handleMealItemChange(idx, e.target.value)}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                          />
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-primary" onClick={handleSaveNutrition} style={{ width: '100%', padding: '0.5rem', fontWeight: '700' }}>
                      💾 Save Nutrition Program
                    </button>
                  </div>

                  {/* AUTO WHATSAPP PORTAL */}
                  <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1rem' }}>
                      💬 Auto WhatsApp Follow-up Tool
                    </h4>
                    
                    <div className="form-group">
                      <label>Select Message Template</label>
                      <select 
                        className="form-control"
                        value={waTemplate}
                        onChange={handleTemplateChange}
                        style={{ height: 'auto', padding: '0.5rem' }}
                      >
                        <option value="checkin">Weekly Check-in</option>
                        <option value="missed">Missed Session Reminder</option>
                        <option value="meal">Meal Plan Reminder</option>
                        <option value="custom">Custom Draft</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Follow-up Message Text</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={waCustomText}
                        onChange={(e) => setWaCustomText(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <button 
                      className="btn btn-secondary" 
                      onClick={handleSendWhatsApp}
                      style={{ width: '100%', border: '1px solid var(--primary-color)', color: 'white', fontWeight: '600' }}
                    >
                      🚀 Open WhatsApp Chat & Send
                    </button>
                  </div>

                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  💡 <p style={{ marginTop: '0.5rem' }}>Select a client from the left column to view plans, update routines, and send WhatsApp updates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', marginBottom: '0.5rem' }}>
                My Personal Trainer Profile
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Edit your display name, specialties, and bio. Changes update live in the trainers database and are displayed on the public landing page.
              </p>

              <form onSubmit={handleSaveProfile}>
                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Years of Experience</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={profExp}
                      onChange={(e) => setProfExp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Specialties (comma-separated)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profSpecs}
                      onChange={(e) => setProfSpecs(e.target.value)}
                      placeholder="e.g. Body Transformation, Strength Conditioning"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Client success badge text</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profSuccess}
                      onChange={(e) => setProfSuccess(e.target.value)}
                      placeholder="e.g. 150+ transformations"
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Profile Image Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profPhoto}
                      onChange={(e) => setProfPhoto(e.target.value)}
                      placeholder="e.g. coach_alex.png"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Instagram Username</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profInsta}
                      onChange={(e) => setProfInsta(e.target.value)}
                      placeholder="e.g. coach_insta"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Certifications (comma-separated)</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    value={profCerts}
                    onChange={(e) => setProfCerts(e.target.value)}
                    placeholder="e.g. NASM-CPT, Precision Nutrition L1, CPR/AED Certified"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Competition Achievements (comma-separated)</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    value={profAchieve}
                    onChange={(e) => setProfAchieve(e.target.value)}
                    placeholder="e.g. Regional Sparring Champion 2018, Powerlifting Gold 2023"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bio Summary</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontWeight: '700' }}>
                  💾 Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Trainer slot details modal */}
        {renderSlotModal()}
      </div>
    </div>
  );
}
