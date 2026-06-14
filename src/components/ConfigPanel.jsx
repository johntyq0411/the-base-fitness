import React, { useState, useContext } from 'react';
import { GymContext, THEMES } from '../context/GymContext';

export default function ConfigPanel({ setActiveSection }) {
  const { 
    gymSettings, 
    setGymSettings, 
    packages, 
    setPackages, 
    timetable, 
    setTimetable, 
    trainers, 
    resetToDefault,
    members,
    setMembers,
    ptBookings,
    cancelPtBooking,
    assignTrainerToMember,
    logout
  } = useContext(GymContext);

  const [activeTab, setActiveTab] = useState('general');
  const [isTabsDrawerOpen, setIsTabsDrawerOpen] = useState(false);

  // General settings local state
  const [generalForm, setGeneralForm] = useState({ ...gymSettings });

  // Packages local state
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState({ name: '', price: 0, billingPeriod: '', features: '' });

  // Timetable local state (for adding new classes)
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    day: 'Monday',
    time: '06:00 PM - 07:00 PM',
    trainer: trainers[0].name,
    room: 'Studio A',
    capacity: 15
  });

  // Save General settings
  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setGymSettings(generalForm);
    alert('General gym configurations saved successfully!');
  };

  // Select package to edit
  const startEditPackage = (pkg) => {
    setEditingPackageId(pkg.id);
    setPackageForm({
      name: pkg.name,
      price: pkg.price,
      billingPeriod: pkg.billingPeriod,
      features: pkg.features.join(', ')
    });
  };

  // Save package changes
  const handleSavePackage = (e) => {
    e.preventDefault();
    setPackages(prev => prev.map(p => {
      if (p.id === editingPackageId) {
        return {
          ...p,
          name: packageForm.name,
          price: Number(packageForm.price),
          billingPeriod: packageForm.billingPeriod,
          features: packageForm.features.split(',').map(f => f.trim()).filter(Boolean)
        };
      }
      return p;
    }));
    setEditingPackageId(null);
    alert('Package adjusted successfully!');
  };

  // Save new class schedule
  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassForm.name) {
      alert('Please provide a class name.');
      return;
    }
    const newClass = {
      id: 'c_' + Date.now(),
      ...newClassForm,
      capacity: Number(newClassForm.capacity),
      enrolled: []
    };
    setTimetable(prev => [...prev, newClass]);
    setNewClassForm({
      name: '',
      day: 'Monday',
      time: '06:00 PM - 07:00 PM',
      trainer: trainers[0].name,
      room: 'Studio A',
      capacity: 15
    });
    alert('New class added to the timetable schedule!');
  };

  // Delete class from schedule
  const handleDeleteClass = (classId) => {
    if (window.confirm('Delete this class from the schedule timetable?')) {
      setTimetable(prev => prev.filter(c => c.id !== classId));
    }
  };

  // Toggle theme colors
  const handleThemeChange = (themeKey) => {
    setGymSettings(prev => ({ ...prev, theme: themeKey }));
    setGeneralForm(prev => ({ ...prev, theme: themeKey }));
  };

  return (
    <div className="section" style={{ minHeight: '70vh' }}>
      <div className="container">
        
        <div style={{ marginBottom: '3rem' }}>
          <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
            System Administration
          </span>
          <h2>Manager Control Panel</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Easily adjust subscriptions, schedule group classes, modify address details, or swap theme accents. Persists in localStorage.
          </p>
        </div>

        <div className="config-layout">
          
          {/* Config Sidebar */}
          <div className="config-sidebar">
            <button 
              className={`config-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ Gym Profile
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              💰 Pricing Packages
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              📅 Class Timetable
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              👤 Gym Members
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'ptbookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('ptbookings')}
            >
              🤝 All PT Sessions
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              📋 Coach Assignments
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'visuals' ? 'active' : ''}`}
              onClick={() => setActiveTab('visuals')}
            >
              🎨 Theme & Brand
            </button>
            <button 
              className={`config-tab-btn ${activeTab === 'danger' ? 'active' : ''}`}
              onClick={() => setActiveTab('danger')}
              style={{ color: '#ef4444', marginTop: 'auto' }}
            >
              ⚠️ Reset Database
            </button>
            <button 
              className="config-tab-btn"
              onClick={() => { logout(); setActiveSection('home'); }}
              style={{ color: 'var(--text-secondary)' }}
            >
              🚪 Log Out
            </button>
          </div>

          {/* Config Detail Area */}
          <div className="card" style={{ padding: '2.5rem' }}>
            
            {/* GENERAL PROFILE SETTINGS */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Gym Profile Details</h3>
                
                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Gym Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={generalForm.name}
                      onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Contact Phone</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={generalForm.phone}
                      onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={generalForm.email}
                      onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Operating Hours</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={generalForm.operatingHours}
                      onChange={(e) => setGeneralForm({ ...generalForm, operatingHours: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Physical Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={generalForm.address}
                    onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hero Description Intro Text</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={generalForm.description}
                    onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Active Currency Symbol</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={generalForm.currency}
                    onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                    style={{ maxWidth: '100px' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Save Profile Settings
                </button>
              </form>
            )}

            {/* MEMBERSHIP PACKAGES SETTINGS */}
            {activeTab === 'packages' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Membership Packages</h3>
                
                {editingPackageId ? (
                  <form onSubmit={handleSavePackage} style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'var(--bg-dark)' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Editing Package</h4>
                    
                    <div className="form-group">
                      <label>Package Title Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Price ({gymSettings.currency})</label>
                        <input 
                          type="number" 
                          className="form-control"
                          value={packageForm.price}
                          onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Billing Interval Period</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={packageForm.billingPeriod}
                          onChange={(e) => setPackageForm({ ...packageForm, billingPeriod: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Package Features (separated by comma)</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={packageForm.features}
                        onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                        placeholder="e.g. Full gym access, Towel access, locker access"
                        required
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary">Save Package</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingPackageId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="list-table-container">
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Package Name</th>
                          <th>Price</th>
                          <th>Features</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map(p => (
                          <tr key={p.id}>
                            <td data-label="Package Name">
                              <strong>{p.name}</strong>
                              {p.badge && <span className="badge badge-success" style={{ display: 'block', width: 'fit-content', fontSize: '0.6rem', marginTop: '0.2rem' }}>{p.badge}</span>}
                            </td>
                            <td data-label="Price"><strong>{gymSettings.currency} {p.price}</strong>/{p.billingPeriod}</td>
                            <td data-label="Features" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '250px' }}>
                              {p.features.join(', ')}
                            </td>
                            <td data-label="Action">
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                onClick={() => startEditPackage(p)}
                              >
                                Edit Rates
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CLASS TIMETABLE SETTINGS */}
            {activeTab === 'timetable' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Schedule Group Classes</h3>
                
                {/* Form to add a new class */}
                <form onSubmit={handleAddClass} style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'var(--bg-dark)', marginBottom: '2.5rem' }}>
                  <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary-color)' }}>+ Add New Class Slot</h4>
                  
                  <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Class Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Muay Thai Sparring"
                        value={newClassForm.name}
                        onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Select Day</label>
                      <select 
                        className="form-control"
                        value={newClassForm.day}
                        onChange={(e) => setNewClassForm({ ...newClassForm, day: e.target.value })}
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Time Slot Interval</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. 06:30 PM - 08:00 PM"
                        value={newClassForm.time}
                        onChange={(e) => setNewClassForm({ ...newClassForm, time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Assigned Coach / Trainer</label>
                      <select 
                        className="form-control"
                        value={newClassForm.trainer}
                        onChange={(e) => setNewClassForm({ ...newClassForm, trainer: e.target.value })}
                      >
                        {trainers.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Room / Arena Location</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Arena A"
                        value={newClassForm.room}
                        onChange={(e) => setNewClassForm({ ...newClassForm, room: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Capacity Enrolled Limit</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={newClassForm.capacity}
                        onChange={(e) => setNewClassForm({ ...newClassForm, capacity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">Schedule Class</button>
                </form>

                {/* Table of active classes */}
                <h4 style={{ marginBottom: '1rem', color: 'white' }}>Current Scheduled Classes ({timetable.length})</h4>
                <div className="list-table-container">
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Class Details</th>
                        <th>Day & Time</th>
                        <th>Bookings</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map(c => (
                        <tr key={c.id}>
                          <td data-label="Class Details">
                            <strong>{c.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coach: {c.trainer} | Room: {c.room}</span>
                          </td>
                          <td data-label="Day & Time">
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{c.day}</span>
                            <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.2rem' }}>{c.time.split(' - ')[0]}</span>
                          </td>
                          <td data-label="Bookings">
                            <strong>{c.enrolled.length}</strong>/{c.capacity} Members
                          </td>
                          <td data-label="Action">
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => handleDeleteClass(c.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BRANDING VISUALS SETTINGS */}
            {activeTab === 'visuals' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Branding Visual & Styling</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Choose a primary theme accent color. This changes the website buttons, glowing boxes, progress bars, and header links immediately!
                </p>

                <div className="form-group">
                  <label>Select Accent Theme Color</label>
                  <div className="theme-color-picker">
                    {Object.keys(THEMES).map(themeKey => {
                      const theme = THEMES[themeKey];
                      const isActive = gymSettings.theme === themeKey;
                      
                      return (
                        <div 
                          key={themeKey}
                          className={`color-option ${isActive ? 'active' : ''}`}
                          style={{ backgroundColor: theme.primary }}
                          onClick={() => handleThemeChange(themeKey)}
                          title={theme.name}
                        >
                          {isActive && (
                            <svg width="20" height="20" fill="none" stroke="#000000" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                  <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Active Palette Configuration</h4>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accent Variable</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></span>
                        <code>var(--primary-color)</code>
                      </div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accent Dark Variable</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-dark)' }}></span>
                        <code>var(--primary-dark)</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ALL MEMBERS VIEW */}
            {activeTab === 'members' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Active Gym Members</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  A list of all users registered on the gym platform, their current active subscriptions, and assigned personal trainers.
                </p>
                <div className="list-table-container">
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Member Details</th>
                        <th>Active Subscription Plan</th>
                        <th>Assigned Trainer</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m, idx) => (
                        <tr key={idx}>
                          <td data-label="Member Details">
                            <strong>{m.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.email}</span>
                          </td>
                          <td data-label="Plan">
                            {m.subscription ? (
                              <span className="badge badge-success">{m.subscription}</span>
                            ) : (
                              <span className="badge badge-danger">No Subscription</span>
                            )}
                          </td>
                          <td data-label="Trainer">
                            {m.trainer ? (
                              <span>👤 {m.trainer} (Credits: {m.ptSessionsLeft})</span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                            )}
                          </td>
                          <td data-label="Action">
                            {m.subscription ? (
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  if (window.confirm(`Revoke subscription for ${m.name}?`)) {
                                    setMembers(prev => prev.map(member => 
                                      member.email.toLowerCase() === m.email.toLowerCase() 
                                        ? { ...member, subscription: null, trainer: null, ptSessionsLeft: 0 } 
                                        : member
                                    ));
                                  }
                                }}
                              >
                                Revoke Plan
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ALL PT SESSIONS VIEW */}
            {activeTab === 'ptbookings' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>1-on-1 Personal Training Schedule</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  A list of all personal coaching appointments scheduled in the system. As an administrator, you can manage or cancel any booking slot.
                </p>
                {ptBookings.length > 0 ? (
                  <div className="list-table-container">
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Member Info</th>
                          <th>Assigned Coach</th>
                          <th>Scheduled Time</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ptBookings.map(b => (
                          <tr key={b.id}>
                            <td data-label="Member Info">
                              <strong>{b.memberName}</strong>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.memberEmail}</span>
                            </td>
                            <td data-label="Assigned Coach">👤 {b.trainerName}</td>
                            <td data-label="Scheduled Time">
                              <span className="badge badge-primary">{b.day}</span>
                              <strong style={{ marginLeft: '0.5rem' }}>{b.time}</strong>
                            </td>
                            <td data-label="Action">
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                onClick={() => cancelPtBooking(b.id)}
                              >
                                Cancel Session
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>No 1-on-1 personal coaching sessions are currently scheduled.</p>
                  </div>
                )}
              </div>
            )}

            {/* COACH ASSIGNMENTS PANEL */}
            {activeTab === 'assignments' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Manage PT Coach Assignments</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  Members cannot choose their own Personal Trainer. After they subscribe to a VIP/PT plan, manually assign their coach here.
                </p>

                <div className="list-table-container">
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Subscription</th>
                        <th>Assigned PT Coach</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.email}>
                          <td data-label="Member">
                            <strong>{member.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {member.email}
                            </span>
                          </td>
                          <td data-label="Subscription">
                            <span className={`badge ${member.subscription ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.7rem' }}>
                              {member.subscription || 'No Active Plan'}
                            </span>
                          </td>
                          <td data-label="Assigned PT Coach">
                            <select
                              className="form-control"
                              value={member.trainer || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                assignTrainerToMember(member.email, val || null);
                                alert(`Successfully assigned ${val || 'no coach'} to ${member.name}.`);
                              }}
                              style={{ 
                                padding: '0.4rem 0.8rem', 
                                fontSize: '0.9rem', 
                                backgroundColor: 'var(--bg-card)', 
                                border: member.trainer === 'Pending Assignment' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                color: member.trainer === 'Pending Assignment' ? 'var(--primary-color)' : 'white',
                                fontWeight: member.trainer === 'Pending Assignment' ? '700' : 'normal'
                              }}
                            >
                              <option value="">-- No Coach (Standard/Inactive) --</option>
                              <option value="Pending Assignment" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>⚠️ Pending Assignment</option>
                              {trainers.map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DANGER ZONE SETTINGS */}
            {activeTab === 'danger' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h3 style={{ color: '#ef4444', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Reset Gym Environment</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
                  This will wipe all local modifications (e.g. customized packages, booked slots, address adjustments, and member data) and seed the default configuration for The Base Fitness.
                </p>
                <button 
                  className="btn btn-danger"
                  style={{ padding: '1rem 2rem', fontWeight: '700' }}
                  onClick={resetToDefault}
                >
                  Factory Reset Site Variables
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Floating Config Sidebar Menu FAB on Mobile */}
      <button 
        className="fab-btn fab-right" 
        onClick={() => setIsTabsDrawerOpen(true)}
        title="Config Menu Tabs"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Admin Config Tabs Drawer */}
      {isTabsDrawerOpen && (
        <div className="modal-overlay" onClick={() => setIsTabsDrawerOpen(false)} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="drawer-title">Config Management</h4>
            
            <button className={`drawer-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => { setActiveTab('general'); setIsTabsDrawerOpen(false); }}>
              ⚙️ Gym Profile
            </button>
            <button className={`drawer-item ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => { setActiveTab('packages'); setIsTabsDrawerOpen(false); }}>
              💰 Pricing Packages
            </button>
            <button className={`drawer-item ${activeTab === 'timetable' ? 'active' : ''}`} onClick={() => { setActiveTab('timetable'); setIsTabsDrawerOpen(false); }}>
              📅 Class Timetable
            </button>
            <button className={`drawer-item ${activeTab === 'members' ? 'active' : ''}`} onClick={() => { setActiveTab('members'); setIsTabsDrawerOpen(false); }}>
              👤 Gym Members
            </button>
            <button className={`drawer-item ${activeTab === 'ptbookings' ? 'active' : ''}`} onClick={() => { setActiveTab('ptbookings'); setIsTabsDrawerOpen(false); }}>
              🤝 All PT Sessions
            </button>
            <button className={`drawer-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => { setActiveTab('assignments'); setIsTabsDrawerOpen(false); }}>
              📋 Coach Assignments
            </button>
            <button className={`drawer-item ${activeTab === 'visuals' ? 'active' : ''}`} onClick={() => { setActiveTab('visuals'); setIsTabsDrawerOpen(false); }}>
              🎨 Theme & Brand
            </button>
            <button className={`drawer-item ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => { setActiveTab('danger'); setIsTabsDrawerOpen(false); }} style={{ color: '#ef4444' }}>
              ⚠️ Reset Database
            </button>
            <button className="drawer-item" onClick={() => { logout(); setActiveSection('home'); setIsTabsDrawerOpen(false); }} style={{ color: 'var(--text-secondary)' }}>
              🚪 Log Out
            </button>

            <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setIsTabsDrawerOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
