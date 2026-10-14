import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExploreInteractiveMap from '../components/explore/ExploreInteractiveMap';
import { EXPLORE_DESTINATIONS } from '../data/exploreDestinationsData';
import { useAuth } from '../context/AuthContext';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openBooking } = useAuth();

  const queryParam = searchParams.get('q') || '';
  const valleyParam = searchParams.get('valley') || searchParams.get('region') || 'all';
  const categoryParam = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedValley, setSelectedValley] = useState(valleyParam.toLowerCase());
  const [selectedCategory, setSelectedCategory] = useState(categoryParam.toLowerCase());
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'grid' | 'map'
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [drawerPlace, setDrawerPlace] = useState(null);

  // Sync state if query params change
  useEffect(() => {
    if (searchParams.get('valley')) {
      setSelectedValley(searchParams.get('valley').toLowerCase());
    }
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category').toLowerCase());
    }
    if (searchParams.get('q')) {
      setSearchQuery(searchParams.get('q'));
    }
  }, [searchParams]);

  const valleysList = [
    { id: 'all', label: 'All Valleys' },
    { id: 'tirthan', label: 'Tirthan Valley' },
    { id: 'jibhi', label: 'Jibhi & Banjar' },
    { id: 'shangarh', label: 'Shangarh & Sainj' },
    { id: 'naggar', label: 'Naggar & Upper Beas' },
    { id: 'lug-valley', label: 'Lug Valley' },
    { id: 'kalga', label: 'Parvati Backcountry' },
  ];

  const categoriesList = [
    { id: 'all', label: 'All Sights & Stays' },
    { id: 'hidden-places', label: '✨ Hidden Places' },
    { id: 'treks', label: '🥾 High Trails' },
    { id: 'waterfalls', label: '🌊 Waterfalls' },
    { id: 'villages', label: '🏡 Kath-Kuni Hamlets' },
    { id: 'stays', label: '🪵 Homestays' },
  ];

  // Filter destinations based on query, valley, category
  const filteredDestinations = useMemo(() => {
    return EXPLORE_DESTINATIONS.filter((dest) => {
      // Valley filter
      if (selectedValley !== 'all') {
        const matchesValley =
          dest.id.toLowerCase() === selectedValley ||
          dest.region?.toLowerCase() === selectedValley ||
          dest.name.toLowerCase().includes(selectedValley);
        if (!matchesValley) return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = dest.name.toLowerCase().includes(q);
        const matchesDesc = dest.description.toLowerCase().includes(q);
        const matchesSub = dest.subValley?.toLowerCase().includes(q);
        const matchesAttractions = dest.nearbyAttractions?.some(
          (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDesc && !matchesSub && !matchesAttractions) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'waterfalls') {
          const hasFalls = dest.nearbyAttractions?.some((a) =>
            a.name.toLowerCase().includes('waterfall') ||
            a.name.toLowerCase().includes('falls') ||
            a.category?.toLowerCase().includes('cascade')
          );
          if (!hasFalls) return false;
        } else if (selectedCategory === 'treks') {
          const hasTreks = dest.nearbyAttractions?.some((a) =>
            a.name.toLowerCase().includes('trail') ||
            a.name.toLowerCase().includes('lake') ||
            a.name.toLowerCase().includes('pass') ||
            a.name.toLowerCase().includes('park')
          );
          if (!hasTreks) return false;
        } else if (selectedCategory === 'villages') {
          const hasVillages = dest.nearbyAttractions?.some((a) =>
            a.name.toLowerCase().includes('hamlet') ||
            a.name.toLowerCase().includes('village') ||
            a.name.toLowerCase().includes('fort') ||
            a.name.toLowerCase().includes('temple')
          );
          if (!hasVillages) return false;
        } else if (selectedCategory === 'stays') {
          if (!dest.stays || dest.stays.length === 0) return false;
        }
      }

      return true;
    });
  }, [selectedValley, searchQuery, selectedCategory]);

  const handleSelectValley = (valId) => {
    setSelectedValley(valId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (valId === 'all') next.delete('valley');
      else next.set('valley', valId);
      return next;
    });
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId === 'all') next.delete('category');
      else next.set('category', catId);
      return next;
    });
  };

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)' }}>
      {/* Search & Filter Header Strip */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
          padding: '24px 0 16px 0',
          position: 'sticky',
          top: '76px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(16, 37, 29, 0.03)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
          {/* Top Row: Title, Search, View Mode Toggle */}
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
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#174D39',
                }}
              >
                Topographic Spatial Discovery
              </span>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '26px',
                  color: '#10251D',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Explore Himachal Sanctuaries
              </h1>
            </div>

            {/* Instant Search Bar */}
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#174D39" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search trails, rivers, villages..."
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#536B5E', fontSize: '13px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F7F5EE',
                borderRadius: '9999px',
                padding: '4px',
                border: '1px solid rgba(16, 37, 29, 0.12)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('split')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  backgroundColor: viewMode === 'split' ? '#174D39' : 'transparent',
                  color: viewMode === 'split' ? '#FFFFFF' : '#10251D',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                🗺️ Split Map
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  backgroundColor: viewMode === 'grid' ? '#174D39' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#10251D',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                🪟 Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  backgroundColor: viewMode === 'map' ? '#174D39' : 'transparent',
                  color: viewMode === 'map' ? '#FFFFFF' : '#10251D',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                🏔️ Map Only
              </button>
            </div>
          </div>

          {/* Valley Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
            }}
          >
            {valleysList.map((val) => {
              const active = selectedValley === val.id;
              return (
                <button
                  key={val.id}
                  type="button"
                  onClick={() => handleSelectValley(val.id)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? '#174D39' : 'transparent',
                    color: active ? '#FFFFFF' : '#10251D',
                    border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.15)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {val.label}
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingTop: '6px',
              scrollbarWidth: 'none',
            }}
          >
            {categoriesList.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '11.5px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? 'rgba(23, 77, 57, 0.15)' : 'transparent',
                    color: active ? '#174D39' : '#536B5E',
                    border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.08)',
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

      {/* Main Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px, 3vw, 24px)' }}>
        {/* VIEW MODE: SPLIT (Map on Top/Left, Cards on Bottom/Right) */}
        {viewMode === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '28px' }}>
            {/* Topographic Map Canvas */}
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(16, 37, 29, 0.12)',
                boxShadow: '0 8px 30px rgba(16, 37, 29, 0.08)',
                minHeight: '460px',
              }}
            >
              <ExploreInteractiveMap
                destinations={filteredDestinations}
                allDestinationsCount={EXPLORE_DESTINATIONS.length}
                activeValleyId={selectedValley}
                onSelectValley={(valId) => handleSelectValley(valId)}
                selectedLocationId={selectedPlaceId}
                onSelectLocationId={(id) => {
                  setSelectedPlaceId(id);
                  if (id) {
                    const found = EXPLORE_DESTINATIONS.find((d) => d.id === id);
                    if (found) setDrawerPlace(found);
                  }
                }}
                isSplitView={true}
              />
            </div>

            {/* Results Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: '#536B5E', fontWeight: 600 }}>
                Showing <strong>{filteredDestinations.length}</strong> Himalayan Destinations
              </div>
              {selectedValley !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectValley('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#174D39',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset Valley Filter ✕
                </button>
              )}
            </div>

            {/* Destination Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                gap: '24px',
              }}
            >
              {filteredDestinations.map((dest) => renderDestinationCard(dest))}
            </div>
          </div>
        )}

        {/* VIEW MODE: GRID ONLY */}
        {viewMode === 'grid' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', color: '#536B5E', fontWeight: 600 }}>
                Showing <strong>{filteredDestinations.length}</strong> Curated Sanctuaries
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                gap: '24px',
              }}
            >
              {filteredDestinations.map((dest) => renderDestinationCard(dest))}
            </div>
          </div>
        )}

        {/* VIEW MODE: FULL MAP ONLY */}
        {viewMode === 'map' && (
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(16, 37, 29, 0.12)',
              boxShadow: '0 8px 30px rgba(16, 37, 29, 0.08)',
              minHeight: '75vh',
            }}
          >
            <ExploreInteractiveMap
              destinations={filteredDestinations}
              allDestinationsCount={EXPLORE_DESTINATIONS.length}
              activeValleyId={selectedValley}
              onSelectValley={(valId) => handleSelectValley(valId)}
              selectedLocationId={selectedPlaceId}
              onSelectLocationId={(id) => {
                setSelectedPlaceId(id);
                if (id) {
                  const found = EXPLORE_DESTINATIONS.find((d) => d.id === id);
                  if (found) setDrawerPlace(found);
                }
              }}
              isSplitView={false}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              marginTop: '20px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>🏔️</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                color: '#10251D',
                marginBottom: '8px',
              }}
            >
              No Destinations Matched
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              We could not find sanctuaries matching your criteria. Try resetting your search or exploring all valleys.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedValley('all');
                setSelectedCategory('all');
              }}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13.5px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Destination Detail Drawer (Quick sliding drawer on click) */}
      {drawerPlace && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(16, 37, 29, 0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setDrawerPlace(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#FAF8F2',
              height: '100%',
              overflowY: 'auto',
              padding: 'clamp(20px, 4vw, 32px)',
              boxShadow: '-8px 0 32px rgba(16, 37, 29, 0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDrawerPlace(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 37, 29, 0.08)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10251D',
              }}
            >
              ✕
            </button>

            {/* Drawer Image */}
            <div style={{ position: 'relative', height: '260px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
              <img
                src={drawerPlace.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85'}
                alt={drawerPlace.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#174D39',
                  color: '#8EE49A',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                }}
              >
                ⛰️ {drawerPlace.elevation}
              </span>
            </div>

            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#174D39',
                fontWeight: 700,
              }}
            >
              {drawerPlace.district} District • {drawerPlace.subValley}
            </span>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '28px',
                color: '#10251D',
                margin: '4px 0 12px 0',
              }}
            >
              {drawerPlace.name}
            </h2>

            <p style={{ color: '#536B5E', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px' }}>
              {drawerPlace.description}
            </p>

            {/* Quick Meta Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(16, 37, 29, 0.08)',
                marginBottom: '28px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 600 }}>
                  Best Season
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#10251D' }}>
                  {drawerPlace.bestTime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 600 }}>
                  Ideal For
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#10251D' }}>
                  {drawerPlace.idealFor || 'Trekking & Quiet Nature'}
                </div>
              </div>
            </div>

            {/* Nearby Attractions */}
            {drawerPlace.nearbyAttractions && drawerPlace.nearbyAttractions.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '18px',
                    color: '#10251D',
                    marginBottom: '12px',
                  }}
                >
                  Nearby Trails & Sights
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {drawerPlace.nearbyAttractions.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#10251D' }}>
                          {att.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#536B5E' }}>
                          {att.category} • {att.distance}
                        </div>
                      </div>
                      <span style={{ fontSize: '18px' }}>
                        {att.icon === 'park' ? '🌲' : att.icon === 'lake' ? '🌊' : '🏰'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stays in Valley */}
            {drawerPlace.stays && drawerPlace.stays.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '18px',
                    color: '#10251D',
                    marginBottom: '12px',
                  }}
                >
                  Curated Family Homestays
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {drawerPlace.stays.map((stay) => (
                    <div
                      key={stay.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '14px',
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#10251D' }}>
                            {stay.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#536B5E' }}>
                            Host: {stay.host}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#174D39' }}>
                            {stay.price}
                          </div>
                          <div style={{ fontSize: '10px', color: '#536B5E' }}>{stay.unit}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#536B5E', margin: '8px 0 10px 0' }}>
                        {stay.tagline}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerPlace(null);
                          openBooking(stay, 'stay');
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#174D39',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Request Stay at {stay.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setDrawerPlace(null);
                  openBooking(
                    {
                      name: `Local Guide (${drawerPlace.name})`,
                      location: `${drawerPlace.name}, HP`,
                      role: 'Local Companion',
                      price: '₹500',
                      unit: '/day',
                      id: 1,
                    },
                    'local'
                  );
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(23, 77, 57, 0.2)',
                }}
              >
                Request Local Companion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderDestinationCard(dest) {
    const flagshipStay = dest.stays?.[0];
    const minPrice = flagshipStay ? flagshipStay.price : '₹1,800';

    return (
      <article
        key={dest.id}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(16, 37, 29, 0.08)',
          boxShadow: '0 4px 20px rgba(16, 37, 29, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 37, 29, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 37, 29, 0.04)';
        }}
      >
        {/* Image wrap */}
        <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
          <img
            src={dest.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'}
            alt={dest.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(16, 37, 29, 0.8)',
              backdropFilter: 'blur(4px)',
              color: '#8EE49A',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            ⛰️ {dest.elevation}
          </span>
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(247, 245, 238, 0.92)',
              color: '#10251D',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '9999px',
            }}
          >
            From {minPrice}/night
          </span>
        </div>

        {/* Card Body */}
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11.5px', color: '#174D39', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            {dest.subValley || dest.region}
          </div>

          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              color: '#10251D',
              margin: '0 0 8px 0',
              lineHeight: 1.25,
            }}
          >
            {dest.name}
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
            {dest.description}
          </p>

          {/* Sights pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {dest.nearbyAttractions?.slice(0, 3).map((a) => (
              <span
                key={a.id}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#F3EFE6',
                  color: '#174D39',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                {a.name.split(' ')[0]}
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button
              type="button"
              onClick={() => setDrawerPlace(dest)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9999px',
                backgroundColor: '#FAF8F2',
                border: '1px solid rgba(16, 37, 29, 0.16)',
                color: '#10251D',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Sights & Map
            </button>
            <button
              type="button"
              onClick={() => {
                openBooking(
                  {
                    name: `Local Companion (${dest.name})`,
                    location: `${dest.name}, HP`,
                    role: 'Local Companion',
                    price: '₹500',
                    unit: '/day',
                    id: 1,
                  },
                  'local'
                );
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Request Guide
            </button>
          </div>
        </div>
      </article>
    );
  }
}
