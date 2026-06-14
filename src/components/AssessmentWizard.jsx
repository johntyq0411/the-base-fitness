import React, { useState, useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function AssessmentWizard({ setActiveSection }) {
  const { trainers, packages, currentUser, members, setMembers } = useContext(GymContext);
  const [step, setStep] = useState(0); // 0: intro, 1-4: questions, 5: result
  
  // Quiz states
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [frequency, setFrequency] = useState('');
  const [healthNotes, setHealthNotes] = useState('');

  // Result state
  const [result, setResult] = useState(null);

  const resetQuiz = () => {
    setGoal('');
    setExperience('');
    setFrequency('');
    setHealthNotes('');
    setStep(0);
    setResult(null);
  };

  const handleNext = () => {
    if (step === 1 && !goal) {
      alert('Please select a goal to proceed.');
      return;
    }
    if (step === 2 && !experience) {
      alert('Please select your experience level to proceed.');
      return;
    }
    if (step === 3 && !frequency) {
      alert('Please select your target training frequency.');
      return;
    }
    if (step === 4 && !healthNotes) {
      alert('Please select your health focus.');
      return;
    }

    if (step === 4) {
      calculateRecommendation();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const calculateRecommendation = () => {
    // 1. Identify Coach
    let recommendedCoach = null;
    let coachReason = '';

    if (goal === 'muay_thai') {
      recommendedCoach = trainers.find(t => t.id === 't1') || trainers[0]; // Coach Alex Tan
      coachReason = 'Coach Alex Tan is a former regional Muay Thai champion. Since you want to learn fighting techniques, pad work, and sparring, his expertise makes him the perfect match.';
    } else if (goal === 'strength' || healthNotes === 'joints') {
      recommendedCoach = trainers.find(t => t.id === 't2') || trainers[1]; // Coach Marcus Lim
      coachReason = 'Coach Marcus Lim is our certified strength conditioning specialist. Since you are focusing on raw strength, powerlifting, or require joint/posture care, Marcus will program safe lifts and hit PRs.';
    } else {
      recommendedCoach = trainers.find(t => t.id === 't3') || trainers[2]; // Coach Sarah Wong
      coachReason = 'Coach Sarah Wong specializes in weight loss, HIIT workouts, and yoga. Her holistic nutrition coaching and cardiovascular conditioning programs align perfectly with your wellness goals.';
    }

    // 2. Identify Package
    let recommendedPkg = null;
    let pkgReason = '';

    if (goal === 'muay_thai' && frequency !== 'low') {
      recommendedPkg = packages.find(p => p.id === 'p3') || packages[2]; // Fighter Pass
      pkgReason = 'The Muay Thai & Functional Class Pack (Fighter Pass) gives you unlimited access to bags, pads, sparring classes, and the general gym floor.';
    } else if (experience === 'beginner' && (frequency === 'high' || frequency === 'medium')) {
      recommendedPkg = packages.find(p => p.id === 'p4') || packages[3]; // VIP Elite
      pkgReason = 'As a beginner training 3+ times a week, the VIP Personal Coaching Elite is highly recommended. It includes 8 monthly 1-on-1 sessions with an assigned trainer to lock down your form and prevent injuries.';
    } else if (frequency === 'low') {
      recommendedPkg = packages.find(p => p.id === 'p1') || packages[0]; // Day Pass
      pkgReason = 'Since you plan to train occasionally (1-2 times/week), starting with Day Passes or individual entries is the most cost-effective way to get started.';
    } else {
      recommendedPkg = packages.find(p => p.id === 'p2') || packages[1]; // All-Access Monthly
      pkgReason = 'The All-Access Monthly Membership gives you unlimited gym floor access to weights and cardio zones, towels, lockers, and 1 free coach assessment.';
    }

    setResult({
      coach: recommendedCoach,
      coachReason,
      pkg: recommendedPkg,
      pkgReason
    });
    setStep(5);
  };

  const handleApplyRecommendation = () => {
    if (currentUser.role === 'guest') {
      alert('Please register an account or sign in as a member first to purchase this package!');
      setActiveSection('portal');
      return;
    }
    
    // Subscribe to recommended package but set trainer to Pending Assignment
    // (admin must manually assign)
    setMembers(prev => prev.map(m => {
      if (m.email.toLowerCase() === currentUser.email.toLowerCase()) {
        const isCoachingPkg = result.pkg.id === 'p4';
        return {
          ...m,
          subscription: result.pkg.name,
          trainer: isCoachingPkg ? 'Pending Assignment' : null,
          ptSessionsLeft: isCoachingPkg ? 8 : 0
        };
      }
      return m;
    }));

    if (result.pkg.id === 'p4') {
      alert(`Successfully subscribed to ${result.pkg.name}! Your coach assignment is pending admin approval.`);
    } else {
      alert(`Successfully subscribed to ${result.pkg.name}!`);
    }
    setActiveSection('portal');
  };

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '2rem auto', padding: '2.5rem', boxShadow: '0 8px 32px var(--shadow-color)' }}>
      {/* Intro Step */}
      {step === 0 && (
        <div style={{ textAlign: 'center' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Fitness Quiz</span>
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'white', marginBottom: '1rem' }}>
            Find Your Training Path
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Take this quick 1-minute assessment questionnaire. Our system will analyze your goals, experience, and health needs to suggest the most suitable membership plan and personal coach.
          </p>
          <button className="btn btn-primary" onClick={() => setStep(1)} style={{ padding: '0.8rem 2.5rem' }}>
            Start Assessment
          </button>
        </div>
      )}

      {/* Question 1: Goal */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
            <span>Question 1 of 4</span>
            <span style={{ color: 'var(--primary-color)' }}>25% Complete</span>
          </div>
          <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>What is your primary fitness goal?</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className={`card ${goal === 'strength' ? 'active' : ''}`} 
              onClick={() => setGoal('strength')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: goal === 'strength' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: goal === 'strength' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🏋️ Build Raw Strength & Power</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Focus on heavy lifts, compound movements, bodybuilding, or PR improvement.
              </span>
            </div>
            
            <div 
              className={`card ${goal === 'weight_loss' ? 'active' : ''}`} 
              onClick={() => setGoal('weight_loss')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: goal === 'weight_loss' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: goal === 'weight_loss' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🔥 Fat Burn, HIIT & Cardiovascular Stamina</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Torch calories, increase metabolic rate, build flexibility, and tone muscles.
              </span>
            </div>
            
            <div 
              className={`card ${goal === 'muay_thai' ? 'active' : ''}`} 
              onClick={() => setGoal('muay_thai')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: goal === 'muay_thai' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: goal === 'muay_thai' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🥊 Muay Thai Boxing & Martial Arts</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Master combinations, pad work, sparring drills, and tactical combat conditioning.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Next Question</button>
          </div>
        </div>
      )}

      {/* Question 2: Experience */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
            <span>Question 2 of 4</span>
            <span style={{ color: 'var(--primary-color)' }}>50% Complete</span>
          </div>
          <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>What is your current training experience?</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className={`card ${experience === 'beginner' ? 'active' : ''}`} 
              onClick={() => setExperience('beginner')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: experience === 'beginner' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: experience === 'beginner' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🌱 Beginner</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                New to gym floors or martial arts. Need guidance on form, breathing, and routines.
              </span>
            </div>
            
            <div 
              className={`card ${experience === 'intermediate' ? 'active' : ''}`} 
              onClick={() => setExperience('intermediate')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: experience === 'intermediate' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: experience === 'intermediate' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>⚡ Intermediate</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Familiar with free weights, cardio machines, or basic kicks. Train consistently.
              </span>
            </div>
            
            <div 
              className={`card ${experience === 'advanced' ? 'active' : ''}`} 
              onClick={() => setExperience('advanced')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: experience === 'advanced' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: experience === 'advanced' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🔥 Advanced / Athlete</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Heavy lifter, competitor, or combat fighter. Seeking advanced programming and sparring.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Next Question</button>
          </div>
        </div>
      )}

      {/* Question 3: Frequency */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
            <span>Question 3 of 4</span>
            <span style={{ color: 'var(--primary-color)' }}>75% Complete</span>
          </div>
          <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>How often do you plan to train per week?</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className={`card ${frequency === 'low' ? 'active' : ''}`} 
              onClick={() => setFrequency('low')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: frequency === 'low' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: frequency === 'low' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>📅 1 to 2 times a week</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Fit workouts around a busy schedule or cross-training on weekends.
              </span>
            </div>
            
            <div 
              className={`card ${frequency === 'medium' ? 'active' : ''}`} 
              onClick={() => setFrequency('medium')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: frequency === 'medium' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: frequency === 'medium' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>📅 3 to 4 times a week</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Consistent split program or regular class attendance for steady results.
              </span>
            </div>
            
            <div 
              className={`card ${frequency === 'high' ? 'active' : ''}`} 
              onClick={() => setFrequency('high')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: frequency === 'high' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: frequency === 'high' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>📅 5+ times a week</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Highly dedicated fitness lifestyle or intensive combat fight camp prep.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Next Question</button>
          </div>
        </div>
      )}

      {/* Question 4: Health Notes */}
      {step === 4 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
            <span>Question 4 of 4</span>
            <span style={{ color: 'var(--primary-color)' }}>100% Complete</span>
          </div>
          <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>Do you have any specific health/body focus?</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className={`card ${healthNotes === 'none' ? 'active' : ''}`} 
              onClick={() => setHealthNotes('none')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: healthNotes === 'none' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: healthNotes === 'none' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>💪 None / General Fitness</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                No active injuries or major health restrictions. Ready for high intensity.
              </span>
            </div>
            
            <div 
              className={`card ${healthNotes === 'joints' ? 'active' : ''}`} 
              onClick={() => setHealthNotes('joints')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: healthNotes === 'joints' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: healthNotes === 'joints' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🩹 Joint Care, Posture & Recovery</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Need modifications for lower back issues, knee pain, shoulder tightness, or recovery.
              </span>
            </div>
            
            <div 
              className={`card ${healthNotes === 'cardio' ? 'active' : ''}`} 
              onClick={() => setHealthNotes('cardio')}
              style={{ padding: '1.25rem', cursor: 'pointer', border: healthNotes === 'cardio' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: healthNotes === 'cardio' ? 'var(--primary-glow)' : 'var(--bg-dark)' }}
            >
              <strong>🫁 Cardio, Breathing & Stamina</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Focus heavily on metabolic health, heart strength, lung capacity, and general endurance.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Get Recommendation</button>
          </div>
        </div>
      )}

      {/* Step 5: Result Screen */}
      {step === 5 && result && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-success" style={{ marginBottom: '1rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>Assessment Complete</span>
            <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'white' }}>Your Tailored Training Path</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Based on your goals and fitness profile, we recommend the following plan.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Recommended package */}
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Recommended Plan
              </span>
              <h4 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '0.5rem' }}>{result.pkg.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.pkgReason}</p>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Price:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>RM {result.pkg.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '400' }}>/{result.pkg.billingPeriod}</span></strong>
              </div>
            </div>

            {/* Recommended trainer */}
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Recommended Coach (For Gym Sessions)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <img 
                  src={`${import.meta.env.BASE_URL}${result.coach.photo}`} 
                  alt={result.coach.name} 
                  style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
                  onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}hero.png`; }}
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'white' }}>{result.coach.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🏆 Specialties: {result.coach.specialties.slice(0, 2).join(', ')}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.coachReason}</p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                *Note: Coach assignment requires admin review after subscription activation.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleApplyRecommendation} style={{ width: '100%', padding: '0.8rem 1.8rem', fontWeight: '700' }}>
              🎯 Apply Recommendation & Sub
            </button>
            <button className="btn btn-secondary" onClick={resetQuiz} style={{ width: '100%' }}>
              🔄 Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
