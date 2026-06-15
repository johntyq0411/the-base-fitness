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

// Mutant® Supplement Catalog
const DEFAULT_SUPPLEMENTS = [
  {
    id: 'sup1',
    name: 'MUTANT WHEY™',
    category: 'Whey Protein',
    categoryKey: 'whey',
    image: '21052EX_MUTANT_WHEY_Triple_Chocolate_Flavour_2.27_kg_5_lb_v2.00-L-L3.jpg',
    images: [
      { src: '21052EX_MUTANT_WHEY_Triple_Chocolate_Flavour_2.27_kg_5_lb_v2.00-L-L3.jpg', label: 'Triple Chocolate Front', flavor: 'Triple Chocolate' },
      { src: '21051EX_MUTANT_WHEY_Vanilla_Ice_Cream_Flavour_2.27_kg_5_lb_v2.00-L3.jpg', label: 'Vanilla Ice Cream Front', flavor: 'Vanilla Ice Cream' },
      { src: '21053EX_MUTANT_WHEY_Cookies_Cream_Flavour_2.27_kg_5_lb_v2.00-L3.jpg', label: 'Cookies & Cream Front', flavor: 'Cookies & Cream' },
      { src: '21054EX_MUTANT_WHEY_Strawberry_Cream_Flavour_2.27_kg_5_lb_v2.00-L3.jpg', label: 'Strawberry Cream Front', flavor: 'Strawberry Cream' },
      { src: '21055EX_MUTANT_WHEY_Chocolate_Fudge_Brownie_Flavour_2.27_kg_5_lb_v2.00-L3.jpg', label: 'Chocolate Fudge Brownie Front', flavor: 'Chocolate Fudge Brownie' },
      { src: '21052EX_MUTANT_WHEY_back.jpg', label: 'Nutrition Facts Back' }
    ],
    price: 179,
    weight: '2.27 kg (5 lbs)',
    servings: 73,
    description: 'A premium 5-protein blend delivering 22g protein per scoop. Fast & slow-digesting proteins for sustained muscle recovery and growth. NSF Certified.',
    highlights: ['22g Protein per scoop', '5-Protein Blend', 'NSF Certified', 'Mixes Instantly'],
    flavors: ['Triple Chocolate', 'Vanilla Ice Cream', 'Cookies & Cream', 'Strawberry Cream', 'Chocolate Fudge Brownie'],
    visible: true
  },
  {
    id: 'sup2',
    name: 'MUTANT MASS®',
    category: 'Mass Gainer',
    categoryKey: 'mass',
    image: '21502EXMUTANTMASSTripleChocolateFlavour2.27KG_5LB_v2.00-L3.jpg',
    images: [
      { src: '21502EXMUTANTMASSTripleChocolateFlavour2.27KG_5LB_v2.00-L3.jpg', label: 'Triple Chocolate Front', flavor: 'Triple Chocolate' },
      { src: '21502EX_MUTANT_MASS_back.jpg', label: 'Nutrition Facts Back' }
    ],
    price: 249,
    weight: '6.8 kg (15 lbs)',
    servings: 32,
    description: 'The ultimate mass-building formula. 1100 calories and 52g protein per serving with complex carbs to fuel serious size gains. For hardgainers who train hard.',
    highlights: ['1100 Calories per serving', '52g Protein', 'Complex Carb Matrix', 'Creatine Monohydrate included'],
    flavors: ['Triple Chocolate'],
    visible: true
  },
  {
    id: 'sup3',
    name: 'MUTANT CREAKONG® CX8',
    category: 'Creatine',
    categoryKey: 'creatine',
    image: '34053US_MUTANT_CREATINE_Unflavored_300g_10.6oz_v2.00-L3.jpg',
    images: [
      { src: '34053US_MUTANT_CREATINE_Unflavored_300g_10.6oz_v2.00-L3.jpg', label: 'Unflavored Front', flavor: 'Unflavored' },
      { src: '34053US_MUTANT_CREATINE_side1.jpg', label: 'Side Directions 1' },
      { src: '34053US_MUTANT_CREATINE_side2.jpg', label: 'Side Warnings 2' }
    ],
    price: 99,
    weight: '300g',
    servings: 60,
    description: 'Next-level creatine complex featuring 8 forms of creatine for maximum absorption and muscle saturation. No loading phase required. Unflavored for versatile mixing.',
    highlights: ['8-Form Creatine Complex', 'No Loading Phase', 'Maximizes Strength', 'Micronized for purity'],
    flavors: ['Unflavored'],
    visible: true
  },
  {
    id: 'sup4',
    name: 'MUTANT ISO SURGE™',
    category: 'Iso Protein',
    categoryKey: 'iso',
    image: '20052EXMUTANTHARDCOREISOTripleChocolateFlavour2.27KG_5LB_v2.10_NS-L3_1.jpg',
    images: [
      { src: '20052EXMUTANTHARDCOREISOTripleChocolateFlavour2.27KG_5LB_v2.10_NS-L3_1.jpg', label: 'Triple Chocolate Front', flavor: 'Triple Chocolate' },
      { src: '20051EXMUTANTHARDCOREISOVanillaIceCreamFlavour2.27KG_5LB_v2.10_NS-L3_1.jpg', label: 'Vanilla Ice Cream Front', flavor: 'Vanilla Ice Cream' },
      { src: '20054EXMUTANTHARDCOREISOStrawberryMilkshakeFlavour2.27KG_5LB_v2.10_NS-L3_1.jpg', label: 'Strawberry Milkshake Front', flavor: 'Strawberry Milkshake' },
      { src: '20055EXMUTANTHARDCOREISOPeanutButterChocolateFlavour2.27KG_5LB_v2.10_NS-L3_2.jpg', label: 'Peanut Butter Chocolate Front', flavor: 'Peanut Butter Chocolate' },
      { src: '20056EXMUTANTHARDCOREISOMintChocolateChipIceCreamFlavour2.27KG_5LB_v2.10_NS-L3_2.jpg', label: 'Mint Chocolate Chip Front', flavor: 'Mint Chocolate Chip' },
      { src: '20058EXMUTANTHARDCOREISOBananaCreamFlavour2.27KG_5LB_v2.10_NS-L3_2.jpg', label: 'Banana Cream Front', flavor: 'Banana Cream' },
      { src: '20060EXMUTANTHARDCOREISOChocolateFudgeBrownieFlavour2.27KG_5LB_v2.10_NS-L3_2.jpg', label: 'Chocolate Fudge Brownie Front', flavor: 'Chocolate Fudge Brownie' },
      { src: '20051EXMUTANTHARDCOREISOside1.jpg', label: 'Side Panel 1' },
      { src: '20051EXMUTANTHARDCOREISOSide2.jpg', label: 'Side Panel 2' }
    ],
    price: 199,
    weight: '1.6 kg (3.5 lbs)',
    servings: 50,
    description: 'Ultra-pure whey isolate with 25g protein and under 1g fat per serving. Cold-filtered for maximum purity — ideal for cutting phases and lean muscle building.',
    highlights: ['25g Isolate Protein', '<1g Fat per scoop', 'Cold-Filtered', 'Lactose Reduced'],
    flavors: ['Triple Chocolate', 'Vanilla Ice Cream', 'Strawberry Milkshake', 'Peanut Butter Chocolate', 'Mint Chocolate Chip', 'Banana Cream', 'Chocolate Fudge Brownie'],
    visible: true
  },
  {
    id: 'sup5',
    name: 'MUTANT BCAA 9.7™',
    category: 'BCAA',
    categoryKey: 'bcaa',
    image: '34303US_MUTANT_HARDCORE_BCAA_Watermelon_Flavor_390g_13.8oz_v2.00-L3_ca1d231d-1116-4d32-a505-efc36fd155b7.jpg',
    images: [
      { src: '34303US_MUTANT_HARDCORE_BCAA_Watermelon_Flavor_390g_13.8oz_v2.00-L3_ca1d231d-1116-4d32-a505-efc36fd155b7.jpg', label: 'Watermelon Front', flavor: 'Watermelon' },
      { src: '34301US_MUTANT_HARDCORE_BCAA_Fruit_Punch_Flavor_390g_13.8oz_v2.00-L3_66885f45-95cb-43f4-9925-55c523119271.jpg', label: 'Fruit Punch Front', flavor: 'Fruit Punch' },
      { src: '34306US_MUTANT_HARDCORE_BCAA_Peach_Flavor_390g_13.8oz_v2.00-L3.jpg', label: 'Peach Front', flavor: 'Peach' },
      { src: '34307US_MUTANT_HARDCORE_BCAA_Pineapple_Flavor_390g_13.8oz_v2.00-L3.jpg', label: 'Pineapple Front', flavor: 'Pineapple' },
      { src: '34308US_MUTANT_HARDCORE_BCAA_Lemonade_Flavor_390g_13.8oz_v2.00-L3_0b7b5e8d-e2c0-4f1b-b33d-9bfcd20a5536.jpg', label: 'Lemonade Front', flavor: 'Lemonade' },
      { src: '34312US_MUTANT_HARDCORE_BCAA_Mango_Flavor_390g_13.8oz_v2.00-L3_b5012e12-c828-4ebd-a3a6-edb54b0f3958.jpg', label: 'Mango Front', flavor: 'Mango' },
      { src: '34316US_MUTANT_HARDCORE_BCAA_Grape_Flavor_390g_13.8oz_v2.00-L3.jpg', label: 'Grape Front', flavor: 'Grape' },
      { src: '34306US_MUTANT_HARDCORE_BCAABack.jpg', label: 'Nutrition Facts Back' }
    ],
    price: 99,
    weight: '348g',
    servings: 30,
    description: '9.7g of BCAAs in the clinically researched 2:1:1 ratio per serving, with added electrolytes and hydration support. Fuel performance and fight muscle breakdown.',
    highlights: ['9.7g BCAAs per serving', '2:1:1 Leucine Ratio', 'Added Electrolytes', 'Intra-workout fuel'],
    flavors: ['Watermelon', 'Fruit Punch', 'Peach', 'Pineapple', 'Lemonade', 'Mango', 'Grape'],
    visible: true
  },
  {
    id: 'sup6',
    name: 'MUTANT EAA™',
    category: 'EAA',
    categoryKey: 'eaa',
    image: '22201EXMUTANTGEAARTropicalPunchFlavour420g_14.8oz_v2.00-L3.jpg',
    images: [
      { src: '22201EXMUTANTGEAARTropicalPunchFlavour420g_14.8oz_v2.00-L3.jpg', label: 'Tropical Punch Front', flavor: 'Tropical Punch' },
      { src: '22202EX_MUTANT_GEAAR_Peach_Mango_Flavour_420g_14.8_oz_v2.00-L3.jpg', label: 'Peach Mango Front', flavor: 'Peach Mango' },
      { src: '22203EX_MUTANT_GEAAR_Blue_Raspberry_Flavour_420g_14.8_oz_v2.00-L3.jpg', label: 'Blue Raspberry Front', flavor: 'Blue Raspberry' },
      { src: '22204EX_MUTANT_GEAAR_Sweet_Iced_Tea_Flavour_420g_14.8_oz_v2.00-L3_a9ec03db-ba18-4e17-a3b4-c2df06f5ea27.jpg', label: 'Sweet Iced Tea Front', flavor: 'Sweet Iced Tea' },
      { src: '22201EX_MUTANT_GEAAR_side1.jpg', label: 'Side Ingredients 1' },
      { src: '22201EX_MUTANT_GEAAR_side2.jpg', label: 'Side Nutrition 2' }
    ],
    price: 109,
    weight: '390g',
    servings: 30,
    description: 'Complete Essential Amino Acid formula with all 9 EAAs your body cannot produce on its own. Supports muscle protein synthesis, recovery, and hydration throughout your training.',
    highlights: ['All 9 Essential Amino Acids', 'Full Spectrum EAA Profile', 'Supports Muscle Synthesis', 'Anti-Catabolism'],
    flavors: ['Tropical Punch', 'Peach Mango', 'Blue Raspberry', 'Sweet Iced Tea'],
    visible: true
  },
  {
    id: 'eq1',
    name: 'Anovator A5 Health Assessment Station',
    category: 'Health Tech',
    categoryKey: 'tech',
    image: 'anovator_a5.png',
    images: [
      { src: 'anovator_a5.png', label: 'Anovator A5 Diagnostic Station' }
    ],
    price: 18500,
    weight: '38 kg (83.7 lbs)',
    servings: 1,
    description: 'The premium clinical-grade body composition and posture analysis station. Delivers a complete diagnostics report in under 5 minutes: AI 3D posture risk analysis, 8-electrode segmental body composition (BIA), clinical blood pressure, SpO2, and balance metrics. Perfect for clinics, professional training centers, and gym setups.',
    highlights: ['AI 3D Posture & Risk Scan', '8-Electrode Segmental BIA', 'Clinical Vitals (BP & SpO2)', 'Ideal for Gyms, Clinics, Physio'],
    flavors: ['Standard Dual-Tone'],
    visible: true
  }
];

