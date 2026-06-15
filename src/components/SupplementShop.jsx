import React, { useState, useContext, useMemo } from 'react';
import { GymContext } from '../context/GymContext';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All Products', icon: '🛒' },
  { key: 'whey', label: 'Whey Protein', icon: '💪' },
  { key: 'mass', label: 'Mass Gainer', icon: '📦' },
  { key: 'creatine', label: 'Creatine', icon: '⚡' },
  { key: 'iso', label: 'ISO Protein', icon: '🔬' },
  { key: 'bcaa', label: 'BCAA', icon: '🔥' },
  { key: 'eaa', label: 'EAA', icon: '🌊' },
];

export default function SupplementShop({ setActiveSection }) {
  const { supplements, supplementDiscounts, gymSettings, members, currentUser } = useContext(GymContext);

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFlavors, setSelectedFlavors] = useState({});
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Get member profile
  const memberProfile = useMemo(() => {
    if (!currentUser?.email) return null;
    return members.find(m => m.email.toLowerCase() === currentUser.email.toLowerCase());
  }, [members, currentUser]);

  // Determine discount for this member
  const memberDiscount = useMemo(() => {
    if (!memberProfile?.subscription) return supplementDiscounts['default'] || 5;
    // Try exact match first
    if (supplementDiscounts[memberProfile.subscription] !== undefined) {
      return supplementDiscounts[memberProfile.subscription];
    }
    // Try fuzzy match
    const subLower = memberProfile.subscription.toLowerCase();
    for (const [key, val] of Object.entries(supplementDiscounts)) {
      if (key !== 'default' && subLower.includes(key.toLowerCase().substring(0, 12))) {
        return val;
      }
    }
    return supplementDiscounts['default'] || 5;
  }, [memberProfile, supplementDiscounts]);

  // Filter visible products by category
  const visibleSupplements = useMemo(() => {
    return supplements.filter(s => {
      if (!s.visible) return false;
      if (activeCategory === 'all') return true;
      return s.categoryKey === activeCategory;
    });
  }, [supplements, activeCategory]);

  const getDiscountedPrice = (price) => {
    return (price * (1 - memberDiscount / 100)).toFixed(2);
  };

  const getSelectedFlavor = (productId, flavors) => {
    return selectedFlavors[productId] || flavors[0];
  };

  const handleWhatsAppOrder = (product) => {
    const flavor = getSelectedFlavor(product.id, product.flavors);
    const discountedPrice = getDiscountedPrice(product.price);
    const gymPhone = (gymSettings.phone || '+60177099629').replace(/\s+/g, '').replace('+', '');
    const message = encodeURIComponent(
      `Hi! I'd like to order from The Base Fitness Supplement Shop:\n\n` +
      `📦 Product: ${product.name}\n` +
      `🎨 Flavor: ${flavor}\n` +
      `💰 Member Price: RM${discountedPrice} (${memberDiscount}% discount)\n\n` +
      `Member: ${memberProfile?.name || currentUser?.name}\n` +
      `Membership: ${memberProfile?.subscription || 'N/A'}\n\n` +
      `Please confirm availability and payment details. Thank you!`
    );
    window.open(`https://wa.me/${gymPhone}?text=${message}`, '_blank');
  };

  const discountTierColor = () => {
    if (memberDiscount >= 20) return '#f59e0b';
    if (memberDiscount >= 15) return '#a78bfa';
    if (memberDiscount >= 10) return '#34d399';
    return '#60a5fa';
  };

  const discountTierLabel = () => {
    if (memberDiscount >= 20) return '👑 VIP';
    if (memberDiscount >= 15) return '🥇 Premium';
    if (memberDiscount >= 10) return '🥈 Member';
    return '🥉 Basic';
  };

  return (
    <div className="section" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>

        {/* ===== BRAND HERO BANNER ===== */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 40%, #2d0808 70%, #0a0a0a 100%)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          padding: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          flexWrap: 'wrap',
          boxShadow: '0 0 60px rgba(220, 38, 38, 0.15)'
        }}>
          {/* Decorative BG circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                fontSize: '0.7rem',
                fontWeight: '800',
                letterSpacing: '0.15em',
                color: 'white',
                textTransform: 'uppercase'
              }}>
                OFFICIAL DISTRIBUTOR
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>× The Base Fitness</div>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'white',
              margin: 0,
              lineHeight: 1.1
            }}>
              MUTANT<span style={{ color: '#dc2626' }}>®</span> NATION
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0.5rem 0 0', fontSize: '0.95rem', fontStyle: 'italic' }}>
              Born Different. Born Hardcore. — Exclusive member pricing at The Base.
            </p>
          </div>

          {/* Discount Badge */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${discountTierColor()}40`,
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            textAlign: 'center',
            minWidth: '180px',
            boxShadow: `0 0 30px ${discountTierColor()}20`
          }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Your Savings</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: discountTierColor(), lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {memberDiscount}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>OFF all products</div>
            <div style={{
              marginTop: '0.5rem',
              background: `${discountTierColor()}20`,
              borderRadius: '6px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              color: discountTierColor(),
              fontWeight: '700'
            }}>
              {discountTierLabel()} Tier
            </div>
          </div>
        </div>

        {/* ===== MEMBERSHIP INFO BAR ===== */}
        {memberProfile?.subscription && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              💳 <strong style={{ color: 'white' }}>{memberProfile.subscription}</strong> — You save <strong style={{ color: discountTierColor() }}>{memberDiscount}%</strong> on all Mutant® products. The more you train, the more you save!
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Orders fulfilled in-gym via WhatsApp
            </span>
          </div>
        )}

        {/* ===== CATEGORY FILTERS ===== */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '50px',
                border: activeCategory === cat.key ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                background: activeCategory === cat.key ? 'var(--primary-color)' : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat.key ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* ===== PRODUCTS GRID ===== */}
        {visibleSupplements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            No products found in this category.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {visibleSupplements.map(product => {
              const selectedFlavor = getSelectedFlavor(product.id, product.flavors);
              const discountedPrice = getDiscountedPrice(product.price);
              const savings = (product.price - parseFloat(discountedPrice)).toFixed(2);
              const isExpanded = expandedProduct === product.id;

              return (
                <div
                  key={product.id}
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '1px solid rgba(220,38,38,0.35)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(220,38,38,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Discount badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '50px',
                    zIndex: 2,
                    letterSpacing: '0.05em'
                  }}>
                    -{memberDiscount}%
                  </div>

                  {/* Category badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    zIndex: 2,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    {product.category}
                  </div>

                  {/* Product Image */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0505 100%)',
                    height: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '1rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at center, rgba(220,38,38,0.08) 0%, transparent 70%)'
                    }} />
                    <img
                      src={`${import.meta.env.BASE_URL}${product.image}`}
                      alt={product.name}
                      style={{
                        maxHeight: '180px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 1,
                        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Name & Weight */}
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        color: 'white',
                        letterSpacing: '0.02em'
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{product.weight}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>·</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{product.servings} servings</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {product.description}
                    </p>

                    {/* Key Highlights - toggled */}
                    {isExpanded && (
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {product.highlights.map((h, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
                            <span style={{ color: '#dc2626', fontSize: '0.65rem' }}>▶</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-color)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        fontWeight: '600'
                      }}
                    >
                      {isExpanded ? '▲ Show less' : '▼ Key highlights'}
                    </button>

                    {/* Flavor Selector */}
                    {product.flavors.length > 1 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Flavor
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {product.flavors.map(flavor => (
                            <button
                              key={flavor}
                              onClick={() => setSelectedFlavors(prev => ({ ...prev, [product.id]: flavor }))}
                              style={{
                                padding: '0.3rem 0.7rem',
                                borderRadius: '6px',
                                border: selectedFlavor === flavor ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.12)',
                                background: selectedFlavor === flavor ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.04)',
                                color: selectedFlavor === flavor ? 'white' : 'var(--text-secondary)',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                fontWeight: selectedFlavor === flavor ? '600' : '400'
                              }}
                            >
                              {flavor}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Section */}
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '10px',
                      padding: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            color: 'white',
                            fontFamily: 'var(--font-display)'
                          }}>
                            RM{discountedPrice}
                          </span>
                          <span style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'line-through'
                          }}>
                            RM{product.price}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '600', marginTop: '0.1rem' }}>
                          You save RM{savings}
                        </div>
                      </div>
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        background: 'linear-gradient(135deg, #25d366, #1da851)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.02em'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Order via WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== FOOTER INFO ===== */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            🏪 <strong style={{ color: 'white' }}>In-Gym Supplement Shop</strong> — Products are available at The Base Fitness reception.<br />
            Click "Order via WhatsApp" to enquire or reserve your order. Payment is handled in-gym.<br />
            <span style={{ fontSize: '0.72rem' }}>
              Prices shown include your exclusive member discount. MUTANT® is an official brand distributed by The Base Fitness Kluang.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
