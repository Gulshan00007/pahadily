import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Hero() {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-media-wrapper">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
          onError={(e) => { e.currentTarget.src = "/images/hero/himachal-hero.jpg"; }}
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
        <div className="hero-content-col" style={{ maxWidth: "640px" }}>
          <p className="hero-eyebrow" style={{ letterSpacing: "0.15em", color: "var(--color-sage-light)", fontWeight: 700 }}>
            HIMALAYAN LOCAL-DISCOVERY PILOT
          </p>

          <h1 className="hero-heading" style={{ lineHeight: 1.08, marginBottom: "16px" }}>
            Discover
            <span className="hero-heading-rare" style={{ display: "block", color: "#ffffff" }}>
              Rare Places.
            </span>
          </h1>

          <p className="hero-lead" style={{ fontSize: "20px", color: "rgba(255,255,255,0.92)", fontWeight: 500, lineHeight: 1.45, marginBottom: "28px" }}>
            Travel deeper with locals, not just guidebooks.
          </p>

          {/* Prominent Search Bar */}
          <form className="hero-search-bar" onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
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

          {/* Primary & Secondary Call to Actions */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "28px" }}>
            <Link
              to="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "13px 26px",
                borderRadius: "9999px",
                backgroundColor: "var(--color-forest-medium)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                boxShadow: "var(--shadow-md)",
                transition: "all 0.2s ease",
              }}
            >
              <span>Explore Places</span>
              <span>→</span>
            </Link>

            <Link
              to="/locals"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "13px 24px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(8px)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "15px",
                border: "1.5px solid rgba(255, 255, 255, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              <span>🤝 Find a Local Companion</span>
            </Link>
          </div>

          {/* Quick Valley Discovery Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            <span style={{ fontWeight: 600, color: "var(--color-sand, #d9c5a3)" }}>Pilot Valleys:</span>
            <Link to="/destinations/tirthan" style={{ color: "#ffffff", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: "9999px" }}>
              Tirthan
            </Link>
            <Link to="/destinations/jibhi" style={{ color: "#ffffff", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: "9999px" }}>
              Jibhi
            </Link>
            <Link to="/destinations/shangarh" style={{ color: "#ffffff", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: "9999px" }}>
              Shangarh
            </Link>
            <Link to="/destinations/naggar" style={{ color: "#ffffff", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: "9999px" }}>
              Naggar
            </Link>
            <Link to="/destinations/lug-valley" style={{ color: "#ffffff", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: "9999px" }}>
              Lug Valley
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;