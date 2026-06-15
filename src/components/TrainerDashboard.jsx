import React, { useState, useContext, useEffect } from 'react';
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
    updateMealPlan,
    updateTrainerProfile,
    addClientProgressPhotos,
    deleteClientProgressPhotos,
    parseTimeToMinutes,
    parseTimeRange,
    addOneHour,
    isTimeRangeOverlapping,
    matchesDay,
    timetable
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

  // PT BOOKINGS
  const scheduledSessions = ptBookings.filter(b => b.trainerId === activeTrainer.id);

  // --- CALENDAR AVAILABILITY STATE ---
  const [calDay, setCalDay] = useState(() => {
    const daysList = get14Days();
    return daysList.length > 0 ? daysList[0].dateKey : '';
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [creationSlot, setCreationSlot] = useState(null);
  const [blockTitle, setBlockTitle] = useState('Unavailable');
  const [blockStartTime, setBlockStartTime] = useState('10:00 AM');
  const [blockEndTime, setBlockEndTime] = useState('11:00 AM');
  const [blockDescription, setBlockDescription] = useState('');
  const [blockType, setBlockType] = useState('general_block');

  useEffect(() => {
    if (creationSlot) {
      setBlockStartTime(creationSlot.time);
      setBlockEndTime(addOneHour(creationSlot.time));
      setBlockTitle('Unavailable');
      setBlockDescription('');
      setBlockType('general_block');
    }
  }, [creationSlot]);

  const times = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // --- CLIENT SEARCH & FILTER STATE ---
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientFilterSubscription, setClientFilterSubscription] = useState('all');
  const [clientFilterCredits, setClientFilterCredits] = useState('all');

  // --- PROGRESS PHOTO STATE ---
  const [beforePreview, setBeforePreview] = useState('');
  const [afterPreview, setAfterPreview] = useState('');
  const [photoDate, setPhotoDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [photoNotes, setPhotoNotes] = useState('');

  // MEMBERS ASSIGNED
  const assignedMembers = members.filter(m => 
    m.trainer && m.trainer.toLowerCase().includes(activeTrainer.name.toLowerCase())
  );

  const filteredClients = assignedMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(clientSearchQuery.toLowerCase());
    const matchesSub = clientFilterSubscription === 'all' || 
                       (member.subscription && member.subscription.toLowerCase().includes(clientFilterSubscription.toLowerCase()));
    
    let matchesCredits = true;
    if (clientFilterCredits === 'has_credits') {
      matchesCredits = member.ptSessionsLeft > 0;
    } else if (clientFilterCredits === 'no_credits') {
      matchesCredits = member.ptSessionsLeft === 0;
    }
    
    return matchesSearch && matchesSub && matchesCredits;
  });

  // Image compressor utility to stay under localStorage limits
  const compressImage = (base64Str, callback) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 300;
      const MAX_HEIGHT = 300;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.6);
      callback(compressed);
    };
  };

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

  const getCalendarEventsForDay = (dateKey) => {
    const list = [];

    // 1. Classes coached by active trainer
    const dayClasses = timetable.filter(
      c => c.trainer.toLowerCase() === activeTrainer.name.toLowerCase() && matchesDay(c.day, dateKey)
    );
    dayClasses.forEach(c => {
      const { start, end } = parseTimeRange(c.time);
      list.push({
        type: 'class',
        id: c.id,
        title: c.name,
        subtitle: `Coaching | ${c.room}`,
        emoji: '💪',
        startTime: c.time.split('-')[0].trim(),
        endTime: c.time.split('-')[1].trim(),
        startMin: start,
        endMin: end,
        eventObj: c
      });
    });

    // 2. PT sessions scheduled with active trainer
    const daySessions = scheduledSessions.filter(
      b => matchesDay(b.day, dateKey)
    );
    daySessions.forEach(b => {
      const { start, end } = parseTimeRange(b.time); // defaults to 1 hour
      list.push({
        type: 'booking',
        id: b.id,
        title: `Session: ${b.memberName}`,
        subtitle: '1-on-1 PT Coaching',
        emoji: '👤',
        startTime: b.time,
        endTime: addOneHour(b.time),
        startMin: start,
        endMin: end,
        eventObj: b
      });
    });

    // 3. Trainer availability blocks
    const dayBlocks = trainerBlocks.filter(
      b => b.trainerId === activeTrainer.id && matchesDay(b.day, dateKey)
    );
    dayBlocks.forEach(b => {
      const startStr = b.startTime || b.time;
      const endStr = b.endTime || addOneHour(startStr);
      const startMins = parseTimeToMinutes(startStr);
      const endMins = parseTimeToMinutes(endStr);
      const isComp = b.type === 'personal_training';
      list.push({
        type: 'block',
        id: b.id || `block_${b.day}_${startStr}`,
        title: b.label || (isComp ? 'Comp Prep' : 'Blocked'),
        subtitle: b.description || (isComp ? 'Competition prep training' : 'Unavailable'),
        emoji: isComp ? '🏋️' : '🚫',
        startTime: startStr,
        endTime: endStr,
        startMin: startMins,
        endMin: endMins,
        eventObj: b
      });
    });

    // Sort chronologically by startMin
    return list.sort((a, b) => a.startMin - b.startMin);
  };

  const renderSlotModal = () => {
    if (!selectedSlot) return null;
    const { type, event } = selectedSlot;
    
    // Render based on event type
    if (type === 'class') {
      const enrolledNames = event.enrolled && event.enrolled.length > 0 
        ? event.enrolled.map(email => {
            const mem = members.find(m => m.email.toLowerCase() === email.toLowerCase());
            return mem ? mem.name : email;
          }).join(', ')
        : 'No members booked yet';

      return (
        <div className="class-modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="class-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="class-modal-close" onClick={() => setSelectedSlot(null)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="class-modal-time-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: 'none' }}>
              <span>💪 Gym Class</span>
            </div>
            
            <h3 className="class-modal-title" style={{ color: 'white', marginBottom: '1.25rem' }}>
              {event.name}
            </h3>
            
            <div className="class-modal-meta-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="class-modal-meta-item">
                <span className="class-modal-meta-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Day & Time</span>
                <span className="class-modal-meta-val" style={{ color: 'white', fontWeight: '600' }}>
                  {event.day} | {event.time}
                </span>
              </div>
              <div className="class-modal-meta-item">
                <span className="class-modal-meta-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Location</span>
                <span className="class-modal-meta-val" style={{ color: 'white', fontWeight: '600' }}>
                  📍 {event.room}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Enrolled Members ({event.enrolled?.length || 0} / {event.capacity})</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {enrolledNames}
              </p>
            </div>
            
            <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedSlot(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (type === 'booking') {
      return (
        <div className="class-modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="class-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="class-modal-close" onClick={() => setSelectedSlot(null)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="class-modal-time-badge" style={{ backgroundColor: 'rgba(20, 184, 166, 0.15)', color: '#99f6e4', border: 'none' }}>
              <span>👤 1-on-1 PT Session</span>
            </div>
            
            <h3 className="class-modal-title" style={{ color: 'white', marginBottom: '1.25rem' }}>
              Session with {event.memberName}
            </h3>
            
            <div className="class-modal-meta-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="class-modal-meta-item">
                <span className="class-modal-meta-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date & Time</span>
                <span className="class-modal-meta-val" style={{ color: 'white', fontWeight: '600' }}>
                  {getFormattedDateFromKey(event.day) || event.day} | {event.time}
                </span>
              </div>
              <div className="class-modal-meta-item">
                <span className="class-modal-meta-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Client Email</span>
                <span className="class-modal-meta-val" style={{ color: 'white', fontWeight: '600' }}>
                  {event.memberEmail}
                </span>
              </div>
            </div>
            
            <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedSlot(null)}>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ flex: 2 }}
                onClick={() => {
                  cancelPtBooking(event.id);
                  setSelectedSlot(null);
                }}
              >
                Cancel PT Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (type === 'block') {
      const isComp = event.type === 'personal_training';
      return (
        <div className="class-modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="class-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="class-modal-close" onClick={() => setSelectedSlot(null)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="class-modal-time-badge" style={{ backgroundColor: isComp ? 'rgba(217, 119, 6, 0.15)' : 'rgba(255, 255, 255, 0.08)', color: isComp ? '#f59e0b' : '#d1d5db', border: 'none' }}>
              <span>{isComp ? '🏋️ Comp Prep Block' : '🚫 Unavailable Block'}</span>
            </div>
            
            <h3 className="class-modal-title" style={{ color: 'white', marginBottom: '1.25rem' }}>
              {event.label}
            </h3>
            
            <div className="class-modal-meta-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="class-modal-meta-item">
                <span className="class-modal-meta-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date</span>
                <span className="class-modal-meta-val" style={{ color: 'white', fontWeight: '600' }}>
                  {getFormattedDateFromKey(event.day) || event.day}
                </span>
              </div>
              <div className="class-modal-meta-item">
                <span className="class-modal-meta-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Time Range</span>
                <span className="class-modal-meta-val" style={{ color: 'white', fontWeight: '600' }}>
                  {event.startTime || event.time} - {event.endTime || addOneHour(event.startTime || event.time)}
                </span>
              </div>
            </div>

            {event.description && (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description / Notes</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </p>
              </div>
            )}
            
            <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedSlot(null)}>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ flex: 2 }}
                onClick={() => {
                  removeTrainerBlock(event.trainerId, event.day, event.startTime || event.time);
                  setSelectedSlot(null);
                }}
              >
                Unblock / Delete Block
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderCreateBlockModal = () => {
    if (!creationSlot) return null;
    const { day, time } = creationSlot;
    
    const handleSubmit = (e) => {
      e.preventDefault();
      const success = addTrainerBlock(
        activeTrainer.id,
        day,
        blockStartTime,
        blockEndTime,
        blockType,
        blockTitle,
        blockDescription
      );
      if (success) {
        setCreationSlot(null);
      }
    };
    
    return (
      <div className="class-modal-overlay" onClick={() => setCreationSlot(null)}>
        <div className="class-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
          <button className="class-modal-close" onClick={() => setCreationSlot(null)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 style={{ color: 'white', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
            📅 Create Block / Event
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Event Title</label>
              <input 
                type="text" 
                className="form-control" 
                value={blockTitle} 
                onChange={(e) => setBlockTitle(e.target.value)} 
                required 
                placeholder="e.g. Personal Workout, Lunch Break"
                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}
              />
            </div>
            
            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Start Time</label>
                <select 
                  className="form-control"
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}
                >
                  {Array.from({ length: 29 }).map((_, idx) => {
                    const totalMins = 480 + idx * 30;
                    const hours = Math.floor(totalMins / 60);
                    const minutes = totalMins % 60;
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
                    const displayMins = String(minutes).padStart(2, '0');
                    const tStr = `${String(displayHours).padStart(2, '0')}:${displayMins} ${ampm}`;
                    return <option key={idx} value={tStr}>{tStr}</option>;
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>End Time</label>
                <select 
                  className="form-control"
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}
                >
                  {Array.from({ length: 29 }).map((_, idx) => {
                    const totalMins = 510 + idx * 30;
                    const hours = Math.floor(totalMins / 60);
                    const minutes = totalMins % 60;
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
                    const displayMins = String(minutes).padStart(2, '0');
                    const tStr = `${String(displayHours).padStart(2, '0')}:${displayMins} ${ampm}`;
                    return <option key={idx} value={tStr}>{tStr}</option>;
                  })}
                </select>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Block Type</label>
              <select 
                className="form-control" 
                value={blockType} 
                onChange={(e) => setBlockType(e.target.value)}
                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}
              >
                <option value="general_block">🚫 Unavailable (General Block)</option>
                <option value="personal_training">🏋️ Competition Prep / Coaching Focus</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Description / Notes (Optional)</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={blockDescription}
                onChange={(e) => setBlockDescription(e.target.value)}
                placeholder="Add details about this block..."
                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCreationSlot(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                Save Block
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderMobileSchedule = () => {
    const mobileDates = get14Days();
    const activeDayItem = mobileDates.find(d => d.dateKey === calDay) || mobileDates[0];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeDateTitle = activeDayItem 
      ? `${activeDayItem.dayName} ${activeDayItem.dateNum} ${months[activeDayItem.fullDateObj.getMonth()]} ${activeDayItem.fullDateObj.getFullYear()}` 
      : '';

    const dayEvents = getCalendarEventsForDay(calDay);

    return (
      <div className="mobile-classes-wrapper" style={{ padding: 0 }}>
        {/* Date Selector Bar */}
        <div className="mobile-date-bar" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {mobileDates.map((item) => {
            const isActive = calDay === item.dateKey;
            return (
              <button 
                key={item.dateKey}
                className={`mobile-date-card ${isActive ? 'active' : ''}`}
                onClick={() => setCalDay(item.dateKey)}
                style={{ flexShrink: 0 }}
              >
                <span className="mobile-date-card-day">{item.shortName}</span>
                <span className="mobile-date-card-num">{item.dateNum}</span>
                {isActive && <div className="mobile-date-card-dot" />}
              </button>
            );
          })}
        </div>

        {/* Selected Day Title & Quick Block Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="mobile-day-title" style={{ color: 'white', fontWeight: '700', fontSize: '1.05rem' }}>
            {activeDateTitle}
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            onClick={() => setCreationSlot({ day: calDay, time: '10:00 AM' })}
          >
            ➕ Block Time
          </button>
        </div>

        {/* Agenda Events List */}
        <div className="mobile-classes-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dayEvents.length > 0 ? (
            dayEvents.map(event => {
              const isClass = event.type === 'class';
              const isBooking = event.type === 'booking';
              const isBlock = event.type === 'block';
              
              let accentColor = '#6366f1'; // Class indigo
              if (isBooking) accentColor = '#14b8a6'; // Booking teal
              else if (isBlock && event.eventObj.type === 'personal_training') accentColor = '#f59e0b'; // Comp orange
              else if (isBlock) accentColor = '#9ca3af'; // Block gray
              
              return (
                <div 
                  key={event.id}
                  className="mobile-class-row"
                  onClick={() => setSelectedSlot({ type: event.type, event: event.eventObj })}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem', 
                    backgroundColor: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', 
                    borderLeft: `4px solid ${accentColor}`,
                    cursor: 'pointer' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{event.emoji}</span>
                      <strong style={{ color: 'white', fontSize: '0.95rem' }}>{event.title}</strong>
                    </div>
                    
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: accentColor, textTransform: 'uppercase' }}>
                      {event.type}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {event.subtitle}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {event.startTime} - {event.endTime}
                    </span>
                    
                    <span style={{ color: accentColor, fontWeight: '700' }}>
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🌴</span>
              <p style={{ fontSize: '0.85rem' }}>No classes, PT sessions, or blocks scheduled for this day.</p>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '1rem' }}
                onClick={() => setCreationSlot({ day: calDay, time: '10:00 AM' })}
              >
                Create Block
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDesktopSchedule = () => {
    const daysList = get14Days();
    
    return (
      <div className="teams-calendar-wrapper" style={{ display: 'flex', overflowX: 'auto', backgroundColor: '#16161c', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1rem', position: 'relative' }}>
        {/* Left Sticky Time Axis */}
        <div style={{ width: '75px', flexShrink: 0, paddingTop: '60px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#16161c', position: 'sticky', left: 0, zIndex: 20 }}>
          {Array.from({ length: 14 }).map((_, idx) => {
            const hour = 8 + idx;
            const displayHour = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
            return (
              <div key={idx} style={{ height: '60px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textAlign: 'right', paddingRight: '0.75rem', paddingTop: '4px', boxSizing: 'border-box' }}>
                {displayHour}
              </div>
            );
          })}
        </div>
        
        {/* Scrollable Column Grid */}
        <div style={{ display: 'flex', flex: 1, minWidth: '2800px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {daysList.map(dayItem => {
            const isToday = dayItem.isToday;
            const events = getCalendarEventsForDay(dayItem.dateKey);

            return (
              <div key={dayItem.dateKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                {/* Column Header */}
                <div style={{ height: '60px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: isToday ? 'rgba(239, 68, 68, 0.05)' : 'transparent', borderTop: isToday ? '3px solid var(--primary-color)' : 'none', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isToday ? 'var(--primary-color)' : 'white', textTransform: 'uppercase' }}>
                    {dayItem.shortName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: isToday ? 'white' : 'var(--text-secondary)', fontWeight: isToday ? '700' : '400', marginTop: '0.1rem' }}>
                    {dayItem.dateLabel}
                  </span>
                </div>
                
                {/* Column Body with absolute positions */}
                <div style={{ position: 'relative', height: '840px', backgroundColor: isToday ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  {/* Background Hourly Clickable Grid lines */}
                  {Array.from({ length: 14 }).map((_, hourIdx) => {
                    const hour = 8 + hourIdx;
                    const displayHour = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
                    return (
                      <div
                        key={hourIdx}
                        className="teams-hour-cell"
                        style={{
                          height: '60px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          boxSizing: 'border-box',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        onClick={() => setCreationSlot({ day: dayItem.dateKey, time: displayHour })}
                        title={`Click to block time at ${displayHour}`}
                      >
                        {/* 30-min dashed line */}
                        <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, borderBottom: '1px dashed rgba(255, 255, 255, 0.02)' }} />
                      </div>
                    );
                  })}
                  
                  {/* Event Cards */}
                  {events.map(event => {
                    const startMin = Math.max(480, Math.min(1320, event.startMin));
                    const endMin = Math.max(480, Math.min(1320, event.endMin));
                    const top = startMin - 480;
                    const height = Math.max(30, endMin - startMin);
                    
                    let cardClass = 'teams-event-card';
                    if (event.type === 'class') cardClass += ' class-card';
                    else if (event.type === 'booking') cardClass += ' booking-card';
                    else {
                      cardClass += ' block-card';
                      if (event.eventObj?.type === 'personal_training') {
                        cardClass += ' comp-card';
                      }
                    }

                    return (
                      <div
                        key={event.id}
                        className={cardClass}
                        style={{
                          position: 'absolute',
                          left: '4px',
                          right: '4px',
                          top: `${top}px`,
                          height: `${height}px`,
                          zIndex: 10,
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlot({ type: event.type, event: event.eventObj });
                        }}
                      >
                        <div className="card-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: height >= 50 ? 'space-between' : 'center', padding: '0.4rem 0.6rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span style={{ fontSize: '0.85rem' }}>{event.emoji}</span>
                              <strong style={{ fontSize: '0.8rem', color: 'white' }}>{event.title}</strong>
                            </div>
                            
                            {height >= 60 && (
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {event.subtitle}
                              </div>
                            )}
                          </div>
                          
                          {height >= 45 && (
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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

            {isMobile ? renderMobileSchedule() : renderDesktopSchedule()}
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
              
              {/* Search and Filters */}
              <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Search Clients</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search by name or email..." 
                      value={clientSearchQuery} 
                      onChange={(e) => setClientSearchQuery(e.target.value)} 
                      style={{ padding: '0.4rem 0.8rem 0.4rem 2rem', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.9rem' }}>🔍</span>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Subscription</label>
                    <select 
                      className="form-control" 
                      value={clientFilterSubscription} 
                      onChange={(e) => setClientFilterSubscription(e.target.value)}
                      style={{ padding: '0.3rem', fontSize: '0.8rem', height: 'auto' }}
                    >
                      <option value="all">All Packages</option>
                      <option value="VIP">VIP Elite</option>
                      <option value="Premium">Premium</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Credits</label>
                    <select 
                      className="form-control" 
                      value={clientFilterCredits} 
                      onChange={(e) => setClientFilterCredits(e.target.value)}
                      style={{ padding: '0.3rem', fontSize: '0.8rem', height: 'auto' }}
                    >
                      <option value="all">All Credits</option>
                      <option value="has_credits">Has Credits (&gt;0)</option>
                      <option value="no_credits">No Credits (0)</option>
                    </select>
                  </div>
                </div>
              </div>

              {assignedMembers.length > 0 ? (
                filteredClients.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredClients.map((member) => (
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
                  <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>No clients match your filter criteria.</p>
                  </div>
                )
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

                  {/* CLIENT BEFORE/AFTER PROGRESS PHOTOS */}
                  <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        Transformations Gallery
                      </span>
                      <h3 style={{ color: 'white', marginTop: '0.25rem' }}>Before & After Photos</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track client progress visually over time.</p>
                    </div>

                    {/* Gallery list */}
                    {selectedMember.progressPhotos && selectedMember.progressPhotos.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                        {selectedMember.progressPhotos.map((set) => (
                          <div key={set.id} style={{ border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.25rem', backgroundColor: 'var(--bg-dark)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                              <strong style={{ color: 'white', fontSize: '0.95rem' }}>📅 Date: {getFormattedDateFromKey(set.date) || set.date}</strong>
                              <button 
                                type="button"
                                className="btn btn-danger" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                onClick={() => deleteClientProgressPhotos(selectedMember.email, set.id)}
                              >
                                Delete Set 🗑️
                              </button>
                            </div>
                            
                            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                              {/* Before photo */}
                              <div style={{ textAlign: 'center', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 'bold', zIndex: 5 }}>
                                  BEFORE
                                </span>
                                <img 
                                  src={set.before} 
                                  alt="Before Progress" 
                                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} 
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
                                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} 
                                />
                              </div>
                            </div>
                            
                            {set.notes && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                💬 Notes: {set.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                        No transformation photos uploaded for this client yet.
                      </div>
                    )}

                    {/* Upload progress set form */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '1.25rem' }}>➕ Add New Progress Set</h4>
                      
                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        {/* Before Upload */}
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.25rem' }}>Before Image</label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  compressImage(reader.result, (compressed) => setBeforePreview(compressed));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Or paste image URL:</span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="https://..." 
                            value={beforePreview.startsWith('data:') ? '' : beforePreview}
                            onChange={(e) => setBeforePreview(e.target.value)}
                            style={{ padding: '0.3rem', fontSize: '0.8rem' }}
                          />
                          {beforePreview && (
                            <div style={{ marginTop: '0.5rem', position: 'relative' }}>
                              <img src={beforePreview} alt="Before Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                              <button 
                                type="button" 
                                style={{ position: 'absolute', top: 0, left: '80px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'red', borderRadius: '50%', cursor: 'pointer', padding: '0.15rem 0.3rem', fontSize: '0.7rem' }}
                                onClick={() => setBeforePreview('')}
                              >
                                X
                              </button>
                            </div>
                          )}
                        </div>

                        {/* After Upload */}
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.25rem' }}>After Image</label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  compressImage(reader.result, (compressed) => setAfterPreview(compressed));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Or paste image URL:</span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="https://..." 
                            value={afterPreview.startsWith('data:') ? '' : afterPreview}
                            onChange={(e) => setAfterPreview(e.target.value)}
                            style={{ padding: '0.3rem', fontSize: '0.8rem' }}
                          />
                          {afterPreview && (
                            <div style={{ marginTop: '0.5rem', position: 'relative' }}>
                              <img src={afterPreview} alt="After Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                              <button 
                                type="button" 
                                style={{ position: 'absolute', top: 0, left: '80px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'red', borderRadius: '50%', cursor: 'pointer', padding: '0.15rem 0.3rem', fontSize: '0.7rem' }}
                                onClick={() => setAfterPreview('')}
                              >
                                X
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Progress Date</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            value={photoDate} 
                            onChange={(e) => setPhotoDate(e.target.value)} 
                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Notes / Progress Label</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Week 4 Checkin" 
                            value={photoNotes} 
                            onChange={(e) => setPhotoNotes(e.target.value)} 
                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (!beforePreview || !afterPreview) {
                            alert('Please select or paste images for both Before and After states.');
                            return;
                          }
                          addClientProgressPhotos(selectedMember.email, photoDate, beforePreview, afterPreview, photoNotes);
                          setBeforePreview('');
                          setAfterPreview('');
                          setPhotoNotes('');
                          alert('Progress photo set added successfully!');
                        }}
                        style={{ width: '100%', padding: '0.5rem', fontWeight: '700', marginBottom: '2rem' }}
                      >
                        💾 Save Transformation Set
                      </button>
                    </div>
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
        {renderCreateBlockModal()}
      </div>
    </div>
  );
}
