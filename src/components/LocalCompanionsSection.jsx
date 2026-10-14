import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLocals } from '../lib/api';

const DEFAULT_LOCALS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Shoja & Jibhi, Kullu',
    role: 'Local Companion & Nature Escort',
    lang: 'Hindi, English, Pahadi',
    rating: 4.9,
    reviews: 82,
    price: '₹500',
    unit: '/day',
    tags: ['Waterfall Nooks', 'Jalori Ridge', 'Cedar Trails'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    verified: true,
    bio: 'Born in Shoja near Jalori Pass, Rahul has guided wanderers through ancient cedar forests, Chehni fortress, and waterfall alcoves for over 7 years.',
  },
  {
    id: 2,
    name: 'Sonia Negi',
    location: 'Gushaini, Tirthan Valley',
    role: 'Local Companion & Cultural Host',
    lang: 'Hindi, English, Pahadi',
    rating: 4.9,
    reviews: 48,
    price: '₹450',
    unit: '/day',
    tags: ['Organic Farming', 'River Trails', 'Kath-Kuni Craft'],
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    verified: true,
    bio: 'Sonia introduces mindful wanderers to organic apple orchards, glacial trout river walks, and centuries-old Kath-Kuni wooden architecture in Gushaini.',
  },
  {
    id: 3,
    name: 'Vikram Thakur',
    location: 'Naggar & Kullu',
    role: 'Heritage & High Ridge Guide',
    lang: 'Hindi, English, Kullvi',
    rating: 4.8,
    reviews: 36,
    price: '₹600',
    unit: '/day',
    tags: ['Naggar Castle', 'Woodcarving', 'Jana Falls Ridge'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    verified: true,
    bio: 'Native to the royal hamlet of Naggar, Vikram is steeped in centuries of folklore, pagoda wood carving traditions, and secret ridge lookouts.',
  },
];

export default function LocalCompanionsSection() {
  const { openBooking, refreshKey } = useAuth();
  const [localsList, setLocalsList] = useState(DEFAULT_LOCALS);

  useEffect(() => {
    getLocals()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLocalsList(data);
        }
      })
      .catch((err) => console.warn('Using local companions fallback:', err));
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

        {/* Companions Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {localsList.map((loc) => (
            <div
              key={loc.id}
              style={{
                backgroundColor: '#FAF8F2',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(16, 38, 29, 0.1)',
                boxShadow: '0 8px 24px rgba(10, 37, 27, 0.04)',
                display: 'flex',
                flexDirection: 'column',
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
                  }}
                >
                  <img
                    src={loc.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={loc.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        ✓ Verified Local
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#536B5E', marginTop: '2px' }}>
                    📍 {loc.location}
                  </div>
                  <div style={{ fontSize: '12px', color: '#174D39', fontWeight: 600, marginTop: '2px' }}>
                    🗣️ Speaks {loc.lang}
                  </div>
                </div>
              </div>

              {/* Bio */}
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
                "{loc.bio}"
              </p>

              {/* Specialty tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {(loc.tags || []).map((t) => (
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
                    {loc.price}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#536B5E' }}> {loc.unit || '/day'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#536B5E' }}>Direct to local family</div>
                </div>

                <button
                  type="button"
                  onClick={() => openBooking(loc, 'local')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    backgroundColor: '#174D39',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(23, 77, 57, 0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  Request Companion →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