// Supplement Discount Config per Membership Tier
const DEFAULT_SUPPLEMENT_DISCOUNTS = {
  'Day Pass Access': 5,
  'All-Access Monthly Membership': 10,
  'Premium Strength & Competition Pass': 15,
  'VIP Personal Coaching & Athlete Prep': 20,
  'default': 5
};
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
    photo: 'coach_marcus.png',
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
    photo: 'coach_sarah.png',
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

// Standalone utility helpers for time calculations and overlapping check
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const simpleMatch = timeStr.trim().match(/^(\d{1,2})\s*(AM|PM)$/i);
    if (simpleMatch) {
      let hours = parseInt(simpleMatch[1], 10);
      const ampm = simpleMatch[2].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60;
    }
    return 0;
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const parseTimeRange = (rangeStr) => {
  if (!rangeStr) return { start: 0, end: 0 };
  const parts = rangeStr.split('-');
  if (parts.length === 2) {
    return {
      start: parseTimeToMinutes(parts[0]),
      end: parseTimeToMinutes(parts[1])
    };
  }
  const start = parseTimeToMinutes(rangeStr);
  return { start, end: start + 60 }; // default 1 hour PT session
};

export const addOneHour = (timeStr) => {
  const mins = parseTimeToMinutes(timeStr);
  const newMins = mins + 60;
  const hours = Math.floor(newMins / 60) % 24;
  const minutes = newMins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = String(minutes).padStart(2, '0');
  return `${String(displayHours).padStart(2, '0')}:${displayMins} ${ampm}`;
};

