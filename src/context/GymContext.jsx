import React, { createContext, useState, useEffect } from 'react';

// Create Gym Context
export const GymContext = createContext();

// Theme options that can be applied to CSS variables
export const THEMES = {
  red: {
    name: 'The Base Red',
    primary: '#dc2626', // Vibrant crimson red
    primaryGlow: 'rgba(220, 38, 38, 0.15)',
    primaryDark: '#b91c1c',
  },
  lime: {
    name: 'Neon Lime',
    primary: '#a3e635', // Tailwind lime-400
    primaryGlow: 'rgba(163, 230, 53, 0.15)',
    primaryDark: '#84cc16',
  },
  orange: {
    name: 'Volcano Orange',
    primary: '#f97316', // Tailwind orange-500
    primaryGlow: 'rgba(249, 115, 22, 0.15)',
    primaryDark: '#ea580c',
  },
  pink: {
    name: 'Cyber Pink',
    primary: '#ec4899', // Tailwind pink-500
    primaryGlow: 'rgba(236, 72, 153, 0.15)',
    primaryDark: '#db2777',
  },
  cyan: {
    name: 'Electric Cyan',
    primary: '#06b6d4', // Tailwind cyan-500
    primaryGlow: 'rgba(6, 182, 212, 0.15)',
    primaryDark: '#0891b2',
  }
};

// Initial Seed Data
// Initial Seed Data
const DEFAULT_GYM_SETTINGS = {
  name: 'The Base Fitness Kluang Johor',
  address: 'Jalan Bakawali, 81440 Kluang, Johor, Malaysia',
  phone: '+60 17-709 9629',
  email: 'info@thebasefitness.com',
  operatingHours: 'Daily: 8:00 AM - 10:00 PM',
  theme: 'red',
  currency: 'RM',
  description: 'Welcome to The Base Fitness Kluang. Rebuild your health, prepare for the competition stage under certified coaches, track your progress, and unleash your peak potential with our brand new machines, competition-prep trainers, and Anovator body composition analyze.'
};

const DEFAULT_TRAINERS = [
  {
    id: 't1',
    name: 'Coach Alex Tan',
    specialties: ['Competition Coaching', 'Body Transformation', 'Functional Fitness', 'Cardio Boxing'],
    bio: 'Certified personal trainer and contest prep coach with over 10 years of coaching experience. Specializes in building stage-ready physiques, weight management, and high-intensity body transformations.',
    photo: 'coach_alex.png',
    experienceYears: 12,
    certifications: ['NASM Certified Personal Trainer (CPT)', 'NASM Performance Enhancement Specialist', 'First Aid & CPR Certified'],
    achievements: ['Certified Personal Trainer (NASM)', 'Coached 150+ transformations in Kluang area', 'Trainer for 20+ stage competition athletes'],
    clientSuccessCount: '150+ Transformations',
    instagram: 'alextan_fitness'
  },
  {
    id: 't2',
    name: 'Coach Marcus Lim',
    specialties: ['Powerlifting & Bodybuilding Prep', 'Strength Training', 'Competition Coaching'],
    bio: 'Certified strength conditioning specialist and active competitive powerlifter. Passionate about posture correction, competitive compound lifting, and helping athletes prep for Johor powerlifting meets.',
    photo: 'personal_training.png',
    experienceYears: 8,
    certifications: ['ASCA Strength & Conditioning Coach L1', 'Certified Powerlifting Coach (USPA)', 'Functional Movement Screen (FMS) Certified'],
    achievements: ['Johor Powerlifting Open 2023 Gold Medalist (93kg)', 'Coached 15+ powerlifters to national podium finishes'],
    clientSuccessCount: '200+ Transformations',
    instagram: 'marcus_strength'
  },
  {
    id: 't3',
    name: 'Coach Sarah Wong',
    specialties: ['Bikini & Physique Prep', 'Weight Loss & HIIT', 'Yoga & Flexibility', 'Nutrition Coaching'],
    bio: 'Dedicated fitness therapist and nutrition prep specialist. Focuses on bikini competition styling, metabolic staging prep, and sustainable fat loss coaching for athletes.',
    photo: 'hero.png',
    experienceYears: 6,
    certifications: ['Precision Nutrition Level 1 (PN1) Certified', 'Certified Weight Loss Specialist (NASM)', 'RYT-200 Yoga Teacher'],
    achievements: ['Co-author of "Athlete Prep Nutrition Guide"', 'Fitness Speaker at Johor Wellness Summit 2024', 'Prep coach for 10+ Bikini category medalists'],
    clientSuccessCount: '300+ Nutritional Programs',
    instagram: 'sarahwong_nutrition'
  }
];

