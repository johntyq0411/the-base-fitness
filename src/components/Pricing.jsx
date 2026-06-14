import React, { useContext } from 'react';
import { GymContext } from '../context/GymContext';

export default function Pricing({ setActiveSection }) {
  const { packages, subscribeToPackage, currentUser, gymSettings, members } = useContext(GymContext);

  const handleSubscribe = (pkgId) => {
    if (currentUser.role === 'guest') {
      alert('Please log in as a Member first to subscribe. Use the Simulator Bar at the top of the page!');
      setActiveSection('portal');
      return;
    }
    const success = subscribeToPackage(pkgId);
    if (success) {
      setActiveSection('portal');
    }
  };

  const getMemberSubName = () => {
    if (currentUser.role !== 'member') return null;
    const match = members.find(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
    return match ? match.subscription : null;
  };

  const activeSubscription = getMemberSubName();

  return (
    <section className="section" id="pricing">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
            Flexible Rates
          </span>
          <h2>Membership Packages</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            Choose a pass that suits your training goals. No hidden sign-up fees. Toggle administrative configs to adjust pricing any time.
          </p>
        </div>

        <div className="grid-3">
          {packages.map((pkg) => {
            const isCurrent = activeSubscription === pkg.name;

            return (
              <div 
                key={pkg.id} 
                className={`card pricing-card ${pkg.isPopular ? 'popular' : ''}`}
              >
                {pkg.badge && (
                  <span className="card-badge">{pkg.badge}</span>
                )}
                
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', paddingRight: '4rem' }}>
                  {pkg.name}
                </h3>
                
                <div className="price-box">
                  <span className="price-currency">{gymSettings.currency}</span>
                  <span className="price-val">{pkg.price}</span>
                  <span className="price-period">/{pkg.billingPeriod}</span>
                </div>

                <ul className="features-list">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {currentUser.role === 'admin' || currentUser.role === 'trainer' ? (
                  <button 
                    className="btn btn-secondary" 
                    disabled 
                    style={{ width: '100%', cursor: 'not-allowed' }}
                  >
                    View Mode Only
                  </button>
                ) : (
                  <button
                    className={`btn ${pkg.isPopular ? 'btn-primary' : 'btn-secondary'} ${isCurrent ? 'btn-success' : ''}`}
                    style={{ width: '100%' }}
                    onClick={() => handleSubscribe(pkg.id)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{marginRight: '0.3rem'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Current Plan
                      </>
                    ) : (
                      'Choose Plan'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
