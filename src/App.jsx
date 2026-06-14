import React, { useState, useContext } from 'react';
import { GymProvider, GymContext } from './context/GymContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Classes from './components/Classes';
import Pricing from './components/Pricing';
import Trainers from './components/Trainers';
import MemberDashboard from './components/MemberDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import ConfigPanel from './components/ConfigPanel';
import AssessmentWizard from './components/AssessmentWizard';
import './App.css';

function AppContent() {
  const [activeSection, setActiveSection] = useState('home');
  const { currentUser, login, gymSettings, members, setMembers } = useContext(GymContext);

  // Local state for portal login/signup forms
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState('member');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);

  const handlePortalLogin = (e) => {
    e.preventDefault();
    if (!loginEmail) {
      alert('Please enter your email address to log in.');
      return;
    }
    login(loginEmail, loginRole);
    setActiveSection('portal');
  };

  const handlePortalRegister = (e) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      alert('Please fill in all details.');
      return;
    }

    const emailLower = regEmail.toLowerCase();
    const exists = members.some(m => m.email.toLowerCase() === emailLower);
    
    if (exists) {
      alert('This email is already registered. Switching to Sign In page!');
      setIsRegistering(false);
      setLoginEmail(regEmail);
      return;
    }

    // Register new member profile
    const newMember = {
      email: emailLower,
      name: regName,
      subscription: null,
      trainer: null,
      ptSessionsLeft: 0,
      phone: '+60123456789',
      trainingPlan: '',
      mealPlan: ''
    };

    setMembers(prev => [...prev, newMember]);
    login(emailLower, 'member');
    setActiveSection('portal');
    alert(`Account created successfully! Welcome to the gym, ${regName}!`);
  };

  // Render Portal/Dashboard based on user role
  const renderPortal = () => {
    switch (currentUser.role) {
      case 'member':
        return <MemberDashboard setActiveSection={setActiveSection} />;
      case 'trainer':
        return <TrainerDashboard setActiveSection={setActiveSection} />;
      case 'admin':
        return <ConfigPanel setActiveSection={setActiveSection} />;
      default:
        // Guest view of the portal (Sleek login/signup card)
        return (
          <div className="section" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ maxWidth: '480px' }}>
              <div className="card" style={{ padding: '2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                
                {/* Tabs Selector */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                  <button 
                    type="button"
                    style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: 'none', borderBottom: !isRegistering ? '2px solid var(--primary-color)' : 'none', color: !isRegistering ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                    onClick={() => setIsRegistering(false)}
                  >
                    Sign In
                  </button>
                  <button 
                    type="button"
                    style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: 'none', borderBottom: isRegistering ? '2px solid var(--primary-color)' : 'none', color: isRegistering ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                    onClick={() => setIsRegistering(true)}
                  >
                    Create Account
                  </button>
                </div>

                {!isRegistering ? (
                  /* SIGN IN FORM */
                  <form onSubmit={handlePortalLogin}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'white' }}>Welcome Back</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        Enter your credentials to access your dashboard.
                      </p>
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. member@gmail.com" 
                        className="form-control" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Type</label>
                      <select 
                        className="form-control"
                        value={loginRole}
                        onChange={(e) => setLoginRole(e.target.value)}
                      >
                        <option value="member">Gym Member / Fighter</option>
                        <option value="trainer">Personal Trainer / Coach</option>
                        <option value="admin">Gym Manager / Admin</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', fontWeight: '700' }}>
                      Sign In
                    </button>
                  </form>
                ) : (
                  /* SIGN UP / REGISTER FORM */
                  <form onSubmit={handlePortalRegister}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'white' }}>Start Your Journey</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        Register today to start booking classes.
                      </p>
                    </div>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe" 
                        className="form-control" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. johndoe@gmail.com" 
                        className="form-control" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', fontWeight: '700' }}>
                      Create Account
                    </button>
                  </form>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                  💡 <strong>Quick Demo Tip:</strong> You can also use the horizontal simulator bar at the very top of your screen to switch roles instantly!
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const isTrainer = currentUser.role === 'trainer';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar with embedded role simulator */}
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content Areas */}
      <main style={{ flexGrow: 1 }}>
        {isTrainer ? (
          <TrainerDashboard setActiveSection={setActiveSection} />
        ) : (
          <>
            {activeSection === 'home' && (
              <>
                <Hero setActiveSection={setActiveSection} />
                
                {/* Launch Offer Promo Banner */}
                <section className="section" style={{ padding: '3rem 0 0 0' }}>
                  <div className="container">
                    <div style={{
                      background: '#f8fafc',
                      border: '3px solid var(--primary-color)',
                      borderRadius: '1.5rem',
                      padding: '2.5rem 2rem',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                    }}>
                      
                      <span className="badge" style={{ marginBottom: '1rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '800', backgroundColor: 'var(--primary-color)', color: 'white', display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '0.5rem' }}>
                        🚨 Limited Launch Offer
                      </span>
                      
                      <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', color: 'var(--primary-color)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '-0.5px', fontWeight: '800' }}>
                        首 50 位 免会员费!
                      </h2>
                      <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: '#0f172a', marginBottom: '1.25rem', fontWeight: '800' }}>
                        FIRST 50 CUSTOMERS ENJOY <span style={{ color: 'var(--primary-color)' }}>FREE MEMBERSHIP!</span>
                      </h3>
                      
                      <p style={{ color: '#334155', maxWidth: '650px', margin: '0 auto 2rem auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        🔥 <strong style={{ color: '#0f172a' }}>SOMETHING BIG IS COMING TO KLUANG TOWN AREA!</strong><br />
                        Welcome to <strong style={{ color: '#000000' }}>THE BASE FITNESS</strong>—your brand-new premium fitness destination. Be among the first 50 early birds and get your <strong style={{ color: 'var(--primary-color)' }}>Registration/Membership Fee 100% WAIVED</strong>. 
                        First come, first served!
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                        <button 
                          className="btn"
                          onClick={() => setActiveSection('pricing')}
                          style={{ padding: '0.8rem 2rem', fontWeight: '800', borderRadius: '0.75rem', backgroundColor: '#0f172a', color: 'white', border: '1px solid #0f172a', transition: 'var(--transition-smooth)', cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-color)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; e.currentTarget.style.borderColor = '#0f172a'; }}
                        >
                          🎟️ View Membership Deals
                        </button>
                        <a 
                          href="https://www.instagram.com/thebasefitness.kluang/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn" 
                          style={{ padding: '0.8rem 2rem', fontWeight: '700', borderRadius: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', color: '#0f172a', border: '2px solid #0f172a', transition: 'var(--transition-smooth)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0f172a'; }}
                        >
                          📸 Follow Our Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Fitness Assessment Q&A Wizard */}
                <section className="section bg-darker" id="assessment-section" style={{ borderBottom: '1px solid var(--border-color)', padding: '4rem 0' }}>
                  <div className="container text-center">
                    <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Fit Quiz</span>
                    <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', color: 'white', marginBottom: '1.5rem' }}>
                      Find Your Ideal Training & Coach
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem auto', fontSize: '1rem', lineHeight: '1.6' }}>
                      Take our 1-minute fitness questionnaire. Our matching system identifies what training focus, membership package, and coach suits your lifestyle best.
                    </p>
                    <AssessmentWizard setActiveSection={setActiveSection} />
                  </div>
                </section>

                <About />
                <Classes setActiveSection={setActiveSection} isHomepage={true} />
                <Pricing setActiveSection={setActiveSection} />
                <Trainers setActiveSection={setActiveSection} />
              </>
            )}

            {activeSection === 'about' && <About />}

            {activeSection === 'classes' && <Classes setActiveSection={setActiveSection} isHomepage={false} />}

            {activeSection === 'pricing' && <Pricing setActiveSection={setActiveSection} />}

            {activeSection === 'trainers' && <Trainers setActiveSection={setActiveSection} />}

            {activeSection === 'portal' && renderPortal()}
          </>
        )}
      </main>

      {/* Footer Area */}
      {!isTrainer && (
        <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0, height: '55px', marginBottom: '1.25rem' }}>
                <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="The Base Fitness Logo" style={{ height: '55px', width: 'auto', display: 'block' }} />
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '300px' }}>
                Kluang's premier strength conditioning and fitness academy.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a 
                  href="https://www.instagram.com/thebasefitness.kluang/" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'inherit'; }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/TheBaseFitnessKluang" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'inherit'; }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Gym Services</h4>
              <ul className="footer-links">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); setActiveSection('about'); }}>Gym Facilities</a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); setActiveSection('about'); }}>Why Join Us</a></li>
                <li><a href="#classes" onClick={(e) => { e.preventDefault(); setActiveSection('classes'); }}>Group Classes</a></li>
                <li><a href="#trainers" onClick={(e) => { e.preventDefault(); setActiveSection('trainers'); }}>Personal Training</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact & Support</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                📍 {gymSettings.address}<br />
                📞 Phone: {gymSettings.phone}<br />
                ⏰ Hours: {gymSettings.operatingHours}
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} THE BASE FITNESS SDN BHD (1660350-U). All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
              <a href="#home" onClick={(e) => { e.preventDefault(); setActiveSection('home'); }}>Back to Top</a>
            </div>
          </div>
        </div>
      </footer>
      )}

      {/* Floating Demo Role Switcher FAB on Mobile */}
      <button 
        className="fab-btn fab-left" 
        onClick={() => setIsRoleDrawerOpen(true)}
        title="Switch Demo Role"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>

      {/* Demo Role Switcher Bottom Drawer */}
      {isRoleDrawerOpen && (
        <div className="modal-overlay" onClick={() => setIsRoleDrawerOpen(false)} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="drawer-title">Switch Demo Role</h4>
            
            <button className="drawer-item" onClick={() => { login('guest', 'guest'); setIsRoleDrawerOpen(false); setActiveSection('home'); }}>
              👥 Guest (Visitor View)
            </button>
            <button className="drawer-item" onClick={() => { login('member@gmail.com', 'member'); setIsRoleDrawerOpen(false); setActiveSection('portal'); }}>
              🏋️ Member (Subscribed View)
            </button>
            <button className="drawer-item" onClick={() => { login('guest_member@gmail.com', 'member'); setIsRoleDrawerOpen(false); setActiveSection('portal'); }}>
              🆕 Member (No Subscription View)
            </button>
            <button className="drawer-item" onClick={() => { login('t2', 'trainer'); setIsRoleDrawerOpen(false); setActiveSection('portal'); }}>
              🥋 Trainer (Coach Marcus View)
            </button>
            <button className="drawer-item" onClick={() => { login('admin@thebasefitness.com', 'admin'); setIsRoleDrawerOpen(false); setActiveSection('portal'); }}>
              ⚙️ Admin (Manager Settings View)
            </button>

            <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setIsRoleDrawerOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <GymProvider>
      <AppContent />
    </GymProvider>
  );
}