const DEFAULT_PACKAGES = [
  {
    id: 'p1',
    name: 'Day Pass Access',
    price: 15,
    billingPeriod: 'per entry',
    features: ['Full gym access for 1 calendar day', 'Free locker and shower usage', 'Access to weights and cardio zones'],
    isPopular: false,
    badge: 'Single Entry'
  },
  {
    id: 'p2',
    name: 'All-Access Monthly Membership',
    price: 120,
    billingPeriod: 'per month',
    features: ['Unlimited entry to weights & cardio zones', 'Free locker, towel, and sauna access', '1 free personal trainer assessment session', '10% discount on in-gym supplements'],
    isPopular: true,
    badge: 'Most Popular'
  },
  {
    id: 'p3',
    name: 'Premium Strength & Competition Pass',
    price: 180,
    billingPeriod: 'per month',
    features: ['Unlimited general gym floor access', 'Access to brand new fitness machines & posing area', 'Free Anovator body composition analyze', 'Priority booking for all group classes & posing workshops'],
    isPopular: false,
    badge: 'Fitness Pass'
  },
  {
    id: 'p4',
    name: 'VIP Personal Coaching & Athlete Prep',
    price: 450,
    billingPeriod: 'per month',
    features: ['All-Access gym membership included', '8 sessions (1-on-1) with a certified Competition Prep Coach', 'Customized weekly contest prep, posing drills & nutrition plans', 'Exclusive WhatsApp support with your coach'],
    isPopular: false,
    badge: 'Premium Coaching'
  }
];

const DEFAULT_CLASSES = [
  // Monday
  { id: 'c1', name: 'Functional Machine Training', day: 'Monday', time: '08:00 AM - 09:30 AM', trainer: 'Coach Alex Tan', room: 'Gym Floor', capacity: 15, enrolled: ['member@gmail.com'] },
  { id: 'c2', name: 'HIIT Circuit', day: 'Monday', time: '06:30 PM - 07:30 PM', trainer: 'Coach Sarah Wong', room: 'Studio B', capacity: 20, enrolled: [] },
  { id: 'c3', name: 'Powerlifting & Competition Prep', day: 'Monday', time: '08:00 PM - 09:30 PM', trainer: 'Coach Marcus Lim', room: 'Gym Floor', capacity: 8, enrolled: [] },
  
  // Tuesday
  { id: 'c4', name: 'Athlete Body Recomp Clinic', day: 'Tuesday', time: '06:00 PM - 07:30 PM', trainer: 'Coach Alex Tan', room: 'Gym Floor', capacity: 12, enrolled: [] },
  { id: 'c5', name: 'Vinyasa Flow Yoga', day: 'Tuesday', time: '08:00 PM - 09:00 PM', trainer: 'Coach Sarah Wong', room: 'Studio B', capacity: 15, enrolled: [] },

  // Wednesday
  { id: 'c6', name: 'HIIT Cardio Combat', day: 'Wednesday', time: '08:00 AM - 09:00 AM', trainer: 'Coach Alex Tan', room: 'Studio B', capacity: 20, enrolled: [] },
  { id: 'c7', name: 'Upper Body Blast', day: 'Wednesday', time: '07:00 PM - 08:00 PM', trainer: 'Coach Marcus Lim', room: 'Gym Floor', capacity: 10, enrolled: [] },

  // Thursday
  { id: 'c8', name: 'Zumba & Aerobics', day: 'Thursday', time: '06:30 PM - 07:30 PM', trainer: 'Coach Sarah Wong', room: 'Studio B', capacity: 25, enrolled: [] },
  { id: 'c9', name: 'Advanced Athlete Competition Prep', day: 'Thursday', time: '08:00 PM - 09:30 PM', trainer: 'Coach Alex Tan', room: 'Gym Floor', capacity: 10, enrolled: [] },

  // Friday
  { id: 'c10', name: 'Functional Core Strength', day: 'Friday', time: '06:00 PM - 07:00 PM', trainer: 'Coach Marcus Lim', room: 'Gym Floor', capacity: 12, enrolled: [] },
  { id: 'c11', name: 'Core & Machine Circuit', day: 'Friday', time: '07:30 PM - 09:00 PM', trainer: 'Coach Alex Tan', room: 'Gym Floor', capacity: 20, enrolled: [] },

  // Saturday
  { id: 'c12', name: 'Weekend Yoga Flow', day: 'Saturday', time: '09:00 AM - 10:00 AM', trainer: 'Coach Sarah Wong', room: 'Studio B', capacity: 15, enrolled: [] },
  { id: 'c13', name: 'Competition Posing & Athlete Conditioning', day: 'Saturday', time: '10:30 AM - 12:00 PM', trainer: 'Coach Alex Tan', room: 'Gym Floor', capacity: 25, enrolled: [] },

  // Sunday
  { id: 'c14', name: 'Athlete Peak Performance Prep', day: 'Sunday', time: '10:00 AM - 11:30 AM', trainer: 'Coach Marcus Lim', room: 'Gym Floor', capacity: 15, enrolled: [] }
];