export const isTimeRangeOverlapping = (start1, end1, start2, end2) => {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);
  return s1 < e2 && s2 < e1;
};

export const matchesDay = (dayA, dayB) => {
  if (!dayA || !dayB) return false;
  const cleanA = dayA.trim().toLowerCase();
  const cleanB = dayB.trim().toLowerCase();
  if (cleanA === cleanB) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const getWeekday = (str) => {
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return dayNames[d.getDay()];
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return dayNames[d.getDay()];
    }
    return null;
  };

  const weekdayA = dayNames.includes(cleanA) ? cleanA : getWeekday(dayA);
  const weekdayB = dayNames.includes(cleanB) ? cleanB : getWeekday(dayB);
  
  if (weekdayA && weekdayB) {
    return weekdayA === weekdayB;
  }
  return false;
};

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

  // Migration: clear stale trainer photos if old placeholders are still in cache
  const cachedTrainers = localStorage.getItem('bf_v3_trainers');
  if (cachedTrainers) {
    try {
      const parsed = JSON.parse(cachedTrainers);
      const hasOldPhotos = parsed.some(t => t.photo === 'personal_training.png' || t.photo === 'hero.png');
      if (hasOldPhotos) {
        localStorage.removeItem('bf_v3_trainers');
      }
    } catch(e) { localStorage.removeItem('bf_v3_trainers'); }
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

  // Supplement catalog state
  const [supplements, setSupplements] = useState(() => {
    const saved = localStorage.getItem('bf_v3_supplements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Force refresh catalog if it contains old webp or png generated placeholder images
        const hasOldImages = parsed.some(p => {
          if (p.image && (p.image.endsWith('.webp') || p.image.includes('mutant_'))) return true;
          if (p.images && p.images.some(img => img.src.endsWith('.webp') || img.src.includes('mutant_'))) return true;
          return false;
        });
        if (!hasOldImages) {
          return parsed;
        }
      } catch (e) {
        // fallback to default
      }
    }
    return DEFAULT_SUPPLEMENTS;
  });

  // Supplement discount config state
  const [supplementDiscounts, setSupplementDiscounts] = useState(() => {
    const saved = localStorage.getItem('bf_v3_supp_discounts');
    return saved ? JSON.parse(saved) : DEFAULT_SUPPLEMENT_DISCOUNTS;
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

  useEffect(() => {
    localStorage.setItem('bf_v3_supplements', JSON.stringify(supplements));
  }, [supplements]);

  useEffect(() => {
    localStorage.setItem('bf_v3_supp_discounts', JSON.stringify(supplementDiscounts));
  }, [supplementDiscounts]);

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
  const bookClass = (classId, dateStr) => {
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
        const enrollEntry = dateStr ? `${currentUser.email.toLowerCase()}:${dateStr}` : currentUser.email.toLowerCase();

        // Check if already enrolled for this date/class
        const isAlreadyEnrolled = c.enrolled.some(e => {
          if (!e.includes(':')) {
            // generic enrollment matches any day
            return e.toLowerCase() === currentUser.email.toLowerCase();
          }
          const [email, d] = e.split(':');
          if (dateStr) {
            return email.toLowerCase() === currentUser.email.toLowerCase() && d === dateStr;
          } else {
            return email.toLowerCase() === currentUser.email.toLowerCase();
          }
        });

        if (isAlreadyEnrolled) {
          message = 'You have already booked this class!';
          return c;
        }

        // Count capacity for this date
        const activeEnrollments = c.enrolled.filter(e => {
          if (!e.includes(':')) return true; // generic enrollment counts for all dates
          if (!dateStr) return true; // if no dateStr, count all
          const [email, d] = e.split(':');
          return d === dateStr;
        });

        if (activeEnrollments.length >= c.capacity) {
          message = 'Sorry, this class is already full!';
          return c;
        }

        success = true;
        message = `Successfully booked class: ${c.name}!`;
        return { ...c, enrolled: [...c.enrolled, enrollEntry] };
      }
      return c;
    }));

    alert(message);
    return success;
  };

  // Cancel class booking
  const cancelClassBooking = (classId, dateStr) => {
    if (currentUser.role !== 'member') return;

    setTimetable(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          enrolled: c.enrolled.filter(e => {
            if (!e.includes(':')) {
              // Plain email address
              return e.toLowerCase() !== currentUser.email.toLowerCase();
            }
            const [email, d] = e.split(':');
            if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
              return true; // keep other users' enrollments
            }
            // If email matches currentUser, and dateStr is provided, only remove if d === dateStr
            if (dateStr) {
              return d !== dateStr;
            }
            // If no dateStr provided, remove all of this user's enrollments for this class
            return false;
          })
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

    // RULE 4: Check if the timing overlaps with an existing booked session (double booking)
    const sessionStart = time;
    const sessionEnd = addOneHour(time);

    const isTrainerBooked = ptBookings.some(
      b => b.trainerId === coach.id && matchesDay(b.day, day) && 
        isTimeRangeOverlapping(b.time, addOneHour(b.time), sessionStart, sessionEnd)
    );
    if (isTrainerBooked) {
      alert(`Coach ${coach.name} is already booked on ${day} around this time range (${sessionStart} - ${sessionEnd}). Please select a different time slot.`);
      return false;
    }

    // RULE 5: Check if timing overlaps with a block by trainer
    const isTrainerBlocked = trainerBlocks.some(
      b => b.trainerId === coach.id && matchesDay(b.day, day) &&
        isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), sessionStart, sessionEnd)
    );
    if (isTrainerBlocked) {
      alert(`Coach ${coach.name} has blocked this time slot or is unavailable during this range.`);
      return false;
    }

    // RULE 6: Check if timing overlaps with a gym class coached by trainer
    const isCoachingClass = timetable.some(
      c => c.trainer.toLowerCase() === coach.name.toLowerCase() && matchesDay(c.day, day) && (
        isTimeRangeOverlapping(c.time.split('-')[0], c.time.split('-')[1], sessionStart, sessionEnd)
      )
    );
    if (isCoachingClass) {
      alert(`Coach ${coach.name} is coaching a class at this time and is unavailable.`);
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
  const addTrainerBlock = (trainerId, day, startTime, param3, param4, param5, param6) => {
    // Check if param3 is an end time string (e.g. contains AM/PM)
    const isParam3Time = typeof param3 === 'string' && /AM|PM/i.test(param3);
    
    let endTime, type, label, description;
    if (isParam3Time) {
      endTime = param3;
      type = param4 || 'general_block';
      label = param5 || 'Unavailable';
      description = param6 || '';
    } else {
      endTime = addOneHour(startTime);
      type = param3 || 'general_block';
      label = param4 || 'Unavailable';
      description = param5 || '';
    }

    if (!startTime || !endTime) {
      alert('Start time and End time are required.');
      return false;
    }

    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);
    if (startMins >= endMins) {
      alert('End time must be after start time.');
      return false;
    }

    const coach = trainers.find(t => t.id === trainerId);
    const trainerName = coach?.name || '';

    // Check overlaps with PT bookings
    const hasBooking = ptBookings.some(
      b => b.trainerId === trainerId && matchesDay(b.day, day) &&
        isTimeRangeOverlapping(b.time, addOneHour(b.time), startTime, endTime)
    );
    if (hasBooking) {
      alert('Cannot block a time range that already has a member booking scheduled.');
      return false;
    }

    // Check overlaps with classes
    const hasClass = timetable.some(
      c => c.trainer.toLowerCase() === trainerName.toLowerCase() && matchesDay(c.day, day) &&
        isTimeRangeOverlapping(c.time.split('-')[0], c.time.split('-')[1], startTime, endTime)
    );
    if (hasClass) {
      alert('Cannot block a time range that overlaps with your scheduled gym classes.');
      return false;
    }

    // Check overlaps with existing blocks to avoid duplicate/redundant overlapping blocks
    const alreadyBlocked = trainerBlocks.some(
      b => b.trainerId === trainerId && matchesDay(b.day, day) &&
        isTimeRangeOverlapping(b.startTime || b.time, b.endTime || addOneHour(b.startTime || b.time), startTime, endTime)
    );
    if (alreadyBlocked) {
      alert('This time range overlaps with an existing block.');
      return false;
    }

    const newBlock = {
      id: 'block_' + Date.now(),
      trainerId,
      day,
      time: startTime, // compatibility
      startTime,
      endTime,
      type,
      label,
      description
    };

    setTrainerBlocks(prev => [...prev, newBlock]);
    return true;
  };

  // Trainer function: Remove availability block
  const removeTrainerBlock = (trainerId, day, time) => {
    setTrainerBlocks(prev => prev.filter(
      b => !(b.trainerId === trainerId && matchesDay(b.day, day) && (b.time.toLowerCase() === time.toLowerCase() || (b.startTime && b.startTime.toLowerCase() === time.toLowerCase())))
    ));
  };

  // Trainer function: Add client progress photos
  const addClientProgressPhotos = (memberEmail, date, beforePhoto, afterPhoto, notes) => {
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        const progressPhotos = m.progressPhotos || [];
        const newSet = {
          id: 'set_' + Date.now(),
          date,
          before: beforePhoto,
          after: afterPhoto,
          notes
        };
        return { ...m, progressPhotos: [...progressPhotos, newSet] };
      }
      return m;
    }));
  };

  // Trainer function: Delete client progress photos
  const deleteClientProgressPhotos = (memberEmail, setId) => {
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        const progressPhotos = m.progressPhotos || [];
        return { ...m, progressPhotos: progressPhotos.filter(p => p.id !== setId) };
      }
      return m;
    }));
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
      localStorage.removeItem('bf_v3_supplements');
      localStorage.removeItem('bf_v3_supp_discounts');
      
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
      setSupplements(DEFAULT_SUPPLEMENTS);
      setSupplementDiscounts(DEFAULT_SUPPLEMENT_DISCOUNTS);
      
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
      parseTimeToMinutes,
      parseTimeRange,
      addOneHour,
      isTimeRangeOverlapping,
      matchesDay,
      addClientProgressPhotos,
      deleteClientProgressPhotos,
      addTrainerBlock,
      supplements,
      setSupplements,
      supplementDiscounts,
      setSupplementDiscounts,
      removeTrainerBlock,
      resetToDefault
    }}>
      {children}
    </GymContext.Provider>
  );
};
