import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations } from '../lib/api';
import { Search, SlidersHorizontal, Heart, Star, MapPin, X } from 'lucide-react';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDestinationDetail, refreshKey } = useAuth();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam.toLowerCase());
  const [selectedValley, setSelectedValley] = useState('all');
  const [favorites, setFavorites] = useState({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [backendLocations, setBackendLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronize with URL search params
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory((searchParams.get('category') || 'all').toLowerCase());
  }, [searchParams]);

  // Fetch real locations from backend API
  useEffect(() => {
    setLoading(true);
    getLocations({ status: 'published' })
      .then((data) => {
        setBackendLocations(Array.isArray(data) ? data : []);
      })
      .catch(() => setBackendLocations([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Unified destination dataset (Combines backend published locations + curated destinations)
  const unifiedDestinations = useMemo(() => {
    // Standard curated list matching Screen 2
    const curated = [
      {
        id: 'dest-jibhi',
        name: 'Jibhi',
        district: 'Kullu',
        category: 'villages',
        rating: 4.8,
        reviews: 120,
        image: '/images/destinations/jibhi.jpg',
        description: 'Charming pine valley with freshwater streams, ancient wooden towers, and secret waterfalls.',
      },
      {
        id: 'dest-tirthan',
        name: 'Tirthan Valley',
        district: 'Kullu',
        category: 'waterfalls',
        rating: 4.9,
        reviews: 98,
        image: '/images/destinations/tirthan-valley.jpg',
        description: 'Gateway to Great Himalayan National Park with trout streams and traditional Kath-Kuni homestays.',
      },
      {
        id: 'dest-shoja',
        name: 'Shoja',
        district: 'Kullu',
        category: 'viewpoints',
        rating: 4.7,
        reviews: 67,
        image: '/images/experiences/sunrise-trek.jpg',
        description: 'Serene mountain hamlet perched below Jalori Pass with panoramic ridge views and cedar glades.',
      },
      {
        id: 'dest-banjar',
        name: 'Banjar',
        district: 'Kullu',
        category: 'culture',
        rating: 4.6,
        reviews: 45,
        image: '/images/experiences/village-walk.jpg',
        description: 'Historic cultural hub known for sacred wood-carved temples and mountain trade paths.',
      },
      {
        id: 'dest-sarchi',
        name: 'Sarchi',
        district: 'Kullu',
        category: 'villages',
        rating: 4.7,
        reviews: 32,
        image: '/images/experiences/home-meal.jpg',
        description: 'Clifftop heritage village overlooking the Tirthan canyon with undisturbed mountain lifestyle.',
      },
      {
        id: 'dest-pangi',
        name: 'Pangi Valley',
        district: 'Chamba',
        category: 'treks',
        rating: 4.9,
        reviews: 28,
        image: '/images/destinations/pangi-valley.jpg',
        description: 'Rugged high-altitude Himalayan valley of dramatic gorge trails and ancient tribal traditions.',
      },
      {
        id: 'dest-parvati',
        name: 'Parvati Valley',
        district: 'Kullu',
        category: 'treks',
        rating: 4.8,
        reviews: 84,
        image: '/images/destinations/parvati-valley.jpg',
        description: 'Mystical valley of bubbling hot springs, deodar woodlands, and alpine pilgrim trails.',
      },
      {
        id: 'dest-kasol',
        name: 'Kasol & Grahan',
        district: 'Kullu',
        category: 'villages',
        rating: 4.7,
        reviews: 54,
        image: '/images/destinations/kasol.jpg',
        description: 'Riverside trails connecting quiet secluded hamlets hidden deep within old-growth deodar forests.',
      },
      {
        id: 'dest-spiti',
        name: 'Spiti Valley',
        district: 'Lahaul & Spiti',
        category: 'viewpoints',
        rating: 4.9,
        reviews: 110,
        image: '/images/destinations/spiti-valley.jpg',
        description: 'Cold mountain desert of ancient cliffside Buddhist monasteries and vast star-lit horizons.',
      },
    ];

    // Map backend locations into unified format
    const backendMapped = backendLocations.map((loc) => ({
      id: `backend-${loc.id}`,
      name: loc.name,
      district: loc.district || loc.valley || 'Kullu',
      category: (loc.category || 'villages').toLowerCase(),
      rating: 4.9,
      reviews: 18,
      image: loc.cover_image || '/images/destinations/tirthan-valley.jpg',
      description: loc.description,
      rawLocation: loc,
    }));

    return [...curated, ...backendMapped];
  }, [backendLocations]);

  // Categories filter list matching Screen 2
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'villages', name: 'Villages' },
    { id: 'treks', name: 'Treks' },
    { id: 'waterfalls', name: 'Waterfalls' },
    { id: 'viewpoints', name: 'Viewpoints' },
    { id: 'culture', name: 'Culture' },
  ];

  // Filter logic
  const filtered = useMemo(() => {
    return unifiedDestinations.filter((dest) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dest.name.toLowerCase().includes(q);
        const matchesDist = dest.district.toLowerCase().includes(q);
        const matchesDesc = dest.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDist && !matchesDesc) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (dest.category !== selectedCategory) return false;
      }

      // Valley / District filter
      if (selectedValley !== 'all') {
        if (!dest.district.toLowerCase().includes(selectedValley.toLowerCase())) return false;
      }

      return true;
    });
  }, [unifiedDestinations, searchQuery, selectedCategory, selectedValley]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    const p = new URLSearchParams(searchParams);
    if (catId === 'all') {
      p.delete('category');
    } else {
      p.set('category', catId);
    }
    setSearchParams(p);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      p.set('q', searchQuery.trim());
    } else {
      p.delete('q');
    }
    setSearchParams(p);
  };

  return (
    <div className="explore-page-wrapper" style={{ padding: '36px 0 80px 0' }}>
      <div className="container">
        {/* Screen 2 Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Explore Destinations
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Find beautiful places, nature trails and offbeat locations in Himachal.
          </p>
        </div>

        {/* Search Bar + Filters Action (Screen 2) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '16px' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '44px',
                height: '46px',
                fontSize: '14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#FFFFFF',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  const p = new URLSearchParams(searchParams);
                  p.delete('q');
                  setSearchParams(p);
                }}
                style={{ position: 'absolute', right: '14px', color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          <button
            type="button"
            className="btn btn-secondary btn-pill"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              height: '46px',
              padding: '0 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              borderColor: 'var(--color-border)',
            }}
          >
            <SlidersHorizontal size={16} color="var(--color-forest)" />
            <span>Filters</span>
          </button>
        </div>

        {/* Category Pills Strip (Screen 2) */}
        <div className="filter-tabs" style={{ marginBottom: '32px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Destination Grid (Screen 2 - 3 columns desktop) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p>Loading destinations across Himachal...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              maxWidth: '520px',
              margin: '32px auto',
            }}
          >
            <MapPin size={36} color="var(--color-forest)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              No destinations found
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              We couldn't find any places matching your current search or category filters.
            </p>
            <button
              type="button"
              className="btn btn-forest btn-sm btn-pill"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedValley('all');
                setSearchParams({});
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="destination-grid">
            {filtered.map((dest) => (
              <div
                key={dest.id}
                className="destination-card"
                onClick={() => openDestinationDetail(dest.rawLocation || dest)}
                style={{ cursor: 'pointer' }}
              >
                <div className="destination-img-wrap">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="destination-img"
                    onError={(e) => {
                      e.currentTarget.src = '/images/destinations/tirthan-valley.jpg';
                    }}
                  />
                  <button
                    type="button"
                    className="favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(dest.id);
                    }}
                    style={{ color: favorites[dest.id] ? '#E53935' : 'var(--color-text-secondary)' }}
                    aria-label="Save to favorites"
                  >
                    <Heart size={16} fill={favorites[dest.id] ? '#E53935' : 'none'} />
                  </button>
                </div>

                <div className="destination-body">
                  <h3 className="destination-title">{dest.name}</h3>
                  <div className="destination-location">{dest.district}</div>

                  <div className="destination-meta">
                    <Star size={14} fill="#D99A38" color="#D99A38" />
                    <span>{dest.rating}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                      ({dest.reviews})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal Drawer */}
      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Filter Destinations</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsFilterModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Region Filter */}
              <div className="form-group">
                <label className="form-label">District / Region</label>
                <select
                  className="input-field"
                  value={selectedValley}
                  onChange={(e) => setSelectedValley(e.target.value)}
                >
                  <option value="all">All Districts</option>
                  <option value="kullu">Kullu & Parvati</option>
                  <option value="tirthan">Tirthan Valley</option>
                  <option value="chamba">Chamba & Pangi</option>
                  <option value="spiti">Lahaul & Spiti</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="input-field"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryClick(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedValley('all');
                    setIsFilterModalOpen(false);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-pill w-full"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
