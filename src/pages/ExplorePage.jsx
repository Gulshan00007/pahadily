import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations, getCategories } from '../lib/api';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDestinationDetail, openHostApplication, refreshKey } = useAuth();

  const queryParam = searchParams.get('q') || '';
  const valleyParam = searchParams.get('valley') || searchParams.get('region') || 'all';
  const categoryParam = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedValley, setSelectedValley] = useState(valleyParam.toLowerCase());
  const [selectedCategory, setSelectedCategory] = useState(categoryParam.toLowerCase());

  const [locationsList, setLocationsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch real published locations and active categories
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getLocations({ status: 'published' }).catch(() => []),
      getCategories().catch(() => []),
    ])
      .then(([locs, cats]) => {
        setLocationsList(Array.isArray(locs) ? locs : []);
        setCategoriesList(Array.isArray(cats) ? cats : []);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Extract unique valleys from real locations
  const availableValleys = useMemo(() => {
    const set = new Set();
    locationsList.forEach((l) => {
      if (l.valley) set.add(l.valley);
    });
    return Array.from(set);
  }, [locationsList]);

  // Filter genuine locations based on query, valley/district, category
  const filteredDestinations = useMemo(() => {
    return locationsList.filter((loc) => {
      // Valley / Region filter
      if (selectedValley !== 'all') {
        const v = String(loc.valley || '').toLowerCase();
        const d = String(loc.district || '').toLowerCase();
        const target = selectedValley.toLowerCase();
        if (!v.includes(target) && !d.includes(target)) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (loc.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Query filter (Search by location, village, valley, or district)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = loc.name?.toLowerCase().includes(q);
        const matchesDesc = loc.description?.toLowerCase().includes(q);
        const matchesValley = loc.valley?.toLowerCase().includes(q);
        const matchesDistrict = loc.district?.toLowerCase().includes(q);
        const matchesVillage = loc.village?.toLowerCase().includes(q);
        const matchesTags = Array.isArray(loc.tags) && loc.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesName && !matchesDesc && !matchesValley && !matchesDistrict && !matchesVillage && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [locationsList, selectedValley, selectedCategory, searchQuery]);

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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedValley('all');
    setSelectedCategory('all');
    setSearchParams({});
  };

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)' }}>
      {/* Search & Filter Header Strip */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
          padding: '20px 0 16px 0',
          position: 'sticky',
          top: '76px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(16, 37, 29, 0.03)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
          {/* Top Row: Header & Results Count */}
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
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#174D39',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Topographic Directory • Himachal Pradesh
              </span>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '28px',
                  color: '#10251D',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Explore Verified Places
              </h1>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(23, 77, 57, 0.08)',
                color: '#174D39',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
              }}
            >
              {loading
                ? 'Loading directory...'
                : `${filteredDestinations.length} ${filteredDestinations.length === 1 ? 'place' : 'places'} documented`}
            </div>
          </div>

          {/* Search Input Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by location, village, valley, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '9px 18px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                backgroundColor: '#FAF8F2',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
            {(searchQuery || selectedValley !== 'all' || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(200, 109, 81, 0.3)',
                  backgroundColor: 'rgba(200, 109, 81, 0.08)',
                  color: '#9a3412',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Filters ✕
              </button>
            )}
          </div>

          {/* Admin Managed Categories Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              style={{
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: selectedCategory === 'all' ? 700 : 500,
                backgroundColor: selectedCategory === 'all' ? '#174D39' : '#FAF8F2',
                color: selectedCategory === 'all' ? '#FFFFFF' : '#10251D',
                border: '1px solid rgba(16, 37, 29, 0.12)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              All Categories
            </button>
            {categoriesList.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? '#174D39' : '#FAF8F2',
                    color: active ? '#FFFFFF' : '#10251D',
                    border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{cat.icon || '🏔️'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Valley / District Filter Pills */}
          {availableValleys.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => handleSelectValley('all')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: selectedValley === 'all' ? 750 : 500,
                  backgroundColor: selectedValley === 'all' ? '#174D39' : '#EBE7DE',
                  color: selectedValley === 'all' ? '#FFFFFF' : '#10251D',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                All Valleys
              </button>
              {availableValleys.map((val) => {
                const active = selectedValley.toLowerCase() === val.toLowerCase();
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectValley(val)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: active ? 750 : 500,
                      backgroundColor: active ? '#174D39' : '#EBE7DE',
                      color: active ? '#FFFFFF' : '#10251D',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📍 {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px clamp(14px, 3vw, 24px)' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏔️</div>
            <p style={{ fontSize: '15px' }}>Loading verified topographic locations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDestinations.length === 0 && (
          <div
            style={{
              maxWidth: '620px',
              margin: '40px auto 80px auto',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 32px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              boxShadow: '0 4px 20px rgba(16, 37, 29, 0.04)',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🏔️</div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              We're adding verified places to explore. Check back soon.
            </h2>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              Pahadíly displays only authentic, admin-vetted locations with real photographs and verified coordinates. No demo places or placeholder entries are shown.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleClearFilters}
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
                Reset Search Filters
              </button>
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
                Apply to Become a Local Host / Guide
              </button>
            </div>
          </div>
        )}

        {/* Verified Locations Directory Grid */}
        {!loading && filteredDestinations.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredDestinations.map((loc) => {
              const coverImg = loc.cover_image || (loc.gallery && loc.gallery[0]?.url) || '';
              return (
                <div
                  key={loc.id}
                  onClick={() => openDestinationDetail(loc)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(16, 37, 29, 0.08)',
                    boxShadow: '0 2px 10px rgba(16, 37, 29, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(23, 77, 57, 0.35)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 37, 29, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 37, 29, 0.08)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(16, 37, 29, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'relative', height: '220px', backgroundColor: '#EBE7DE' }}>
                    {coverImg ? (
                      <img src={coverImg} alt={loc.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                        🏔️
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(10, 37, 27, 0.85)',
                        color: '#8EE49A',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {loc.district} • {loc.valley}
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

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', margin: '0 0 6px 0', lineHeight: 1.25 }}>
                      {loc.name}
                    </h3>
                    <p style={{ color: '#536B5E', fontSize: '13.5px', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                      {loc.description ? (loc.description.length > 130 ? `${loc.description.slice(0, 130)}...` : loc.description) : ''}
                    </p>

                    {/* Metadata tags */}
                    {(loc.best_time || loc.difficulty) && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        {loc.best_time && (
                          <span style={{ fontSize: '11px', backgroundColor: '#F3EFE6', color: '#536B5E', padding: '3px 8px', borderRadius: '4px' }}>
                            📅 {loc.best_time}
                          </span>
                        )}
                        {loc.difficulty && (
                          <span style={{ fontSize: '11px', backgroundColor: '#F3EFE6', color: '#536B5E', padding: '3px 8px', borderRadius: '4px' }}>
                            🥾 {loc.difficulty}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(16, 37, 29, 0.08)' }}>
                      <span style={{ fontSize: '12px', color: '#688575' }}>
                        {loc.village ? `Village: ${loc.village}` : 'Verified location'}
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#174D39', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>View Slideshow &amp; Details</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
