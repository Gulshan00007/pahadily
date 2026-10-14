import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EXPLORE_DESTINATIONS } from '../data/exploreDestinationsData';
import { useAuth } from '../context/AuthContext';

export default function StaysPage() {
  const [searchParams] = useSearchParams();
  const { openBooking } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');
  const [selectedAmenity, setSelectedAmenity] = useState('all');

  // Flatten all stays from all destinations with destination metadata
  const allStays = useMemo(() => {
    const list = [];
    for (const dest of EXPLORE_DESTINATIONS) {
      if (dest.stays && dest.stays.length > 0) {
        for (const s of dest.stays) {
          list.push({
            ...s,
            destinationId: dest.id,
            destinationName: dest.name,
            valleyName: dest.subValley || dest.name,
            state: dest.state,
          });
        }
      }
    }
    return list;
  }, []);

  const valleyFilters = [
    { id: 'all', label: 'All Valleys' },
    { id: 'tirthan', label: 'Tirthan Valley' },
    { id: 'jibhi', label: 'Jibhi & Banjar' },
    { id: 'shangarh', label: 'Shangarh & Sainj' },
    { id: 'naggar', label: 'Naggar & Upper Beas' },
    { id: 'lug-valley', label: 'Lug Valley' },
    { id: 'kalga', label: 'Parvati Valley' },
  ];

  const amenityFilters = [
    { id: 'all', label: 'All Amenities' },
    { id: 'Meals', label: '🍲 Home-Cooked Meals' },
    { id: 'River View', label: '🌊 River View' },
    { id: 'WiFi', label: '📶 High-Speed WiFi' },
    { id: 'Fireplace', label: '🪵 Traditional Hearth' },
  ];

  const filteredStays = useMemo(() => {
    return allStays.filter((stay) => {
      // Valley filter
      if (selectedValley !== 'all') {
        if (stay.destinationId !== selectedValley) return false;
      }

      // Amenity filter
      if (selectedAmenity !== 'all') {
        if (!stay.amenities || !stay.amenities.includes(selectedAmenity)) return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = stay.name.toLowerCase().includes(q);
        const matchesDesc = stay.description?.toLowerCase().includes(q);
        const matchesLoc = stay.subLocation?.toLowerCase().includes(q);
        const matchesHost = stay.host?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesHost) return false;
      }

      return true;
    });
  }, [allStays, selectedValley, selectedAmenity, searchQuery]);

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
              Living Vernacular Heritage
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
              Authentic Himalayan Homestays
            </h1>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(247, 245, 238, 0.85)',
                margin: 0,
              }}
            >
              Handcrafted Kath-Kuni chalets, organic apple orchard farmhouses, and riverside mud cottages hosted by multi-generational Himachali families. Enjoy wood-fired meals, fresh mountain cow milk, and peaceful starry nights.
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
          {/* Top Row: Search & Amenity */}
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
                placeholder="Search homestays, host, village..."
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

            {/* Amenity Filter */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {amenityFilters.map((af) => {
                const active = selectedAmenity === af.id;
                return (
                  <button
                    key={af.id}
                    type="button"
                    onClick={() => setSelectedAmenity(af.id)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? 'rgba(23, 77, 57, 0.15)' : 'transparent',
                      color: active ? '#174D39' : '#536B5E',
                      border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {af.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valley Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {valleyFilters.map((vf) => {
              const active = selectedValley === vf.id;
              return (
                <button
                  key={vf.id}
                  type="button"
                  onClick={() => setSelectedValley(vf.id)}
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
                  {vf.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', color: '#536B5E', fontWeight: 600 }}>
            Showing <strong>{filteredStays.length}</strong> Family Homestays
          </div>
          {(selectedValley !== 'all' || selectedAmenity !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedValley('all');
                setSelectedAmenity('all');
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
          {filteredStays.map((stay) => (
            <article
              key={stay.id}
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
              <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                <img
                  src={stay.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}
                  alt={stay.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(23, 77, 57, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#8EE49A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                  }}
                >
                  📍 {stay.subLocation || stay.valleyName}
                </span>

                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(247, 245, 238, 0.95)',
                    color: '#10251D',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                  }}
                >
                  ★ {stay.rating} ({stay.reviewsCount})
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', color: '#174D39', fontWeight: 600, marginBottom: '4px' }}>
                  Hosted by {stay.host}
                </div>

                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '21px',
                    color: '#10251D',
                    margin: '0 0 8px 0',
                    lineHeight: 1.25,
                    fontWeight: 700,
                  }}
                >
                  {stay.name}
                </h3>

                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#536B5E',
                    margin: '0 0 16px 0',
                    flex: 1,
                  }}
                >
                  {stay.description || stay.tagline}
                </p>

                {/* Amenities pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {stay.amenities?.map((amenity, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#F7F5EE',
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                        color: '#174D39',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Room options breakdown if present */}
                {stay.stayOptions && stay.stayOptions.length > 0 && (
                  <div
                    style={{
                      backgroundColor: '#FAF8F2',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      marginBottom: '18px',
                      fontSize: '12px',
                      color: '#1e362c',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#10251D', marginBottom: '4px' }}>
                      Room Options:
                    </div>
                    {stay.stayOptions.map((opt) => (
                      <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>{opt.name} ({opt.capacity})</span>
                        <strong style={{ color: '#174D39' }}>{opt.price}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price & CTA */}
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
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#174D39', lineHeight: 1 }}>
                      {stay.price}
                    </div>
                    <div style={{ fontSize: '11px', color: '#536B5E' }}>
                      {stay.unit || '/ night'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBooking(stay, 'stay')}
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
                    Request Stay →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
