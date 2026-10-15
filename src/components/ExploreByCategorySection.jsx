import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories, getDiscoveryStats } from '../lib/api';

export default function ExploreByCategorySection() {
  const { refreshKey } = useAuth();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCategories().catch(() => []),
      getDiscoveryStats().catch(() => null),
    ])
      .then(([cats, discoveryStats]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setStats(discoveryStats);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Genuine category cards: Only categories with real published records in database
  const populatedCategories = categories.filter((cat) => (cat.published_count || 0) > 0);
  const unpopulatedCategories = categories.filter((cat) => (cat.published_count || 0) === 0);

  // Distinct service cards based on real database records
  const serviceCards = [];

  if (stats && stats.approved_companions > 0) {
    serviceCards.push({
      id: 'local-companions-service',
      name: 'Verified Local Companions',
      countLabel: `${stats.approved_companions} Approved ${
        stats.approved_companions === 1 ? 'Local' : 'Locals'
      }`,
      desc: 'Native village residents vetted to guide you through ancient footpaths, sacred temple sanctums, and living folklore.',
      link: '/companions',
      icon: '🤝',
      image: null,
      gradient: 'linear-gradient(135deg, #143D2D 0%, #205540 100%)',
      badge: 'Native Guides',
    });
  }

  if (stats && stats.published_experiences > 0) {
    serviceCards.push({
      id: 'published-experiences-service',
      name: 'Curated Mountain Experiences',
      countLabel: `${stats.published_experiences} Published ${
        stats.published_experiences === 1 ? 'Experience' : 'Experiences'
      }`,
      desc: 'Slow-travel immersive activities, woodfired culinary gatherings, and ridge walks led by mountain natives.',
      link: '/experiences',
      icon: '🥾',
      image: null,
      gradient: 'linear-gradient(135deg, #1F382E 0%, #2A513F 100%)',
      badge: 'Slow Activities',
    });
  }

  if (stats && stats.published_homestays > 0) {
    serviceCards.push({
      id: 'published-homestays-service',
      name: 'Authentic Homestays',
      countLabel: `${stats.published_homestays} Documented ${
        stats.published_homestays === 1 ? 'Homestay' : 'Homestays'
      }`,
      desc: 'Stay with local families in traditional cedar rooms and apple orchard cottages.',
      link: '/stays',
      icon: '🏡',
      image: null,
      gradient: 'linear-gradient(135deg, #2A3E34 0%, #174D39 100%)',
      badge: 'Family Stays',
    });
  }

  const hasAnyGenuineCards = populatedCategories.length > 0 || serviceCards.length > 0;

  return (
    <section style={{ padding: '72px 0', backgroundColor: 'var(--color-bg-ivory, #FAF8F2)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px, 3.5vw, 24px)' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--color-forest-medium, #143D2D)',
                fontWeight: 700,
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Wayfinding & Exploration
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(26px, 3.5vw, 32px)',
                color: 'var(--color-text-main, #0C2017)',
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Explore by Verified Category
            </h2>
          </div>
          <Link
            to="/explore"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-forest-medium, #143D2D)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Explore All Verified Places</span>
            <span>→</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏔️</div>
            <p style={{ fontSize: '14px' }}>Loading verified categories from directory...</p>
          </div>
        )}

        {/* Honest Empty State: Shown if no genuine category records exist in database */}
        {!loading && !hasAnyGenuineCards && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 32px',
              textAlign: 'center',
              maxWidth: '640px',
              margin: '0 auto',
              border: '1px solid rgba(12, 32, 23, 0.08)',
              boxShadow: '0 4px 20px rgba(12, 32, 23, 0.04)',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '14px' }}>🌲</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                color: '#0C2017',
                margin: '0 0 10px 0',
              }}
            >
              Verified Categories in Field Documentation
            </h3>
            <p style={{ fontSize: '14px', color: '#536B5E', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Pahadíly strictly presents admin-vetted locations with verified photographs and authentic coordinates. No placeholder numbers or artificial categories are displayed.
            </p>
            <Link
              to="/explore"
              style={{
                display: 'inline-block',
                padding: '11px 24px',
                borderRadius: '9999px',
                backgroundColor: '#205540',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Open Topographic Directory →
            </Link>
          </div>
        )}

        {/* Genuine Cards Grid */}
        {!loading && hasAnyGenuineCards && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* 1. Destination Categories with genuine published records */}
            {populatedCategories.map((cat) => {
              const placeCount = cat.published_count;
              const countText = `${placeCount} ${placeCount === 1 ? 'Verified Place' : 'Verified Places'}`;

              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${encodeURIComponent(cat.id)}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    boxShadow: '0 2px 8px rgba(10, 37, 27, 0.04)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(32, 85, 64, 0.35)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 27, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: '170px',
                      backgroundColor: '#EBE7DE',
                      overflow: 'hidden',
                    }}
                  >
                    {cat.sample_image ? (
                      <img
                        src={cat.sample_image}
                        alt={cat.sample_location_name || cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '36px',
                          background: 'linear-gradient(135deg, #174D39 0%, #205540 100%)',
                          color: '#FFFFFF',
                        }}
                      >
                        {cat.icon || '🏔️'}
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(12,32,23,0.7) 100%)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(250, 248, 242, 0.95)',
                        color: '#0C2017',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>{cat.icon || '🏔️'}</span>
                      <span>{countText}</span>
                    </span>
                  </div>

                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#205540', fontWeight: 700 }}>
                        Destination Category
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#0C2017',
                        margin: '0 0 6px 0',
                        lineHeight: 1.25,
                      }}
                    >
                      {cat.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#536B5E',
                        lineHeight: 1.5,
                        margin: '0 0 14px 0',
                        flex: 1,
                      }}
                    >
                      {cat.description || 'Verified geographic locations documented by platform administrators.'}
                    </p>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#205540',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderTop: '1px solid rgba(12, 32, 23, 0.06)',
                        paddingTop: '12px',
                      }}
                    >
                      <span>Explore verified locations</span>
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* 2. Real Service Cards (Companions, Experiences, Homestays) */}
            {serviceCards.map((service) => (
              <Link
                key={service.id}
                to={service.link}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                  border: '1px solid rgba(10, 37, 27, 0.08)',
                  boxShadow: '0 2px 8px rgba(10, 37, 27, 0.04)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(32, 85, 64, 0.35)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 27, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: '170px',
                    background: service.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ fontSize: '48px', color: '#FFFFFF' }}>{service.icon}</div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(250, 248, 242, 0.95)',
                      color: '#0C2017',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{service.icon}</span>
                    <span>{service.countLabel}</span>
                  </span>
                </div>

                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#205540', fontWeight: 700 }}>
                      {service.badge}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#0C2017',
                      margin: '0 0 6px 0',
                      lineHeight: 1.25,
                    }}
                  >
                    {service.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#536B5E',
                      lineHeight: 1.5,
                      margin: '0 0 14px 0',
                      flex: 1,
                    }}
                  >
                    {service.desc}
                  </p>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#205540',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderTop: '1px solid rgba(12, 32, 23, 0.06)',
                      paddingTop: '12px',
                    }}
                  >
                    <span>View approved directory</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Directory Breadth: Honest representation of other active categories */}
        {!loading && unpopulatedCategories.length > 0 && (
          <div
            style={{
              marginTop: '32px',
              padding: '16px 20px',
              backgroundColor: '#F3EFE6',
              borderRadius: '12px',
              border: '1px solid rgba(12, 32, 23, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#536B5E' }}>
              <strong style={{ color: '#0C2017' }}>Additional Categories in Governance Directory:</strong>{' '}
              {unpopulatedCategories.map((c) => `${c.icon || '📍'} ${c.name}`).join(' • ')}{' '}
              <span style={{ fontStyle: 'italic', fontSize: '12px' }}>(awaiting verified field documentation)</span>
            </div>
            <Link
              to="/explore"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#205540',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Explore all →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