export const GymProvider = ({ children }) => {
  // Migration to clear old keys to load new competition-focused seed data
  if ((localStorage.getItem('bf_settings') || localStorage.getItem('bf_v1_settings') || localStorage.getItem('bf_v2_settings')) && !localStorage.getItem('bf_v3_settings')) {
    const keysToRemove = [
      'bf_settings', 'bf_trainers', 'bf_packages', 'bf_timetable', 'bf_current_user', 'bf_members', 'bf_pt_bookings', 'bf_trainer_blocks',
      'bf_v1_settings', 'bf_v1_trainers', 'bf_v1_packages', 'bf_v1_timetable', 'bf_v1_current_user', 'bf_v1_members', 'bf_v1_pt_bookings', 'bf_v1_trainer_blocks',
      'bf_v2_settings', 'bf_v2_trainers', 'bf_v2_packages', 'bf_v2_timetable', 'bf_v2_current_user', 'bf_v2_members', 'bf_v2_pt_bookings', 'bf_v2_trainer_blocks', 'bf_v2_trial_bookings'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }

  // Load initial states from LocalStorage or Fallback to default seed data
  const [gymSettings, setGymSettings] = useState(() => {
    const saved = localStorage.getItem('bf_v3_settings');
    return saved ? JSON.parse(saved) : DEFAULT_GYM_SETTINGS;
  });

  const [trainers, setTrainers] = useState(() => {
    const saved = localStorage.getItem('bf_v3_trainers');
    return saved ? JSON.parse(saved) : DEFAULT_TRAINERS;
  });

  const [packages, setPackages] = useState(() => {
    const saved = localStorage.getItem('bf_v3_packages');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('bf_v3_timetable');
    return saved ? JSON.parse(saved) : DEFAULT_CLASSES;
  });

  // User State: Default simulated user is "Guest"
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bf_v3_current_user');
    return saved ? JSON.parse(saved) : { email: null, role: 'guest', name: 'Guest' };
  });

  // Mock Members list (Database)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('bf_v3_members');
    if (saved) return JSON.parse(saved);
    
    // Seed with default profiles
    return [
      {
        email: 'member@gmail.com',
        name: 'Darren Teo',
        subscription: 'All-Access Monthly Membership',
        trainer: 'Coach Marcus Lim',
        ptSessionsLeft: 0,
        phone: '+60123456789',
        trainingPlan: [
          { name: 'Machine Chest Press', sets: '3', reps: '12', load: '45 kg', rest: '60s', notes: 'Focus on slow negative phase' },
          { name: 'Lat Pulldown', sets: '3', reps: '12', load: '40 kg', rest: '60s', notes: 'Squeeze shoulder blades together' },
          { name: 'Leg Press', sets: '3', reps: '15', load: '80 kg', rest: '90s', notes: 'Push through heels' }
        ],
        mealPlan: {
          targets: { calories: 2200, protein: 140, carbs: 250, fats: 70 },
          meals: [
            { name: 'Breakfast', items: 'Scrambled eggs (3), Wholemeal toast (2 slices)' },
            { name: 'Lunch', items: 'Chicken rice (less oil), clear vegetable soup' },
            { name: 'Dinner', items: 'Steamed sea bass fillet, brown rice, broccoli' }
          ]
        }
      },
      {
        email: 'fighter@gmail.com',
        name: 'Muhammad Faiz',
        subscription: 'Premium Strength & Conditioning Pass',
        trainer: 'Coach Alex Tan',
        ptSessionsLeft: 0,
        phone: '+60187654321',
        trainingPlan: [
          { name: 'Machine Leg Press', sets: '4', reps: '10-12', load: '120kg', rest: '90s', notes: 'Focus on full range of motion' },
          { name: 'Lat Pulldowns', sets: '4', reps: '10', load: '45kg', rest: '60s', notes: 'Squeeze shoulder blades' },
          { name: 'Dumbbell Chest Press', sets: '3', reps: '12', load: '15kg', rest: '60s', notes: 'Control the descent' }
        ],
        mealPlan: {
          targets: { calories: 2600, protein: 160, carbs: 320, fats: 80 },
          meals: [
            { name: 'Breakfast', items: 'Oatmeal with honey and banana, protein shake' },
            { name: 'Lunch', items: 'Beef noodles, boiled egg, choy sum' },
            { name: 'Dinner', items: 'Stir-fried sliced chicken breast, white rice, mixed vegetables' }
          ]
        }
      },
      {
        email: 'vip@gmail.com',
        name: 'Rachel Chen',
        subscription: 'VIP Personal Coaching Elite',
        trainer: 'Coach Sarah Wong',
        ptSessionsLeft: 8,
        phone: '+60198765432',
        trainingPlan: [
          { name: 'Barbell Squat', sets: '4', reps: '8', load: '60 kg', rest: '90s', notes: 'Engage core, control descent' },
          { name: 'Romanian Deadlift', sets: '3', reps: '10', load: '50 kg', rest: '60s', notes: 'Hinge at hips, stretch hamstrings' },
          { name: 'Lying Leg Curl', sets: '3', reps: '12', load: '20 kg', rest: '60s', notes: 'Squeeze hamstrings at top' },
          { name: 'Dumbbell Bench Press', sets: '4', reps: '10', load: '14 kg each', rest: '90s', notes: 'Keep elbows at 45 degrees' },
          { name: 'Lat Pulldown', sets: '4', reps: '10', load: '30 kg', rest: '60s', notes: 'Pull bar to collarbone' }
        ],
        mealPlan: {
          targets: { calories: 1500, protein: 120, carbs: 140, fats: 50 },
          meals: [
            { name: 'Breakfast', items: 'Oats (40g) + 1 scoop Whey Protein + handful of berries' },
            { name: 'Lunch', items: 'Grilled chicken breast (150g) + broccoli + sweet potato (100g)' },
            { name: 'Dinner', items: 'Baked salmon fillet (150g) + mixed greens salad + cherry tomatoes' },
            { name: 'Snack', items: 'Greek yogurt (150g) + raw almonds (15g)' }
          ]
        }
      }
    ];
  });

  // PT bookings database
  const [ptBookings, setPtBookings] = useState(() => {
    const saved = localStorage.getItem('bf_v3_pt_bookings');
    return saved ? JSON.parse(saved) : [
      { id: 'ptb1', memberEmail: 'vip@gmail.com', memberName: 'Rachel Chen', trainerId: 't3', trainerName: 'Coach Sarah Wong', day: 'Monday', time: '11:00 AM' },
      { id: 'ptb2', memberEmail: 'member@gmail.com', memberName: 'Darren Teo', trainerId: 't2', trainerName: 'Coach Marcus Lim', day: 'Wednesday', time: '05:00 PM' }
    ];
  });

  // Trainer Availability Blocks state
  const [trainerBlocks, setTrainerBlocks] = useState(() => {
    const saved = localStorage.getItem('bf_v3_trainer_blocks');
    return saved ? JSON.parse(saved) : [];
  });

  // Guest Trial Class Bookings state
  const [trialBookings, setTrialBookings] = useState(() => {
    const saved = localStorage.getItem('bf_v3_trial_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Synchronize state with LocalStorage and update theme
  useEffect(() => {
    localStorage.setItem('bf_v3_settings', JSON.stringify(gymSettings));
    
    // Dynamically update CSS custom properties for accent styling
    const activeTheme = THEMES[gymSettings.theme] || THEMES.red;
    document.documentElement.style.setProperty('--primary-color', activeTheme.primary);
    document.documentElement.style.setProperty('--primary-glow', activeTheme.primaryGlow);
    document.documentElement.style.setProperty('--primary-dark', activeTheme.primaryDark);
  }, [gymSettings]);

  useEffect(() => {
    localStorage.setItem('bf_v3_trainers', JSON.stringify(trainers));
  }, [trainers]);

  useEffect(() => {
    localStorage.setItem('bf_v3_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('bf_v3_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('bf_v3_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bf_v3_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('bf_v3_pt_bookings', JSON.stringify(ptBookings));
  }, [ptBookings]);

  useEffect(() => {
    localStorage.setItem('bf_v3_trainer_blocks', JSON.stringify(trainerBlocks));
  }, [trainerBlocks]);

  useEffect(() => {
    localStorage.setItem('bf_v3_trial_bookings', JSON.stringify(trialBookings));
  }, [trialBookings]);

  // Auth Operations (Simulated)
  const login = (email, role) => {
    let name = role.charAt(0).toUpperCase() + role.slice(1);
    const emailLower = email ? email.toLowerCase() : '';
    
    // Try to match registered members
    if (role === 'member') {
      const match = members.find(m => m.email.toLowerCase() === emailLower);
      if (match) {
        name = match.name;
      } else {
        // Create new member if not exists
        const newMember = {
          email: emailLower,
          name: email.split('@')[0],
          subscription: null,
          trainer: null,
          ptSessionsLeft: 0,
          phone: '+60123456789',
          trainingPlan: [],
          mealPlan: {
            targets: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
            meals: [
              { name: 'Breakfast', items: '' },
              { name: 'Lunch', items: '' },
              { name: 'Dinner', items: '' }
            ]
          }
        };
        setMembers(prev => [...prev, newMember]);
        name = newMember.name;
      }
    } else if (role === 'trainer') {
      // Find trainer details
      let trainerId = email;
      if (email.includes('alex')) trainerId = 't1';
      else if (email.includes('marcus')) trainerId = 't2';
      else if (email.includes('sarah')) trainerId = 't3';
      
      const trainer = trainers.find(t => t.id === trainerId) || trainers[0];
      name = trainer.name;
      email = trainer.id; // Store trainer id as email identifier
    }

    setCurrentUser({ email: email.toLowerCase(), role, name });
  };

  const logout = () => {
    setCurrentUser({ email: null, role: 'guest', name: 'Guest' });
  };

  // Subscribe current user to a package
  const subscribeToPackage = (packageId) => {
    if (currentUser.role !== 'member') {
      alert('Please log in as a member to subscribe.');
      return false;
    }

    const targetPkg = packages.find(p => p.id === packageId);
    if (!targetPkg) return false;

    // Under new rule, members CANNOT choose their own PT.
    // They are set to "Pending Assignment" and admin must assign manually.
    let assignedTrainer = null;
    let ptSessions = 0;
    if (targetPkg.id === 'p4') { // VIP package
      assignedTrainer = 'Pending Assignment';
      ptSessions = 8;
    }

    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return {
          ...m,
          subscription: targetPkg.name,
          trainer: assignedTrainer || null,
          ptSessionsLeft: ptSessions
        };
      }
      return m;
    }));

    if (targetPkg.id === 'p4') {
      alert(`Successfully subscribed to ${targetPkg.name}! Your Personal Trainer assignment is pending. Admin will assign your coach shortly.`);
    } else {
      alert(`Successfully subscribed to ${targetPkg.name}!`);
    }
    return true;
  };

  // Book a class
  const bookClass = (classId) => {
    if (currentUser.role !== 'member') {
      alert('Please sign in as a Member to book gym classes.');
      return false;
    }

    // Check if user has active subscription
    const memberProfile = members.find(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
    if (!memberProfile || !memberProfile.subscription) {
      alert('Active subscription required to book classes. Please purchase a membership package first!');
      return false;
    }

    let success = false;
    let message = '';

    setTimetable(prev => prev.map(c => {
      if (c.id === classId) {
        if (c.enrolled.includes(currentUser.email)) {
          message = 'You have already booked this class!';
          return c;
        }
        if (c.enrolled.length >= c.capacity) {
          message = 'Sorry, this class is already full!';
          return c;
        }
        success = true;
        message = `Successfully booked class: ${c.name}!`;
        return { ...c, enrolled: [...c.enrolled, currentUser.email] };
      }
      return c;
    }));

    alert(message);
    return success;
  };

  // Cancel class booking
  const cancelClassBooking = (classId) => {
    if (currentUser.role !== 'member') return;

    setTimetable(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          enrolled: c.enrolled.filter(e => e.toLowerCase() !== currentUser.email.toLowerCase())
        };
      }
      return c;
    }));
    alert('Booking cancelled successfully.');
  };

  // Book personal trainer session
  const bookPtSession = (trainerId, day, time) => {
    if (currentUser.role !== 'member') {
      alert('Please sign in as a Member to book PT sessions.');
      return false;
    }

    const memberProfile = members.find(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
    if (!memberProfile || !memberProfile.subscription) {
      alert('Please subscribe to a membership package first.');
      return false;
    }

    const coach = trainers.find(t => t.id === trainerId);
    if (!coach) return false;

    // RULE 1: Enforce coach assignment
    if (!memberProfile.trainer || memberProfile.trainer === 'Pending Assignment') {
      alert('You do not have a coach assigned yet. Please contact the administrator to assign your coach.');
      return false;
    }

    // RULE 2: Member cannot choose other trainers, must book with assigned trainer
    if (memberProfile.trainer.toLowerCase() !== coach.name.toLowerCase()) {
      alert(`You can only book sessions with your assigned coach: ${memberProfile.trainer}.`);
      return false;
    }

    // RULE 3: Check credits left
    if (memberProfile.ptSessionsLeft <= 0) {
      alert('No Personal Training sessions left. Please renew or purchase a new package.');
      return false;
    }

    // RULE 4: Check if the timing is already booked (double booking)
    const isTrainerBooked = ptBookings.some(
      b => b.trainerId === coach.id && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
    );
    if (isTrainerBooked) {
      alert(`Coach ${coach.name} is already booked on ${day} at ${time}. Please select a different time slot.`);
      return false;
    }

    // RULE 5: Check if timing is blocked by trainer
    const isTrainerBlocked = trainerBlocks.some(
      b => b.trainerId === coach.id && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
    );
    if (isTrainerBlocked) {
      alert(`Coach ${coach.name} has blocked this time slot (${day} at ${time}) and is unavailable.`);
      return false;
    }

    const newBooking = {
      id: 'ptb_' + Date.now(),
      memberEmail: currentUser.email,
      memberName: memberProfile.name,
      trainerId: coach.id,
      trainerName: coach.name,
      day,
      time
    };

    setPtBookings(prev => [...prev, newBooking]);

    // Update member's session count
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return { ...m, ptSessionsLeft: m.ptSessionsLeft - 1 };
      }
      return m;
    }));

    alert(`Successfully scheduled 1-on-1 session with ${coach.name} for ${day} at ${time}!`);
    return true;
  };

  // Cancel PT booking
  const cancelPtBooking = (bookingId) => {
    const booking = ptBookings.find(b => b.id === bookingId);
    if (!booking) return;

    setPtBookings(prev => prev.filter(b => b.id !== bookingId));

    // Refund session count if VIP
    const memberProfile = members.find(m => m.email.toLowerCase() === booking.memberEmail.toLowerCase());
    if (memberProfile && memberProfile.subscription && memberProfile.subscription.includes('VIP')) {
      setMembers(prev => prev.map(m => {
        if (m.email.toLowerCase() === booking.memberEmail.toLowerCase()) {
          return { ...m, ptSessionsLeft: m.ptSessionsLeft + 1 };
        }
        return m;
      }));
    }
    alert('Personal Training session cancelled. Session credit refunded.');
  };

  // Admin function: Assign trainer to member
  const assignTrainerToMember = (memberEmail, trainerName) => {
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        return { ...m, trainer: trainerName };
      }
      return m;
    }));
  };

  // Trainer function: Update Training Plan
  const updateTrainingPlan = (memberEmail, planText) => {
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        return { ...m, trainingPlan: planText };
      }
      return m;
    }));
  };

  // Trainer function: Update Meal Plan
  const updateMealPlan = (memberEmail, planText) => {
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        return { ...m, mealPlan: planText };
      }
      return m;
    }));
  };

  // Trainer function: Update Trainer's own profile
  const updateTrainerProfile = (trainerId, updatedFields) => {
    setTrainers(prev => prev.map(t => {
      if (t.id === trainerId) {
        return { ...t, ...updatedFields };
      }
      return t;
    }));
  };

  // Trainer function: Add availability block
  const addTrainerBlock = (trainerId, day, time, type = 'general_block', label = 'Unavailable') => {
    const alreadyBlocked = trainerBlocks.some(
      b => b.trainerId === trainerId && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
    );
    if (alreadyBlocked) return;

    // Check if there is already a booked session at this slot
    const hasBooking = ptBookings.some(
      b => b.trainerId === trainerId && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase()
    );
    if (hasBooking) {
      alert('Cannot block a time slot that already has a member booking scheduled.');
      return;
    }

    setTrainerBlocks(prev => [...prev, { trainerId, day, time, type, label }]);
  };

  // Trainer function: Remove availability block
  const removeTrainerBlock = (trainerId, day, time) => {
    setTrainerBlocks(prev => prev.filter(
      b => !(b.trainerId === trainerId && b.day.toLowerCase() === day.toLowerCase() && b.time.toLowerCase() === time.toLowerCase())
    ));
  };

  // Book a free trial class for guest user
  const bookTrialClass = (classId, guestInfo) => {
    const targetClass = timetable.find(c => c.id === classId);
    if (!targetClass) return false;

    // Check if email already booked this class in trialBookings
    const alreadyBooked = trialBookings.some(
      b => b.classId === classId && b.email.toLowerCase() === guestInfo.email.toLowerCase()
    );
    if (alreadyBooked) {
      alert('You have already requested a free trial for this class!');
      return false;
    }

    const newTrialBooking = {
      id: 'trial_' + Date.now(),
      classId,
      className: targetClass.name,
      classTime: targetClass.time,
      classDay: targetClass.day,
      classTrainer: targetClass.trainer,
      name: guestInfo.name,
      email: guestInfo.email.toLowerCase(),
      phone: guestInfo.phone,
      status: 'pending', // pending / confirmed
      createdAt: new Date().toISOString()
    };

    setTrialBookings(prev => [...prev, newTrialBooking]);
    return true;
  };

  // Reset to default settings
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all configurations to default? This will clear bookings, subscriptions, and customized packages.')) {
      localStorage.removeItem('bf_v3_settings');
      localStorage.removeItem('bf_v3_trainers');
      localStorage.removeItem('bf_v3_packages');
      localStorage.removeItem('bf_v3_timetable');
      localStorage.removeItem('bf_v3_members');
      localStorage.removeItem('bf_v3_pt_bookings');
      localStorage.removeItem('bf_v3_trainer_blocks');
      localStorage.removeItem('bf_v3_trial_bookings');
      
      setGymSettings(DEFAULT_GYM_SETTINGS);
      setTrainers(DEFAULT_TRAINERS);
      setPackages(DEFAULT_PACKAGES);
      setTimetable(DEFAULT_CLASSES);
      setTrainerBlocks([]);
      setPtBookings([
        { id: 'ptb1', memberEmail: 'vip@gmail.com', memberName: 'Rachel Chen', trainerId: 't3', trainerName: 'Coach Sarah Wong', day: 'Monday', time: '11:00 AM' },
        { id: 'ptb2', memberEmail: 'member@gmail.com', memberName: 'Darren Teo', trainerId: 't2', trainerName: 'Coach Marcus Lim', day: 'Wednesday', time: '05:00 PM' }
      ]);
      setMembers([
        {
          email: 'member@gmail.com',
          name: 'Darren Teo',
          subscription: 'All-Access Monthly Membership',
          trainer: 'Coach Marcus Lim',
          ptSessionsLeft: 0,
          phone: '+60123456789',
          trainingPlan: [
            { name: 'Machine Chest Press', sets: '3', reps: '12', load: '45 kg', rest: '60s', notes: 'Focus on slow negative phase' },
            { name: 'Lat Pulldown', sets: '3', reps: '12', load: '40 kg', rest: '60s', notes: 'Squeeze shoulder blades together' },
            { name: 'Leg Press', sets: '3', reps: '15', load: '80 kg', rest: '90s', notes: 'Push through heels' }
          ],
          mealPlan: {
            targets: { calories: 2200, protein: 140, carbs: 250, fats: 70 },
            meals: [
              { name: 'Breakfast', items: 'Scrambled eggs (3), Wholemeal toast (2 slices)' },
              { name: 'Lunch', items: 'Chicken rice (less oil), clear vegetable soup' },
              { name: 'Dinner', items: 'Steamed sea bass fillet, brown rice, broccoli' }
            ]
          }
        },
        {
          email: 'fighter@gmail.com',
          name: 'Muhammad Faiz',
          subscription: 'Premium Strength & Conditioning Pass',
          trainer: 'Coach Alex Tan',
          ptSessionsLeft: 0,
          phone: '+60187654321',
          trainingPlan: [
            { name: 'Machine Leg Press', sets: '4', reps: '10-12', load: '120kg', rest: '90s', notes: 'Focus on full range of motion' },
            { name: 'Lat Pulldowns', sets: '4', reps: '10', load: '45kg', rest: '60s', notes: 'Squeeze shoulder blades' },
            { name: 'Dumbbell Chest Press', sets: '3', reps: '12', load: '15kg', rest: '60s', notes: 'Control the descent' }
          ],
          mealPlan: {
            targets: { calories: 2600, protein: 160, carbs: 320, fats: 80 },
            meals: [
              { name: 'Breakfast', items: 'Oatmeal with honey and banana, protein shake' },
              { name: 'Lunch', items: 'Beef noodles, boiled egg, choy sum' },
              { name: 'Dinner', items: 'Stir-fried sliced chicken breast, white rice, mixed vegetables' }
            ]
          }
        },
        {
          email: 'vip@gmail.com',
          name: 'Rachel Chen',
          subscription: 'VIP Personal Coaching Elite',
          trainer: 'Coach Sarah Wong',
          ptSessionsLeft: 8,
          phone: '+60198765432',
          trainingPlan: [
            { name: 'Barbell Squat', sets: '4', reps: '8', load: '60 kg', rest: '90s', notes: 'Engage core, control descent' },
            { name: 'Romanian Deadlift', sets: '3', reps: '10', load: '50 kg', rest: '60s', notes: 'Hinge at hips, stretch hamstrings' },
            { name: 'Lying Leg Curl', sets: '3', reps: '12', load: '20 kg', rest: '60s', notes: 'Squeeze hamstrings at top' },
            { name: 'Dumbbell Bench Press', sets: '4', reps: '10', load: '14 kg each', rest: '90s', notes: 'Keep elbows at 45 degrees' },
            { name: 'Lat Pulldown', sets: '4', reps: '10', load: '30 kg', rest: '60s', notes: 'Pull bar to collarbone' }
          ],
          mealPlan: {
            targets: { calories: 1500, protein: 120, carbs: 140, fats: 50 },
            meals: [
              { name: 'Breakfast', items: 'Oats (40g) + 1 scoop Whey Protein + handful of berries' },
              { name: 'Lunch', items: 'Grilled chicken breast (150g) + broccoli + sweet potato (100g)' },
              { name: 'Dinner', items: 'Baked salmon fillet (150g) + mixed greens salad + cherry tomatoes' },
              { name: 'Snack', items: 'Greek yogurt (150g) + raw almonds (15g)' }
            ]
          }
        }
      ]);
      setCurrentUser({ email: null, role: 'guest', name: 'Guest' });
      
      window.location.reload();
    }
  };

  return (
    <GymContext.Provider value={{
      gymSettings,
      setGymSettings,
      trainers,
      setTrainers,
      packages,
      setPackages,
      timetable,
      setTimetable,
      currentUser,
      members,
      setMembers,
      ptBookings,
      setPtBookings,
      trainerBlocks,
      setTrainerBlocks,
      trialBookings,
      setTrialBookings,
      bookTrialClass,
      login,
      logout,
      subscribeToPackage,
      bookClass,
      cancelClassBooking,
      bookPtSession,
      cancelPtBooking,
      assignTrainerToMember,
      updateTrainingPlan,
      updateMealPlan,
      updateTrainerProfile,
      addTrainerBlock,
      removeTrainerBlock,
      resetToDefault
    }}>
      {children}
    </GymContext.Provider>
  );
};
