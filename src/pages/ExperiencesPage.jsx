import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExperiences } from '../lib/api';
import { Search, Compass, Trees, Mountain, Utensils, Home, Heart, ArrowRight } from 'lucide-react';

export default function ExperiencesPage() {
  const [searchParams] = useSearchParams();
  const { openBooking, openHostApplication, refreshKey } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');
  const [experiencesList, setExperiencesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

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
    { id: 'all', label: 'All Experiences', icon: Compass },
    { id: 'nature', label: 'Forest & Waterfalls', icon: Trees },
    { id: 'adventure', label: 'Alpine Treks', icon: Mountain },
    { id: 'food', label: 'Siddu & Gastronomy', icon: Utensils },
    { id: 'culture', label: 'Village Heritage', icon: Home },
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

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ padding: '36px 0 80px 0', minHeight: 'calc(100vh - 76px)' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Himalayan Experiences
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Handcrafted nature walks, mountain treks, culinary workshops, and cultural immersions led by verified locals.
          </p>
        </div>

        {/* Search & Valley Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search experiences, activities, locations..."
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
            <option value="jibhi">Jibhi / Banjar</option>
            <option value="kullu">Kullu</option>
            <option value="parvati">Parvati Valley</option>
            <option value="spiti">Spiti Valley</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '32px',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`btn-pill ${isSelected ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon size={14} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-forest)', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: '14.5px' }}>Loading verified Himalayan experiences...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredExperiences.length === 0 && (
          <div
            style={{
              maxWidth: '560px',
              margin: '32px auto 60px auto',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '44px 32px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Compass size={40} color="var(--color-forest)" style={{ margin: '0 auto 16px auto' }} />
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              No experiences found for this filter
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              We only list authentic activities verified with genuine local hosts. Try resetting filters or propose your own community experience.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openHostApplication}
                className="btn-forest"
                style={{ padding: '10px 22px', fontSize: '13.5px' }}
              >
                Propose an Experience
              </button>
              <Link
                to="/explore"
                className="btn-secondary"
                style={{ padding: '10px 22px', fontSize: '13.5px', textDecoration: 'none' }}
              >
                Explore Destinations
              </Link>
            </div>
          </div>
        )}

        {/* Experience Cards Grid */}
        {!loading && filteredExperiences.length > 0 && (
          <div className="destination-grid">
            {filteredExperiences.map((exp) => (
              <div key={exp.id} className="destination-card">
                <div className="destination-img-wrap">
                  <img
                    src={exp.image || '/images/experiences/sunrise-trek.jpg'}
                    alt={exp.title}
                    className="destination-img"
                    onError={(e) => {
                      e.currentTarget.src = '/images/experiences/sunrise-trek.jpg';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(10, 37, 27, 0.82)',
                      color: 'var(--color-sage)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {exp.region || exp.location || 'Himachal'}
                  </div>
                  <button
                    type="button"
                    className="destination-fav-btn"
                    onClick={(e) => toggleFavorite(exp.id, e)}
                    aria-label="Save experience"
                  >
                    <Heart
                      size={16}
                      fill={favorites[exp.id] ? '#D94848' : 'none'}
                      color={favorites[exp.id] ? '#D94848' : '#FFFFFF'}
                    />
                  </button>
                </div>

                <div className="destination-body">
                  <h3 className="destination-name">{exp.title}</h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {exp.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                        {exp.price}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {' '}{exp.unit || '/person'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openBooking(exp, 'experience')}
                      className="btn-forest"
                      style={{
                        padding: '8px 18px',
                        fontSize: '12.5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Book</span>
                      <ArrowRight size={13} />
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
