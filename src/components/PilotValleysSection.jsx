import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations } from '../lib/api';

export default function PilotValleysSection() {
  const { openDestinationDetail, refreshKey } = useAuth();
  const [locationsList, setLocationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    setLoading(true);
    getLocations({ status: 'published' })
      .then((data) => {
        setLocationsList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn('Could not load published locations:', err);
        setLocationsList([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Extract real tags from genuine locations
  const allTags = ['All'];
  locationsList.forEach((loc) => {
    if (Array.isArray(loc.tags)) {
      loc.tags.forEach((t) => {
        if (t && !allTags.includes(t)) allTags.push(t);
      });
    }
  });

  const filteredLocations = locationsList.filter((loc) => {
    if (selectedTag === 'All') return true;
    return Array.isArray(loc.tags) && loc.tags.includes(selectedTag);
  });

  return (
    <section id="destinations" style={{ padding: '80px 0', backgroundColor: '#FAF8F2' }}>
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
            Verified Destinations • Himachal Pradesh
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
            Featured Himalayan Destinations
          </h2>
          <p style={{ color: '#536B5E', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
            Every place listed here has been verified through our administrative governance framework, documenting genuine cultural sites, river corridors, and sacred settlements.
          </p>

          {/* Filter pills if multiple tags exist */}
          {allTags.length > 2 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: selectedTag === tag ? 'var(--color-forest-light, #205540)' : 'var(--color-bg-card, #F3EFE6)',
                    color: selectedTag === tag ? '#FFFFFF' : 'var(--color-text-main, #0C2017)',
                    border: selectedTag === tag ? '1px solid #205540' : '1px solid rgba(10, 37, 27, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🏔️</div>
            <p style={{ fontSize: '15px' }}>Loading verified destinations...</p>
          </div>
        )}

        {/* Empty State (Explicit requirement: When no genuine data is available, show honest empty state) */}
        {!loading && filteredLocations.length === 0 && (
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
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🏔️</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              We're adding verified places to explore. Check back soon.
            </h3>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              Pahadíly strictly presents admin-vetted locations with real photographs and verified coordinates. No fictional places or placeholder entries are shown.
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
                Explore Verified Places
              </Link>
              <Link
                to="/become-a-local"
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(23, 77, 57, 0.08)',
                  color: '#174D39',
                  border: '1px solid rgba(23, 77, 57, 0.2)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Become a Local Host / Guide
              </Link>
            </div>
          </div>
        )}

        {/* Real Locations Grid */}
        {!loading && filteredLocations.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredLocations.map((loc) => {
              const coverImg = loc.cover_image || (loc.gallery && loc.gallery[0]?.url) || '';
              return (
                <div
                  key={loc.id}
                  style={{
                    backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    boxShadow: '0 2px 10px rgba(10, 37, 27, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(101, 184, 142, 0.45)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 27, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(10, 37, 27, 0.04)';
                  }}
                >
                  {/* Image Banner */}
                  <div style={{ position: 'relative', height: '220px', backgroundColor: '#EBE7DE', overflow: 'hidden' }}>
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={loc.name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#88988E', fontSize: '14px' }}>
                        📷 Verified photos being curated
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(10, 37, 27, 0.8)',
                        backdropFilter: 'blur(4px)',
                        color: '#8EE49A',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {loc.valley || loc.district}
                    </div>
                    {loc.category && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(247, 245, 238, 0.95)',
                          color: '#174D39',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {loc.category.replace(/-/g, ' ')}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#688575', fontWeight: 700, marginBottom: '4px' }}>
                      {loc.village ? `${loc.village}, ${loc.district}` : `${loc.district} District`}
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '22px',
                        color: '#10251D',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {loc.name}
                    </h3>
                    <p style={{ color: '#536B5E', fontSize: '13.5px', lineHeight: 1.55, margin: '0 0 16px 0', flex: 1 }}>
                      {loc.description ? (loc.description.length > 140 ? `${loc.description.slice(0, 140)}...` : loc.description) : 'Verified Himalayan destination.'}
                    </p>

                    {/* Best Time & Safety Information */}
                    {(loc.best_time || loc.difficulty) && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#2b3f35',
                          backgroundColor: '#FAF8F2',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        {loc.best_time && <span>🗓️ {loc.best_time}</span>}
                        {loc.difficulty && <span>🥾 {loc.difficulty}</span>}
                      </div>
                    )}

                    {/* Tags */}
                    {Array.isArray(loc.tags) && loc.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        {loc.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#F3EFE6',
                              color: '#174D39',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => openDestinationDetail(loc)}
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        borderRadius: '9999px',
                        border: '1px solid rgba(23, 77, 57, 0.25)',
                        backgroundColor: 'transparent',
                        color: '#174D39',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#174D39';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#174D39';
                      }}
                    >
                      View Real Gallery & Details →
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
