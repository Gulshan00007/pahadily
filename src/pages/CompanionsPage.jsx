import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocals } from '../lib/api';

export default function CompanionsPage() {
  const [searchParams] = useSearchParams();
  const { openBooking, openHostApplication, refreshKey } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'companions' | 'trek-guides'
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');
  const [localsList, setLocalsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLocals()
      .then((data) => {
        setLocalsList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn('Could not load companions:', err);
        setLocalsList([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const roleFilters = [
    { id: 'all', label: 'All Verified Guides & Hosts' },
    { id: 'companions', label: '🤝 Native Local Companions' },
    { id: 'trek-guides', label: '🥾 Certified Trek Guides' },
  ];

  const filteredLocals = useMemo(() => {
    return localsList.filter((loc) => {
      // Role filter
      if (selectedRole !== 'all') {
        if (selectedRole === 'trek-guides' && !loc.certified) return false;
        if (selectedRole === 'companions' && loc.certified) return false;
      }

      // Valley filter
      if (selectedValley !== 'all') {
        const reg = String(loc.region || loc.location || '').toLowerCase();
        if (!reg.includes(selectedValley.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesBio = loc.bio?.toLowerCase().includes(q);
        const matchesLoc = loc.location?.toLowerCase().includes(q);
        const matchesTags = loc.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesLoc && !matchesTags) return false;
      }

      return true;
    });
  }, [localsList, selectedRole, selectedValley, searchQuery]);

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section
        style={{
          backgroundColor: '#10251D',
          color: '#F7F5EE',
          padding: '60px 0 48px 0',
          borderBottom: '1px solid rgba(142, 228, 154, 0.15)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: '740px' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#8EE49A',
                fontWeight: 700,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Certified Safeguards • Native Companions
            </span>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px',
                color: '#FFFFFF',
                margin: '0 0 12px 0',
                lineHeight: 1.2,
              }}
            >
              Verified Himalayan Local Companions
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(247, 245, 238, 0.85)', lineHeight: 1.6, margin: 0 }}>
              Connect with native residents and mountaineering-certified guides. Every companion shown here has undergone administrative verification of identity and credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 0 24px' }}>
        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {roleFilters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: selectedRole === tab.id ? '#174D39' : '#FFFFFF',
                  color: selectedRole === tab.id ? '#FFFFFF' : '#10251D',
                  border: selectedRole === tab.id ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedValley}
              onChange={(e) => setSelectedValley(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                backgroundColor: '#FFFFFF',
                fontSize: '13.5px',
                color: '#10251D',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Valleys</option>
              <option value="tirthan">Tirthan Valley</option>
              <option value="jibhi">Jibhi / Banjar</option>
              <option value="parvati">Parvati Valley</option>
              <option value="spiti">Spiti Valley</option>
              <option value="kullu">Kullu Valley</option>
              <option value="kangra">Kangra / Dharamshala</option>
            </select>

            <input
              type="text"
              placeholder="Search by name, valley, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                backgroundColor: '#FFFFFF',
                fontSize: '13.5px',
                width: '260px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
            <p style={{ fontSize: '15px' }}>Loading verified companions...</p>
          </div>
        )}

        {/* Honest Empty State */}
        {!loading && filteredLocals.length === 0 && (
          <div
            style={{
              maxWidth: '640px',
              margin: '20px auto 60px auto',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 32px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              boxShadow: '0 4px 20px rgba(16, 37, 29, 0.04)',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🤝</div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              No local companions are available for this location yet.
            </h2>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              We do not invent companions or use demo accounts. If you live in Himachal Pradesh or hold mountaineering/first-aid certifications, apply to become a verified local companion or guide.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openHostApplication}
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Apply to Become a Local Companion
              </button>
            </div>
          </div>
        )}

        {/* Real Companions Grid */}
        {!loading && filteredLocals.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredLocals.map((loc) => {
              const isCertified = Boolean(loc.certified);
              return (
                <div
                  key={loc.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(16, 37, 29, 0.08)',
                    boxShadow: '0 2px 10px rgba(16, 37, 29, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#EBE7DE',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {loc.image ? (
                        <img src={loc.image} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        '🏔️'
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', margin: '0 0 4px 0' }}>
                        {loc.name}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: '#688575', fontWeight: 600 }}>
                        {loc.location || 'Himachal Pradesh'}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {isCertified ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        🏅 Certified Mountain Guide
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: 'rgba(23, 77, 57, 0.08)',
                          color: '#174D39',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        🤝 Native Local Companion
                      </span>
                    )}
                    {loc.verified && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        ✓ Vetted by Admin
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#536B5E', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                    {loc.bio || 'Native resident ready to escort travelers respectfully across local footpaths.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(16, 37, 29, 0.08)' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#174D39' }}>{loc.price || '₹500'}</span>
                      <span style={{ fontSize: '12px', color: '#688575' }}> {loc.unit || '/day'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openBooking(loc, 'companion')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '9999px',
                        backgroundColor: '#174D39',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Connect & Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
