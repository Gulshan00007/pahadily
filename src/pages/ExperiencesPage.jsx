import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VERIFIED_EXPERIENCES } from '../data/experiencesData';
import { useAuth } from '../context/AuthContext';

export default function ExperiencesPage() {
  const [searchParams] = useSearchParams();
  const { openBooking } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');

  const categories = [
    { id: 'all', label: 'All Experiences' },
    { id: 'nature', label: '🌿 Forest & Waterfalls' },
    { id: 'adventure', label: '🥾 Alpine Treks' },
    { id: 'food', label: '🍲 Siddu & Gastronomy' },
    { id: 'culture', label: '🏡 Village Heritage' },
  ];

  const difficulties = [
    { id: 'all', label: 'Any Difficulty' },
    { id: 'Easy', label: 'Easy Walks' },
    { id: 'Moderate', label: 'Moderate Trails' },
  ];

  const durations = [
    { id: 'all', label: 'Any Duration' },
    { id: 'half-day', label: 'Half-Day (2–4 hrs)' },
    { id: 'full-day', label: 'Full-Day (5–7 hrs)' },
    { id: 'multi-day', label: 'Overnight / Camping' },
  ];

  const valleys = [
    { id: 'all', label: 'All Valleys' },
    { id: 'tirthan', label: 'Tirthan Valley' },
    { id: 'jibhi', label: 'Jibhi & Banjar' },
    { id: 'shangarh', label: 'Shangarh & Sainj' },
    { id: 'kullu', label: 'Naggar & Upper Kullu' },
    { id: 'lug-valley', label: 'Lug Valley' },
  ];

  const filteredExperiences = useMemo(() => {
    return VERIFIED_EXPERIENCES.filter((exp) => {
      // Category filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && exp.difficulty !== selectedDifficulty) return false;

      // Duration filter
      if (selectedDuration !== 'all' && exp.durationType !== selectedDuration) return false;

      // Valley filter
      if (selectedValley !== 'all' && exp.region !== selectedValley) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesDesc = exp.description.toLowerCase().includes(q);
        const matchesLoc = exp.location.toLowerCase().includes(q);
        const matchesGuide = exp.guide.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesGuide) return false;
      }

      return true;
    });
  }, [selectedCategory, selectedDifficulty, selectedDuration, selectedValley, searchQuery]);

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Editorial Hero Header */}
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
              Curated Community Expeditions
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
              Authentic Himalayan Experiences
            </h1>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(247, 245, 238, 0.82)',
                margin: 0,
              }}
            >
              Step beyond ordinary tourist routes. Explore hidden cedar groves, high mountain ridges, sacred Devta meadows, and traditional kitchens guided by the people who call Himachal home.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
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
          {/* Top Row: Search & Valley */}
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
            {/* Search */}
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
                placeholder="Search by activity, guide, or trail..."
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

            {/* Quick dropdown selectors */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  padding: '7px 12px',
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
                {difficulties.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                style={{
                  padding: '7px 12px',
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
                {durations.map((dur) => (
                  <option key={dur.id} value={dur.id}>
                    {dur.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedValley}
                onChange={(e) => setSelectedValley(e.target.value)}
                style={{
                  padding: '7px 12px',
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
                {valleys.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills Bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
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
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Experience Grid */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', color: '#536B5E', fontWeight: 600 }}>
            Showing <strong>{filteredExperiences.length}</strong> Experiences in Himachal
          </div>
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedDuration !== 'all' || selectedValley !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedDuration('all');
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

        {/* Grid of Experiences */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '24px',
          }}
        >
          {filteredExperiences.map((exp) => (
            <article
              key={exp.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid rgba(16, 37, 29, 0.08)',
                boxShadow: '0 6px 24px rgba(16, 37, 29, 0.04)',
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
              {/* Image banner */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={exp.image}
                  alt={exp.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(23, 77, 57, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#8EE49A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {exp.difficulty}
                </span>

                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(247, 245, 238, 0.92)',
                    color: '#10251D',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                  }}
                >
                  ⏱️ {exp.duration}
                </span>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(16, 37, 29, 0.85)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  📍 {exp.valleyName || exp.location}
                </div>
              </div>

              {/* Card content */}
              <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    color: '#10251D',
                    lineHeight: 1.3,
                    margin: '0 0 8px 0',
                    fontWeight: 700,
                  }}
                >
                  {exp.title}
                </h3>

                <p
                  style={{
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    color: '#536B5E',
                    margin: '0 0 16px 0',
                    flex: 1,
                  }}
                >
                  {exp.description}
                </p>

                {/* Host badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: '#F7F5EE',
                    borderRadius: '10px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 600 }}>
                      Community Guide
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#174D39' }}>
                      {exp.guide}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#10251D' }}>
                      ★ {exp.rating}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#536B5E' }}>
                      ({exp.reviews} reviews)
                    </div>
                  </div>
                </div>

                {/* Inclusions pill tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {exp.inclusions?.map((inc, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(16, 37, 29, 0.1)',
                        color: '#1e362c',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      ✓ {inc}
                    </span>
                  ))}
                </div>

                {/* Pricing & Booking CTA */}
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
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#174D39', lineHeight: 1 }}>
                      {exp.price}
                    </div>
                    <div style={{ fontSize: '11px', color: '#536B5E' }}>
                      {exp.unit} • Max {exp.maxGroup || 6} guests
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBooking(exp, 'experience')}
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
                    Request Experience →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredExperiences.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌿</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                color: '#10251D',
                marginBottom: '8px',
              }}
            >
              No Experiences Found
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', maxWidth: '400px', margin: '0 auto 18px auto' }}>
              No experiences matched your current filters. Try selecting a different category or clearing all filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedDuration('all');
                setSelectedValley('all');
                setSearchQuery('');
              }}
              style={{
                padding: '9px 20px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
