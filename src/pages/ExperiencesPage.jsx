import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExperiences } from '../lib/api';

export default function ExperiencesPage() {
  const [searchParams] = useSearchParams();
  const { openBooking, openHostApplication, refreshKey } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');
  const [experiencesList, setExperiencesList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categories = [
    { id: 'all', label: 'All Experiences' },
    { id: 'nature', label: '🌿 Forest & Waterfalls' },
    { id: 'adventure', label: '🥾 Alpine Treks' },
    { id: 'food', label: '🍲 Siddu & Gastronomy' },
    { id: 'culture', label: '🏡 Village Heritage' },
  ];

  const filteredExperiences = useMemo(() => {
    return experiencesList.filter((exp) => {
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
      if (selectedValley !== 'all') {
        const reg = String(exp.region || '').toLowerCase();
        if (!reg.includes(selectedValley.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title?.toLowerCase().includes(q);
        const matchesDesc = exp.description?.toLowerCase().includes(q);
        const matchesLoc = exp.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
      }
      return true;
    });
  }, [experiencesList, selectedCategory, selectedValley, searchQuery]);

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
          <div style={{ maxWidth: '720px' }}>
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
              Handcrafted Mountain Activities
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
              Authentic Himalayan Experiences
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(247, 245, 238, 0.85)', lineHeight: 1.6, margin: 0 }}>
              Genuine outdoor walks, culinary sessions, and heritage craft immersions guided by verified local providers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 0 24px' }}>
        {/* Category Filters and Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === c.id ? '#174D39' : '#FFFFFF',
                  color: selectedCategory === c.id ? '#FFFFFF' : '#10251D',
                  border: selectedCategory === c.id ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
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
              <option value="kullu">Kullu</option>
              <option value="parvati">Parvati</option>
              <option value="spiti">Spiti</option>
            </select>

            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                backgroundColor: '#FFFFFF',
                fontSize: '13.5px',
                width: '240px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥾</div>
            <p style={{ fontSize: '15px' }}>Loading verified experiences...</p>
          </div>
        )}

        {/* Honest Empty State */}
        {!loading && filteredExperiences.length === 0 && (
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
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🥾</div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              No experiences are available for this destination yet.
            </h2>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              We do not invent demo experiences or fake activities. If you are an approved local host or guide wishing to offer a genuine experience, submit a proposal to our team.
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
                Propose an Experience
              </button>
              <Link
                to="/explore"
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
                Explore Valid Destinations
              </Link>
            </div>
          </div>
        )}

        {/* Real Experiences Grid */}
        {!loading && filteredExperiences.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredExperiences.map((exp) => (
              <div
                key={exp.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(16, 37, 29, 0.08)',
                  boxShadow: '0 2px 10px rgba(16, 37, 29, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: '220px', backgroundColor: '#EBE7DE' }}>
                  {exp.image ? (
                    <img src={exp.image} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#88988E' }}>
                      🥾 Authentic Himalayan Activity
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(10, 37, 27, 0.8)',
                      color: '#8EE49A',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {exp.region || 'Himachal'}
                  </div>
                </div>

                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', margin: '0 0 8px 0' }}>
                    {exp.title}
                  </h3>
                  <p style={{ color: '#536B5E', fontSize: '13.5px', lineHeight: 1.55, margin: '0 0 16px 0', flex: 1 }}>
                    {exp.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(16, 37, 29, 0.08)' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#174D39' }}>{exp.price}</span>
                      <span style={{ fontSize: '12px', color: '#688575' }}> {exp.unit || '/person'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openBooking(exp, 'experience')}
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
                      Book Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
