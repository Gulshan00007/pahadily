import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Calendar, ChevronDown, Footprints } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [experienceType, setExperienceType] = useState('');
  const [travelDate, setTravelDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('q', destination.trim());
    if (experienceType.trim()) params.set('category', experienceType.trim());
    if (travelDate) params.set('date', travelDate);

    navigate(`/explore${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="hero-wrapper" style={{ padding: '24px 0 20px 0' }}>
      <div className="container">
        {/* Main Hero Card Container */}
        <div
          className="hero-card"
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            minHeight: '460px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(28px, 5vw, 48px)',
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(10, 37, 27, 0.08)',
          }}
        >
          {/* Panoramic Himalayan Background Image */}
          <img
            src="/images/hero/himachal-hero.jpg"
            alt="Himachal Pradesh Himalayan Valley"
            className="hero-bg-img"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
              zIndex: 1,
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Gentle cinematic overlay for clean text legibility without dimming the peaks */}
          <div
            className="hero-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(10, 37, 27, 0.42) 0%, rgba(10, 37, 27, 0.22) 50%, rgba(10, 37, 27, 0.65) 100%)',
              zIndex: 2,
            }}
          />

          {/* Hero Content */}
          <div className="hero-content" style={{ position: 'relative', zIndex: 3, maxWidth: '640px' }}>
            {/* Location Label: KULLU, HIMACHAL PRADESH */}
            <div
              className="hero-location-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#FAF8F2',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              <MapPin size={14} color="#8EE49A" />
              <span>Kullu, Himachal Pradesh</span>
            </div>

            {/* Headline with signature soft green brush underline */}
            <h1
              className="hero-title"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.4rem, 4.6vw, 3.8rem)',
                fontWeight: '700',
                lineHeight: '1.14',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                textShadow: '0 2px 12px rgba(0,0,0,0.25)',
              }}
            >
              Discover Himachal{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                differently.
                <svg
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: '-6px',
                    width: '100%',
                    height: '10px',
                    overflow: 'visible',
                  }}
                  viewBox="0 0 120 14"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 9C35 15 85 15 117 5"
                    stroke="#8EE49A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p
              className="hero-subtitle"
              style={{
                fontSize: 'clamp(14.5px, 1.8vw, 16.5px)',
                lineHeight: '1.6',
                color: 'rgba(250, 248, 242, 0.95)',
                maxWidth: '540px',
                marginBottom: '36px',
                textShadow: '0 1px 6px rgba(0,0,0,0.3)',
              }}
            >
              Find hidden places. Meet local people. Experience the mountains beyond the usual tourist trail.
            </p>
          </div>

          {/* Floating Horizontal Search Panel (Full Pill) */}
          <form
            className="hero-search-panel"
            onSubmit={handleSearch}
            style={{
              position: 'relative',
              zIndex: 4,
              backgroundColor: '#FFFFFF',
              borderRadius: '9999px',
              padding: '8px 10px 8px 18px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 12px 36px rgba(10, 37, 27, 0.22)',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              marginTop: 'auto',
              width: '100%',
              maxWidth: '920px',
            }}
          >
            {/* Field 1: Where to go? */}
            <div
              className="search-item"
              style={{
                flex: 1.3,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(32, 85, 64, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin size={17} color="#205540" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#10251D',
                    lineHeight: 1.2,
                  }}
                >
                  Where to go?
                </div>
                <input
                  type="text"
                  placeholder="e.g. Jibhi, Tirthan, Shoja"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#69766D',
                    backgroundColor: 'transparent',
                    width: '100%',
                    padding: '2px 0 0 0',
                  }}
                />
              </div>
            </div>

            {/* Subtle Divider */}
            <div
              className="search-divider"
              style={{
                width: '1px',
                height: '34px',
                backgroundColor: 'rgba(16, 37, 29, 0.1)',
                flexShrink: 0,
              }}
            />

            {/* Field 2: Experience type */}
            <div
              className="search-item"
              style={{
                flex: 1.2,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(32, 85, 64, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Footprints size={17} color="#205540" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#10251D',
                    lineHeight: 1.2,
                  }}
                >
                  <span>Experience type</span>
                  <ChevronDown size={14} color="#69766D" />
                </div>
                <input
                  type="text"
                  placeholder="Trek, Village, Culture"
                  value={experienceType}
                  onChange={(e) => setExperienceType(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#69766D',
                    backgroundColor: 'transparent',
                    width: '100%',
                    padding: '2px 0 0 0',
                  }}
                />
              </div>
            </div>

            {/* Subtle Divider */}
            <div
              className="search-divider"
              style={{
                width: '1px',
                height: '34px',
                backgroundColor: 'rgba(16, 37, 29, 0.1)',
                flexShrink: 0,
              }}
            />

            {/* Field 3: Travel date */}
            <div
              className="search-item"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(32, 85, 64, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Calendar size={17} color="#205540" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#10251D',
                    lineHeight: 1.2,
                  }}
                >
                  Travel date
                </div>
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  placeholder="Select date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#69766D',
                    backgroundColor: 'transparent',
                    width: '100%',
                    padding: '2px 0 0 0',
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="hero-search-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: '#0A251B',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '14.5px',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background-color 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#205540';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0A251B';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Responsive media styles for mobile search panel stacking */}
      <style>{`
        @media (max-width: 860px) {
          .hero-search-panel {
            flex-direction: column !important;
            border-radius: 20px !important;
            padding: 16px !important;
            gap: 10px !important;
          }
          .hero-search-panel .search-item {
            width: 100% !important;
            padding: 8px 6px !important;
          }
          .hero-search-panel .search-divider {
            display: none !important;
          }
          .hero-search-panel .hero-search-btn {
            width: 100% !important;
            margin-top: 6px !important;
          }
        }
      `}</style>
    </section>
  );
}