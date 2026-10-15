import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocals } from '../lib/api';

export default function LocalCompanionsSection() {
  const { openBooking, openHostApplication, refreshKey } = useAuth();
  const [localsList, setLocalsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLocals()
      .then((data) => {
        setLocalsList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn('Could not load local companions:', err);
        setLocalsList([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <section id="locals" style={{ padding: '80px 0', backgroundColor: '#F3EFE6' }}>
      <div className="section-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#174D39',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '8px',
            }}
          >
            Real People • Himalayan Companions
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '36px',
              color: '#10251D',
              margin: '0 0 14px 0',
              lineHeight: 1.2,
            }}
          >
            Meet Your Local Companions
          </h2>
          <p style={{ color: '#536B5E', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
            Pahadíly local companions are not commercial tour operators. They are native village residents who open up secret footpaths, share home-cooked meals, and help you navigate the valley with deep cultural respect.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🤝</div>
            <p style={{ fontSize: '15px' }}>Loading approved local companions...</p>
          </div>
        )}

        {/* Honest Empty State */}
        {!loading && localsList.length === 0 && (
          <div
            style={{
              maxWidth: '620px',
              margin: '0 auto',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 32px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              boxShadow: '0 4px 20px rgba(16, 37, 29, 0.04)',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🤝</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              Native Companion Profiles in Verification
            </h3>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              We carefully audit the local background and trail knowledge of every applicant before approving public profiles. No mock guide listings or stock personas are shown.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/explore"
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Explore Destinations →
              </Link>
              <button
                type="button"
                onClick={openHostApplication}
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(23, 77, 57, 0.08)',
                  color: '#174D39',
                  border: '1px solid rgba(23, 77, 57, 0.2)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Apply as Local Companion
              </button>
            </div>
          </div>
        )}

        {/* Companions Grid */}
        {!loading && localsList.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {localsList.map((loc) => {
              const initials = (loc.name || 'Local')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={loc.id}
                  style={{
                    backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                    borderRadius: '14px',
                    padding: '24px',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    boxShadow: '0 2px 8px rgba(10, 37, 27, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(101, 184, 142, 0.45)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(10, 37, 27, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
                  }}
                >
                  {/* Header profile info */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#174D39',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid #8EE49A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {loc.image ? (
                        <img
                          src={loc.image}
                          alt={loc.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <span style={{ color: '#8EE49A', fontWeight: 700, fontSize: '20px' }}>
                          {initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '19px', color: '#10251D', fontWeight: 700 }}>
                          {loc.name}
                        </h3>
                        {loc.verified && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: 'rgba(23, 77, 57, 0.12)',
                              color: '#174D39',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontWeight: 700,
                            }}
                          >
                            ✓ Verified Native
                          </span>
                        )}
                        {loc.certified && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: 'rgba(32, 85, 64, 0.15)',
                              color: '#205540',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontWeight: 700,
                            }}
                          >
                            Certified Guide
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#536B5E', marginTop: '3px' }}>
                        📍 {loc.location}
                      </div>
                      {loc.lang && (
                        <div style={{ fontSize: '12px', color: '#174D39', fontWeight: 600, marginTop: '2px' }}>
                          🗣️ Speaks {loc.lang}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {loc.bio && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#2b3f35',
                        lineHeight: 1.5,
                        margin: '0 0 16px 0',
                        flex: 1,
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;{loc.bio}&rdquo;
                    </p>
                  )}

                  {/* Specialty tags */}
                  {Array.isArray(loc.tags) && loc.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                      {loc.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#174D39',
                            border: '1px solid rgba(16, 38, 29, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid rgba(16, 38, 29, 0.08)',
                      marginTop: 'auto',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#174D39' }}>
                        {loc.price || 'Direct honorarium'}
                        {loc.price && (
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#536B5E' }}> {loc.unit || '/day'}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#536B5E' }}>Direct to local family</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openBooking(loc, 'local')}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-forest-light, #205540)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-forest-dark, #0A251B)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-forest-light, #205540)'; }}
                    >
                      Request Companion →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
