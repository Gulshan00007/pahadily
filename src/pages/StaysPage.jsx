import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations } from '../lib/api';
import { Search, Star, Heart } from 'lucide-react';

export default function StaysPage() {
  const [searchParams] = useSearchParams();
  const { openBooking, refreshKey } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');
  const [staysList, setStaysList] = useState([]);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    getLocations({ status: 'published' })
      .then((data) => {
        const publishedStays = (Array.isArray(data) ? data : []).filter(
          (loc) =>
            loc.category === 'villages' ||
            loc.category === 'homestays' ||
            (loc.tags && loc.tags.some((t) => t.toLowerCase().includes('stay') || t.toLowerCase().includes('homestay')))
        );
        setStaysList(publishedStays);
      })
      .catch(() => setStaysList([]));
  }, [refreshKey]);

  // Seed sample stays if backend empty
  const allStays = useMemo(() => {
    const curatedStays = [
      {
        id: 'stay-1',
        name: 'Riverside Cedar Homestay',
        village: 'Gushaini',
        valley: 'Tirthan Valley',
        price: '₹2,500',
        unit: '/ night',
        rating: 4.9,
        reviews: 24,
        host_name: 'Meena Negi',
        image: '/images/destinations/tirthan-valley.jpg',
        description: 'Authentic Kath-Kuni wooden chalet perched directly on the crystalline trout river.',
      },
      {
        id: 'stay-2',
        name: 'Shoja Meadow Cottage',
        village: 'Shoja',
        valley: 'Jibhi Valley',
        price: '₹2,200',
        unit: '/ night',
        rating: 4.8,
        reviews: 31,
        host_name: 'Rohit Thakur',
        image: '/images/destinations/jibhi.jpg',
        description: 'Traditional wood-and-stone alpine home with open fireplace and view of snow peaks.',
      },
      {
        id: 'stay-3',
        name: 'Sarchi Ridge Wooden Retreat',
        village: 'Sarchi',
        valley: 'Tirthan Valley',
        price: '₹2,800',
        unit: '/ night',
        rating: 4.9,
        reviews: 18,
        host_name: 'Karan Negi',
        image: '/images/experiences/sunrise-trek.jpg',
        description: 'Spectacular mountain eyrie perched atop the canyon rim overlooking alpine meadows.',
      },
    ];

    if (staysList.length > 0) {
      const mappedBackend = staysList.map((loc) => ({
        id: `backend-stay-${loc.id}`,
        name: loc.name,
        village: loc.village || 'Heritage Hamlet',
        valley: loc.valley || loc.district || 'Kullu',
        price: '₹2,400',
        unit: '/ night',
        rating: 4.9,
        reviews: 14,
        host_name: 'Local Host',
        image: loc.cover_image || '/images/destinations/tirthan-valley.jpg',
        description: loc.description,
      }));
      return [...curatedStays, ...mappedBackend];
    }

    return curatedStays;
  }, [staysList]);

  const filtered = useMemo(() => {
    return allStays.filter((stay) => {
      if (selectedValley !== 'all') {
        const v = String(stay.valley || '').toLowerCase();
        if (!v.includes(selectedValley.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = stay.name.toLowerCase().includes(q);
        const matchesVil = stay.village?.toLowerCase().includes(q);
        const matchesDesc = stay.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesVil && !matchesDesc) return false;
      }
      return true;
    });
  }, [allStays, selectedValley, searchQuery]);

  return (
    <div style={{ padding: '36px 0 80px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
            }}
          >
            Himalayan Homestays
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Stay in traditional Kath-Kuni timber homes with verified native host families.
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search stays by name or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '44px',
                height: '46px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          <select
            className="input-field"
            value={selectedValley}
            onChange={(e) => setSelectedValley(e.target.value)}
            style={{
              width: '180px',
              height: '46px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="all">All Valleys</option>
            <option value="tirthan">Tirthan Valley</option>
            <option value="jibhi">Jibhi</option>
            <option value="kullu">Kullu</option>
          </select>
        </div>

        {/* Stays Grid */}
        <div className="destination-grid">
          {filtered.map((stay) => (
            <div key={stay.id} className="destination-card">
              <div className="destination-img-wrap">
                <img
                  src={stay.image}
                  alt={stay.name}
                  className="destination-img"
                  onError={(e) => {
                    e.currentTarget.src = '/images/destinations/tirthan-valley.jpg';
                  }}
                />
                <button
                  type="button"
                  className="favorite-btn"
                  onClick={() => setFavorites((prev) => ({ ...prev, [stay.id]: !prev[stay.id] }))}
                  style={{ color: favorites[stay.id] ? '#E53935' : 'var(--color-text-secondary)' }}
                >
                  <Heart size={16} fill={favorites[stay.id] ? '#E53935' : 'none'} />
                </button>
              </div>

              <div className="destination-body">
                <h3 className="destination-title">{stay.name}</h3>
                <div className="destination-location">
                  {stay.village}, {stay.valley}
                </div>

                <div className="destination-meta" style={{ justifyContent: 'space-between', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#D99A38" color="#D99A38" />
                    <span>{stay.rating}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                      ({stay.reviews})
                    </span>
                  </div>

                  <div style={{ fontWeight: '800', color: 'var(--color-forest)' }}>
                    {stay.price} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--color-text-secondary)' }}>{stay.unit}</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    className="btn btn-forest btn-sm w-full"
                    onClick={() => openBooking(stay, 'stay')}
                  >
                    Reserve Homestay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
