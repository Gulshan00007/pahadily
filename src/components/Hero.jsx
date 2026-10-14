import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PILOT_VALLEYS = [
  {
    name: 'Tirthan Valley',
    tagline: 'Crystal rivers, deodar forests, and UNESCO GHNP trails',
    highlights: 'Jalori Pass, Serolsar Lake, Chhoie Waterfall, Great Himalayan National Park',
    altitude: '1,600m',
  },
  {
    name: 'Jibhi',
    tagline: 'Quiet pine hamlets, stone-and-timber architectural heritage',
    highlights: 'Chehni Kothi 1,500-year fortress tower, Shringa Rishi Temple, hidden waterfalls',
    altitude: '1,880m',
  },
  {
    name: 'Shangarh',
    tagline: 'Vast sacred alpine meadow protected by Shangchul Mahadev',
    highlights: 'Ancient wooden pagoda temples, wildflower paths, Barshangarh waterfall',
    altitude: '2,100m',
  },
  {
    name: 'Naggar',
    tagline: 'Ancient Kullu royal capital, timber castellation, and Russian art history',
    highlights: 'Naggar Castle, Nicholas Roerich Estate, Tripura Sundari pagoda, Jana Falls',
    altitude: '1,760m',
  },
  {
    name: 'Lug Valley',
    tagline: 'Untouched western tributary valley of Kullu, wild deodar ridges',
    highlights: 'Chanderkhani western flanks, traditional shepherd trails, organic apple orchards',
    altitude: '1,950m',
  },
];

function Hero() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (query) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/explore');
    }
  };

  const openValley = (valleyName) => {
    const slug = valleyName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/explore?valley=${encodeURIComponent(slug)}`);
  };

  return (
    <section className="hero-section">
      <div className="hero-media-wrapper">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
          onError={(e) => {
            e.currentTarget.src = '/images/hero/himachal-hero.jpg';
          }}
          alt="Ancient deodar pines and snow-capped Himalayan peaks in Himachal Pradesh"
          className="hero-backdrop-img"
        />
        <div className="hero-gradient-overlay"></div>
      </div>

      {/* Floating handwritten mountain field note */}
      <div className="hero-script-note" aria-hidden="true">
        <span className="script-line-1">Rare</span>
        <span className="script-line-2">Places</span>
        <span className="script-line-3">Real People</span>
      </div>

      <div className="hero-container">
        <div className="hero-content-col" style={{ maxWidth: '640px' }}>
          <p
            className="hero-eyebrow"
            style={{
              letterSpacing: '0.15em',
              color: 'var(--color-sage-light, #9ee0bd)',
              fontWeight: 700,
            }}
          >
            HIMALAYAN LOCAL-DISCOVERY PILOT
          </p>

          <h1 className="hero-heading" style={{ lineHeight: 1.08, marginBottom: '16px' }}>
            Discover
            <span className="hero-heading-rare" style={{ display: 'block', color: '#ffffff' }}>
              Rare Places.
            </span>
          </h1>

          <p
            className="hero-lead"
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 500,
              lineHeight: 1.45,
              marginBottom: '28px',
            }}
          >
            Travel deeper with locals, not just guidebooks.
          </p>

          {/* Prominent Search Bar */}
          <form
            className="hero-search-bar"
            onSubmit={handleSearch}
            style={{ marginBottom: '20px' }}
          >
            <div className="search-input-prefix">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2d5341"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Kullu valleys, villages, local companions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="hero-search-input"
              aria-label="Search destination or local companion"
            />
            <button type="submit" className="hero-search-btn">
              Search <span className="btn-arrow">→</span>
            </button>
          </form>



          {/* Quick Valley Discovery Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: 'var(--color-sand, #d9c5a3)',
              }}
            >
              Pilot Valleys:
            </span>
            {['Tirthan', 'Jibhi', 'Shangarh', 'Naggar', 'Lug Valley'].map((valley) => (
              <button
                key={valley}
                type="button"
                onClick={() => openValley(valley)}
                style={{
                  color: '#ffffff',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(20, 61, 45, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                }}
              >
                {valley}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Himalayan Pilot Discovery Modal */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(10, 37, 27, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              backgroundColor: '#faf8f2',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(20, 61, 45, 0.15)',
              position: 'relative',
              color: '#0c2017',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#205540',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  Pahadíly Pilot • Kullu District
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif, serif)',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0a251b',
                    margin: 0,
                  }}
                >
                  {activeModal.type === 'valley' && activeModal.valley.name}
                  {activeModal.type === 'search' && `Results for "${activeModal.query}"`}
                  {activeModal.type === 'companions' && 'Himalayan Local Companions'}
                  {activeModal.type === 'explore' && 'Explore Kullu Pilot Valleys'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'rgba(10, 37, 27, 0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#143d2d',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            {activeModal.type === 'valley' && (
              <div>
                <p style={{ fontSize: '15px', color: '#1e362c', lineHeight: 1.5, marginBottom: '16px' }}>
                  {activeModal.valley.tagline}
                </p>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#536b5e', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Key Landmarks & Trails
                  </div>
                  <div style={{ fontSize: '14px', color: '#0c2017', fontWeight: 500 }}>
                    {activeModal.valley.highlights}
                  </div>
                </div>
              </div>
            )}

            {activeModal.type === 'search' && (
              <div>
                <p style={{ fontSize: '15px', color: '#1e362c', lineHeight: 1.5, marginBottom: '16px' }}>
                  Matches in Kullu Pilot District:
                </p>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#143d2d', fontSize: '16px', marginBottom: '4px' }}>
                    {activeModal.matchedValley.name}
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#536b5e', marginBottom: '8px' }}>
                    {activeModal.matchedValley.tagline}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e362c' }}>
                    <strong>Trails:</strong> {activeModal.matchedValley.highlights}
                  </div>
                </div>
              </div>
            )}

            {activeModal.type === 'companions' && (
              <div>
                <p style={{ fontSize: '14.5px', color: '#1e362c', lineHeight: 1.55, marginBottom: '16px' }}>
                  Pahadíly connects travelers with verified local companions, native hosts, and licensed trek guides across Himachal Pradesh.
                </p>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontSize: '13.5px', color: '#143d2d', fontWeight: 600, marginBottom: '6px' }}>
                    🤝 Our Pilot Model
                  </div>
                  <p style={{ fontSize: '13px', color: '#536b5e', lineHeight: 1.5, margin: 0 }}>
                    Choose a destination → Select a local provider → Submit an experience request → Provider confirms availability based on real mountain conditions.
                  </p>
                </div>
              </div>
            )}

            {activeModal.type === 'explore' && (
              <div>
                <p style={{ fontSize: '14.5px', color: '#1e362c', lineHeight: 1.5, marginBottom: '14px' }}>
                  Select a valley to discover authentic local trails and heritage:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {PILOT_VALLEYS.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => openValley(v.name)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(10, 37, 27, 0.08)',
                        borderRadius: '10px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#143d2d', fontSize: '14px' }}>
                        {v.name}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#536b5e' }}>
                        {v.altitude} →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Core Mission Footer */}
            <div
              style={{
                borderTop: '1px solid rgba(10, 37, 27, 0.08)',
                paddingTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                color: '#536b5e',
              }}
            >
              <span>Explore responsibly. Help communities earn.</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  backgroundColor: '#143d2d',
                  color: '#ffffff',
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;