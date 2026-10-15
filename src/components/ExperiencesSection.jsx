import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExperiences } from '../lib/api';

export default function ExperiencesSection() {
  const { openBooking, openHostApplication, refreshKey } = useAuth();
  const [experiencesList, setExperiencesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getExperiences()
      .then((data) => {
        setExperiencesList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn('Could not load experiences:', err);
        setExperiencesList([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filtered = experiencesList.filter((exp) => {
    if (categoryFilter === 'all') return true;
    return exp.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <section id="experiences" style={{ padding: '80px 0', backgroundColor: '#FAF8F2' }}>
      <div className="section-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
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
            Authentic Himalayan Activities
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
            Curated Local Experiences
          </h2>
          <p style={{ color: '#536B5E', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
            Slow down and immerse yourself in traditional Himalayan culture, wood-fired gastronomy, and untouched nature led by the people who call these mountains home.
          </p>

          {/* Filter Pills: Only shown if experiences exist */}
          {experiencesList.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Experiences' },
                { id: 'nature', label: 'Forest & Rivers' },
                { id: 'culture', label: 'Village & Heritage' },
                { id: 'food', label: 'Siddu & Home Meals' },
                { id: 'adventure', label: 'Ridge Treks' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: categoryFilter === cat.id ? 'var(--color-forest-light, #205540)' : 'var(--color-bg-card, #F3EFE6)',
                    color: categoryFilter === cat.id ? '#FFFFFF' : 'var(--color-text-main, #0C2017)',
                    border: categoryFilter === cat.id ? '1px solid #205540' : '1px solid rgba(10, 37, 27, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🏔️</div>
            <p style={{ fontSize: '15px' }}>Loading verified local experiences...</p>
          </div>
        )}

        {/* Honest Empty State */}
        {!loading && experiencesList.length === 0 && (
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
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🥾</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              Seasonal Himalayan Experiences in Curation
            </h3>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              We are currently onboarding native valley guides and community cooks. Only authentic, vetted experiences led by permanent Himalayan residents will be listed here.
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
                Explore Verified Places →
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
                Apply to Host an Experience
              </button>
            </div>
          </div>
        )}

        {/* Experiences Grid */}
        {!loading && experiencesList.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filtered.map((exp) => (
              <div
                key={exp.id}
                style={{
                  backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                  borderRadius: '14px',
                  overflow: 'hidden',
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
                <div style={{ position: 'relative', height: '200px', backgroundColor: '#EBE7DE', overflow: 'hidden' }}>
                  {exp.image ? (
                    <img
                      src={exp.image}
                      alt={exp.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                      🥾
                    </div>
                  )}
                  {exp.duration && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(10, 37, 27, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#8EE49A',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      ⏱️ {exp.duration}
                    </div>
                  )}
                  {exp.difficulty && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(247, 245, 238, 0.95)',
                        color: '#10251D',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {exp.difficulty}
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: '#174D39', fontWeight: 700, marginBottom: '4px' }}>
                    {exp.guide || 'Local Companion'}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '19px',
                      color: '#10251D',
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {exp.title}
                  </h3>
                  <p style={{ color: '#536B5E', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0', flex: 1 }}>
                    {exp.description}
                  </p>

                  {/* Inclusions */}
                  {Array.isArray(exp.inclusions) && exp.inclusions.length > 0 && (
                    <div
                      style={{
                        backgroundColor: '#FAF8F2',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#2b3f35',
                        marginBottom: '16px',
                      }}
                    >
                      <strong>Includes:</strong> {exp.inclusions.join(' • ')}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(16, 38, 29, 0.08)',
                      marginTop: 'auto',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#174D39' }}>{exp.price}</span>
                      <span style={{ fontSize: '12px', color: '#536B5E' }}> /{exp.unit || 'person'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openBooking(exp, 'experience')}
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
                      Request Experience →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
