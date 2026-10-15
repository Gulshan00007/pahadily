import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations, getCategories } from '../lib/api';
import ExploreFilterDrawer from '../components/ExploreFilterDrawer';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDestinationDetail, openHostApplication, refreshKey } = useAuth();

  const queryParam = searchParams.get('q') || '';
  const valleyParam = searchParams.get('valley') || searchParams.get('region') || 'all';
  const categoryParam = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedValley, setSelectedValley] = useState(valleyParam.toLowerCase());
  const [selectedCategory, setSelectedCategory] = useState(categoryParam.toLowerCase());

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [locationsList, setLocationsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL query params change (e.g. back/forward navigation or external links)
  useEffect(() => {
    const vParam = searchParams.get('valley') || searchParams.get('region') || 'all';
    const cParam = searchParams.get('category') || 'all';
    const qParam = searchParams.get('q') || '';

    setSelectedValley(vParam.toLowerCase());
    setSelectedCategory(cParam.toLowerCase());
    setSearchQuery(qParam);
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

  // Extract unique valleys from real published locations
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
        const matchesTags =
          Array.isArray(loc.tags) && loc.tags.some((t) => t.toLowerCase().includes(q));

        if (
          !matchesName &&
          !matchesDesc &&
          !matchesValley &&
          !matchesDistrict &&
          !matchesVillage &&
          !matchesTags
        ) {
          return false;
        }
      }

      return true;
    });
  }, [locationsList, selectedValley, selectedCategory, searchQuery]);

  // Calculation of matching count for staged filters in drawer
  const getMatchingCountForStaged = useCallback(
    (stagedCat, stagedVal) => {
      return locationsList.filter((loc) => {
        if (stagedVal !== 'all') {
          const v = String(loc.valley || '').toLowerCase();
          const d = String(loc.district || '').toLowerCase();
          const target = stagedVal.toLowerCase();
          if (!v.includes(target) && !d.includes(target)) return false;
        }

        if (stagedCat !== 'all') {
          if (loc.category?.toLowerCase() !== stagedCat.toLowerCase()) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = loc.name?.toLowerCase().includes(q);
          const matchesDesc = loc.description?.toLowerCase().includes(q);
          const matchesValley = loc.valley?.toLowerCase().includes(q);
          const matchesDistrict = loc.district?.toLowerCase().includes(q);
          const matchesVillage = loc.village?.toLowerCase().includes(q);
          const matchesTags =
            Array.isArray(loc.tags) && loc.tags.some((t) => t.toLowerCase().includes(q));

          if (
            !matchesName &&
            !matchesDesc &&
            !matchesValley &&
            !matchesDistrict &&
            !matchesVillage &&
            !matchesTags
          ) {
            return false;
          }
        }

        return true;
      }).length;
    },
    [locationsList, searchQuery]
  );

  const handleApplyDrawerFilters = ({ category, valley }) => {
    setSelectedCategory(category.toLowerCase());
    setSelectedValley(valley.toLowerCase());

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (category === 'all') next.delete('category');
      else next.set('category', category);

      if (valley === 'all') next.delete('valley');
      else next.set('valley', valley);

      return next;
    });
  };

  const handleRemoveCategory = () => {
    setSelectedCategory('all');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('category');
      return next;
    });
  };

  const handleRemoveValley = () => {
    setSelectedValley('all');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('valley');
      return next;
    });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!val.trim()) next.delete('q');
      else next.set('q', val.trim());
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedValley('all');
    setSelectedCategory('all');
    setSearchParams({});
  };

  // Human-friendly display names for active chips
  const activeCategoryObj = categoriesList.find(
    (c) => c.id.toLowerCase() === selectedCategory.toLowerCase()
  );
  const activeCategoryName = activeCategoryObj
    ? `${activeCategoryObj.icon || '🏷️'} ${activeCategoryObj.name}`
    : selectedCategory.replace(/-/g, ' ');

  const activeValleyName =
    availableValleys.find((v) => v.toLowerCase() === selectedValley.toLowerCase()) ||
    selectedValley;

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) + (selectedValley !== 'all' ? 1 : 0);

  const hasAnyActiveFilter =
    selectedCategory !== 'all' || selectedValley !== 'all' || Boolean(searchQuery.trim());

  return (
    <div style={{ backgroundColor: '#FAF8F2', minHeight: 'calc(100vh - 76px)', width: '100%', overflowX: 'hidden' }}>
      {/* Search & Filter Header Strip */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(12, 32, 23, 0.08)',
          padding: '18px 0 16px 0',
          position: 'sticky',
          top: '76px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(12, 32, 23, 0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 clamp(16px, 3.5vw, 24px)',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {/* Top Row: Heading and Documented Location Count */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#205540',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '3px',
                }}
              >
                Topographic Directory • Himachal Pradesh
              </span>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(22px, 3.5vw, 28px)',
                  color: '#0C2017',
                  margin: 0,
                  lineHeight: 1.15,
                  fontWeight: 700,
                }}
              >
                Explore Verified Places
              </h1>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(32, 85, 64, 0.08)',
                color: '#205540',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <span>🏔️</span>
              <span>
                {loading
                  ? 'Loading directory...'
                  : `${filteredDestinations.length} ${
                      filteredDestinations.length === 1 ? 'place' : 'places'
                    } documented`}
              </span>
            </div>
          </div>

          {/* Clean Search Bar with Compact Filters Button Beside It */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
            }}
          >
            {/* Search Input with Search Icon & Quick Clear */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#536B5E',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Search by place, village, valley, or district..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 40px 11px 42px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(12, 32, 23, 0.16)',
                  backgroundColor: '#FAF8F2',
                  fontSize: '14px',
                  color: '#0C2017',
                  outline: 'none',
                  minHeight: '46px',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#205540';
                  e.target.style.boxShadow = '0 0 0 3px rgba(32, 85, 64, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(12, 32, 23, 0.16)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search text"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#789083',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Compact Filters Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              aria-label="Open filter options"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                minHeight: '46px',
                borderRadius: '9999px',
                backgroundColor: activeFilterCount > 0 ? 'rgba(32, 85, 64, 0.08)' : '#F3EFE6',
                border:
                  activeFilterCount > 0
                    ? '1.5px solid #205540'
                    : '1px solid rgba(12, 32, 23, 0.16)',
                color: activeFilterCount > 0 ? '#205540' : '#0C2017',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#205540';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  activeFilterCount > 0 ? '#205540' : 'rgba(12, 32, 23, 0.16)';
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#205540',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Removable Chips Row (Only visible when applicable) */}
          {hasAnyActiveFilter && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                paddingTop: '2px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#536B5E',
                  fontWeight: 600,
                  marginRight: '2px',
                }}
              >
                Active filters:
              </span>

              {/* Selected Category Chip */}
              {selectedCategory !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F3EFE6',
                    color: '#0C2017',
                    border: '1px solid rgba(32, 85, 64, 0.3)',
                    padding: '4px 10px 4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  <span>{activeCategoryName}</span>
                  <button
                    type="button"
                    onClick={handleRemoveCategory}
                    aria-label="Remove category filter"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#536B5E',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}

              {/* Selected Valley Chip */}
              {selectedValley !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F3EFE6',
                    color: '#0C2017',
                    border: '1px solid rgba(32, 85, 64, 0.3)',
                    padding: '4px 10px 4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  <span>📍 {activeValleyName}</span>
                  <button
                    type="button"
                    onClick={handleRemoveValley}
                    aria-label="Remove valley filter"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#536B5E',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}

              {/* Search Query Chip */}
              {searchQuery.trim() && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F3EFE6',
                    color: '#0C2017',
                    border: '1px solid rgba(12, 32, 23, 0.15)',
                    padding: '4px 10px 4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  <span>🔍 &ldquo;{searchQuery.trim()}&rdquo;</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search filter"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#536B5E',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}

              {/* Clear All Action */}
              <button
                type="button"
                onClick={handleClearAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c86d51',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 6px',
                  textDecoration: 'underline',
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Drawer (Desktop Modal Drawer / Mobile Bottom Sheet) */}
      <ExploreFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categoriesList}
        valleys={availableValleys}
        selectedCategory={selectedCategory}
        selectedValley={selectedValley}
        onApply={handleApplyDrawerFilters}
        onClear={handleClearAllFilters}
        getMatchingCount={getMatchingCountForStaged}
      />

      {/* Main Content Area - Location Photographs & Destination Cards Prominent Directly Below */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px clamp(16px, 3.5vw, 24px) 60px clamp(16px, 3.5vw, 24px)',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
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
              margin: '36px auto 80px auto',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 28px',
              border: '1px solid rgba(12, 32, 23, 0.08)',
              boxShadow: '0 4px 20px rgba(12, 32, 23, 0.04)',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🏔️</div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#0C2017',
                marginBottom: '10px',
                lineHeight: 1.25,
              }}
            >
              No places found matching your filters
            </h2>
            <p
              style={{
                fontSize: '14.5px',
                color: '#536B5E',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              Pahadíly displays only authentic, admin-vetted locations with real photographs and verified coordinates. Try broadening your category or valley criteria.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={handleClearAllFilters}
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#205540',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={openHostApplication}
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(32, 85, 64, 0.08)',
                  color: '#205540',
                  border: '1px solid rgba(32, 85, 64, 0.2)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Apply as Local Host / Guide
              </button>
            </div>
          </div>
        )}

        {/* Verified Locations Directory Grid */}
        {!loading && filteredDestinations.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {filteredDestinations.map((loc) => {
              const coverImg =
                loc.cover_image || (loc.gallery && loc.gallery[0]?.url) || '';
              return (
                <div
                  key={loc.id}
                  onClick={() => openDestinationDetail(loc)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(12, 32, 23, 0.08)',
                    boxShadow: '0 2px 10px rgba(12, 32, 23, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition:
                      'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(32, 85, 64, 0.35)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 24px rgba(12, 32, 23, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(12, 32, 23, 0.08)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 10px rgba(12, 32, 23, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: '220px',
                      backgroundColor: '#EBE7DE',
                      overflow: 'hidden',
                    }}
                  >
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={loc.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                        }}
                      >
                        🏔️
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(6, 25, 18, 0.85)',
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
                          backgroundColor: 'rgba(250, 248, 242, 0.95)',
                          color: '#205540',
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

                  <div
                    style={{
                      padding: '20px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '20px',
                        color: '#0C2017',
                        margin: '0 0 6px 0',
                        lineHeight: 1.25,
                      }}
                    >
                      {loc.name}
                    </h3>
                    <p
                      style={{
                        color: '#536B5E',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        margin: '0 0 16px 0',
                        flex: 1,
                      }}
                    >
                      {loc.description
                        ? loc.description.length > 130
                          ? `${loc.description.slice(0, 130)}...`
                          : loc.description
                        : ''}
                    </p>

                    {/* Metadata tags */}
                    {(loc.best_time || loc.difficulty) && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                          marginBottom: '14px',
                        }}
                      >
                        {loc.best_time && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#F3EFE6',
                              color: '#536B5E',
                              padding: '3px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            📅 {loc.best_time}
                          </span>
                        )}
                        {loc.difficulty && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#F3EFE6',
                              color: '#536B5E',
                              padding: '3px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            🥾 {loc.difficulty}
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '14px',
                        borderTop: '1px solid rgba(12, 32, 23, 0.08)',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#688575' }}>
                        {loc.village ? `Village: ${loc.village}` : 'Verified location'}
                      </span>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#205540',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
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
