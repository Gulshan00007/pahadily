import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VERIFIED_LOCALS } from '../data/localsData';
import { useAuth } from '../context/AuthContext';

export default function CompanionsPage() {
  const [searchParams] = useSearchParams();
  const { openBooking, openHostApplication } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'companions' | 'trek-guides' | 'food-hosts'
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');

  const roleFilters = [
    { id: 'all', label: 'All Local Guides & Hosts' },
    { id: 'companions', label: '🤝 Local Companions' },
    { id: 'trek-guides', label: '🥾 Certified Trek Guides' },
    { id: 'food-hosts', label: '🍲 Food & Farm Hosts' },
  ];

  const valleyFilters = [
    { id: 'all', label: 'All Valleys' },
    { id: 'jibhi', label: 'Jibhi & Banjar' },
    { id: 'tirthan', label: 'Tirthan Valley' },
    { id: 'kullu', label: 'Kullu & Naggar' },
    { id: 'shangarh', label: 'Shangarh & Sainj' },
    { id: 'kasol', label: 'Parvati Valley' },
  ];

  const filteredLocals = useMemo(() => {
    return VERIFIED_LOCALS.filter((loc) => {
      // Role filter
      if (selectedRole !== 'all') {
        if (loc.category !== selectedRole) return false;
      }

      // Valley filter
      if (selectedValley !== 'all') {
        if (loc.region !== selectedValley) return false;
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
  }, [selectedRole, selectedValley, searchQuery]);

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
              Native Himalayan Mountain Guides
            </span>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px, 6vw, 38px)',
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                lineHeight: 1.15,
              }}
            >
              Himalayan Local Companions
            </h1>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(247, 245, 238, 0.85)',
                margin: '0 0 24px 0',
              }}
            >
              Travel with people who grew up along these cedar ridges. Fixed, fair daily honorariums go directly to native companions with zero middleman commissions.
            </p>

            <button
              type="button"
              onClick={openHostApplication}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(142, 228, 154, 0.15)',
                border: '1px solid #8EE49A',
                color: '#8EE49A',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>🌲 Are you a Himachal local? Join our verified network →</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Strip */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
          padding: '20px 0',
          position: 'sticky',
          top: '76px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(16, 37, 29, 0.03)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          {/* Top Row: Search & Valley Filter */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F7F5EE',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                borderRadius: '9999px',
                padding: '6px 14px',
                width: '100%',
                maxWidth: '380px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#174D39" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, valley, specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '6px 10px',
                  fontSize: '13.5px',
                  color: '#10251D',
                  outline: 'none',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#536B5E' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Valley Filter Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#536B5E', fontWeight: 600 }}>Valley:</span>
              <select
                value={selectedValley}
                onChange={(e) => setSelectedValley(e.target.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#F7F5EE',
                  border: '1px solid rgba(16, 37, 29, 0.15)',
                  color: '#10251D',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {valleyFilters.map((vf) => (
                  <option key={vf.id} value={vf.id}>
                    {vf.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {roleFilters.map((rf) => {
              const active = selectedRole === rf.id;
              return (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setSelectedRole(rf.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? '#174D39' : 'transparent',
                    color: active ? '#FFFFFF' : '#10251D',
                    border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {rf.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid of Verified Locals */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', color: '#536B5E', fontWeight: 600 }}>
            Showing <strong>{filteredLocals.length}</strong> Verified Mountain Companions
          </div>
          {(selectedRole !== 'all' || selectedValley !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRole('all');
                setSelectedValley('all');
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#174D39',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '24px',
          }}
        >
          {filteredLocals.map((local) => {
            const avatarFallback = local.name.split(' ').map((n) => n[0]).join('');

            return (
              <article
                key={local.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid rgba(16, 37, 29, 0.08)',
                  boxShadow: '0 6px 24px rgba(16, 37, 29, 0.04)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 32px rgba(16, 37, 29, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 37, 29, 0.04)';
                }}
              >
                {/* Header: Avatar, Name, Location */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: local.gradient || 'linear-gradient(135deg, #174D39, #2f725a)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(23, 77, 57, 0.2)',
                    }}
                  >
                    {avatarFallback}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '20px',
                          color: '#10251D',
                          margin: 0,
                          fontWeight: 700,
                        }}
                      >
                        {local.name}
                      </h3>
                      <span
                        style={{
                          backgroundColor: 'rgba(23, 77, 57, 0.1)',
                          color: '#174D39',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '9999px',
                        }}
                      >
                        ✓ Verified
                      </span>
                      {local.certified && (
                        <span
                          style={{
                            backgroundColor: 'rgba(142, 228, 154, 0.25)',
                            color: '#10251D',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '9999px',
                          }}
                        >
                          🎖️ Certified
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '13px', color: '#536B5E', marginTop: '2px' }}>
                      📍 {local.location}
                    </div>

                    <div style={{ fontSize: '12px', color: '#174D39', fontWeight: 600, marginTop: '2px' }}>
                      {local.role}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p
                  style={{
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    color: '#1e362c',
                    margin: '0 0 16px 0',
                    flex: 1,
                  }}
                >
                  {local.bio}
                </p>

                {/* Spoken languages */}
                <div style={{ fontSize: '12px', color: '#536B5E', marginBottom: '14px' }}>
                  🗣️ <strong>Languages:</strong> {local.lang}
                </div>

                {/* Tags / Specialties */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {local.tags?.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#F7F5EE',
                        color: '#174D39',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Footer: Price & Booking Action */}
                <div
                  style={{
                    borderTop: '1px solid rgba(16, 37, 29, 0.08)',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '19px', fontWeight: 800, color: '#174D39', lineHeight: 1 }}>
                      {local.price}
                    </div>
                    <div style={{ fontSize: '11px', color: '#536B5E' }}>
                      {local.unit} honorarium
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBooking(local, 'local')}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '9999px',
                      backgroundColor: '#174D39',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(23, 77, 57, 0.22)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#10251D')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#174D39')}
                  >
                    Book Companion →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
