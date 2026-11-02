import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocals } from '../lib/api';
import { VERIFIED_LOCALS } from '../data/localsData';
import { Search, SlidersHorizontal, ShieldCheck, Star, Heart, MapPin, X } from 'lucide-react';

export default function CompanionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshKey } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [favorites, setFavorites] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [backendLocals, setBackendLocals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronize with URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  // Fetch backend companions & combine with curated locals
  useEffect(() => {
    setLoading(true);
    getLocals()
      .then((data) => {
        setBackendLocals(Array.isArray(data) ? data : []);
      })
      .catch(() => setBackendLocals([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Unified list of companions
  const allCompanions = useMemo(() => {
    const backendMapped = backendLocals.map((loc) => ({
      id: loc.id,
      name: loc.name,
      role: loc.role || 'Local Companion',
      location: loc.location || `${loc.region}, Himachal Pradesh`,
      rating: loc.rating || 4.9,
      reviews: loc.reviews || 22,
      price: loc.price || '₹1,500',
      unit: loc.unit || '/ day',
      tags: Array.isArray(loc.tags) ? loc.tags : ['Local Trails', 'Village Culture'],
      image: loc.image || '/images/locals/rahul.jpg',
      verified: Boolean(loc.verified),
      certified: Boolean(loc.certified),
      bio: loc.bio,
    }));

    // Merge curated locals, deduplicating by ID/name
    const merged = [...VERIFIED_LOCALS];
    backendMapped.forEach((bm) => {
      if (!merged.some((m) => m.id === bm.id || m.name.toLowerCase() === bm.name.toLowerCase())) {
        merged.push(bm);
      }
    });

    return merged;
  }, [backendLocals]);

  // Service categories filter matching Screen 3
  const serviceCategories = [
    { id: 'all', label: 'All' },
    { id: 'trek-guide', label: 'Trek Guide' },
    { id: 'companion', label: 'Local Companion' },
    { id: 'driver', label: 'Driver' },
    { id: 'host', label: 'Homestay Host' },
  ];

  // Filtering
  const filteredCompanions = useMemo(() => {
    return allCompanions.filter((comp) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = comp.name.toLowerCase().includes(q);
        const matchesLoc = comp.location.toLowerCase().includes(q);
        const matchesTags = comp.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesRole = comp.role?.toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesTags && !matchesRole) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const role = (comp.role || '').toLowerCase();
        const cat = (comp.category || '').toLowerCase();
        if (selectedCategory === 'trek-guide') {
          if (!role.includes('trek') && !role.includes('guide') && !cat.includes('trek')) return false;
        } else if (selectedCategory === 'companion') {
          if (!role.includes('companion') && !cat.includes('companion')) return false;
        } else if (selectedCategory === 'driver') {
          if (!role.includes('driver') && !cat.includes('driver')) return false;
        } else if (selectedCategory === 'host') {
          if (!role.includes('host') && !cat.includes('host') && !cat.includes('stay')) return false;
        }
      }

      return true;
    });
  }, [allCompanions, searchQuery, selectedCategory]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const p = new URLSearchParams(searchParams);
    if (catId === 'all') {
      p.delete('category');
    } else {
      p.set('category', catId);
    }
    setSearchParams(p);
  };

  return (
    <div className="companions-page-wrapper" style={{ padding: '36px 0 80px 0' }}>
      <div className="container">
        {/* Screen 3 Header */}
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
            Find a Local Companion
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Connect with local people for treks, village tours, transport and more.
          </p>
        </div>

        {/* Search Bar + Filters Action (Screen 3) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '16px' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search by name or location..."
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
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '14px', color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-pill"
            onClick={() => setIsFilterOpen(true)}
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

        {/* Service Categories Filter Tabs (Screen 3) */}
        <div className="filter-tabs" style={{ marginBottom: '32px' }}>
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Companion Row Cards (Screen 3) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p>Loading verified local guides and companions...</p>
          </div>
        ) : filteredCompanions.length === 0 ? (
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
              No companions found
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Try searching for a different valley, service category, or clear your filters.
            </p>
            <button
              type="button"
              className="btn btn-forest btn-sm btn-pill"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSearchParams({});
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="companion-list">
            {filteredCompanions.map((companion) => (
              <div key={companion.id} className="companion-row-card">
                {/* Left Profile Avatar */}
                <div className="companion-avatar-box">
                  <img
                    src={companion.image || '/images/locals/rahul.jpg'}
                    alt={companion.name}
                    className="companion-avatar-img"
                    onError={(e) => {
                      e.currentTarget.src = '/images/locals/rahul.jpg';
                    }}
                  />
                </div>

                {/* Center Information */}
                <div className="companion-info">
                  <div className="companion-name-row">
                    <span className="companion-name">{companion.name}</span>
                    {companion.verified && (
                      <span title="Verified Native Companion" style={{ color: '#205540', display: 'inline-flex' }}>
                        <ShieldCheck size={18} fill="#8EE49A" />
                      </span>
                    )}
                  </div>

                  <div className="companion-loc-row">
                    <MapPin size={13} color="var(--color-text-secondary)" />
                    <span>{companion.location}</span>
                  </div>

                  <div className="companion-rating-row">
                    <Star size={14} fill="#D99A38" color="#D99A38" />
                    <span>{companion.rating}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                      ({companion.reviews} reviews)
                    </span>
                  </div>

                  <div className="companion-tags-pills">
                    {companion.tags?.map((t) => (
                      <span key={t} className="tag-pill">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action & Price */}
                <div className="companion-actions-col">
                  <button
                    type="button"
                    className="favorite-btn"
                    style={{
                      position: 'static',
                      boxShadow: 'none',
                      border: '1px solid var(--color-border)',
                      color: favorites[companion.id] ? '#E53935' : 'var(--color-text-secondary)',
                    }}
                    onClick={() => toggleFavorite(companion.id)}
                    aria-label="Add to favorites"
                  >
                    <Heart size={16} fill={favorites[companion.id] ? '#E53935' : 'none'} />
                  </button>

                  <div>
                    <div className="companion-price" style={{ textAlign: 'right', marginBottom: '8px' }}>
                      {companion.price} <span>{companion.unit || '/ day'}</span>
                    </div>

                    <Link
                      to={`/companion/${companion.id}`}
                      className="btn btn-forest btn-sm"
                      style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)' }}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Filter Companions</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsFilterOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select
                  className="input-field"
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                >
                  {serviceCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
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
                    setIsFilterOpen(false);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-pill w-full"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
