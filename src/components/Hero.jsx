import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/book-stay?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/book-stay');
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-media-wrapper">
        <img
          src="/images/hero/himachal-hero.jpg"
          alt="Breathtaking Himalayan mountain peaks and green valley"
          className="hero-backdrop-img"
        />
        <div className="hero-gradient-overlay"></div>
      </div>

      {/* Floating handwritten note on the right */}
      <div className="hero-script-note" aria-hidden="true">
        <span className="script-line-1">More</span>
        <span className="script-line-2">Mountains</span>
        <span className="script-line-3">More Meaning</span>
      </div>

      <div className="hero-container">
        <div className="hero-content-col">
          <p className="hero-eyebrow">HIDDEN HIMALAYAS AWAIT</p>

          <h1 className="hero-heading">
            Discover
            <span className="hero-heading-rare">Rare Places</span>
          </h1>

          <p className="hero-lead">
            Travel deeper with locals,
            <br />
            not just guidebooks.
          </p>

          {/* Search Box */}
          <form className="hero-search-bar" onSubmit={handleSearch}>
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
              placeholder="Search homestays, campsites, valleys..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">
              Explore <span className="btn-arrow">→</span>
            </button>
          </form>

          {/* Quick Categories */}
          <div className="hero-categories">
            <a href="/book-stay?type=homestay" className="hero-cat-item">
              <div className="cat-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="cat-label">Homestays</span>
            </a>

            <a href="/book-stay?type=campsite" className="hero-cat-item">
              <div className="cat-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <span className="cat-label">Campsites</span>
            </a>

            <a href="/experiences" className="hero-cat-item">
              <div className="cat-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="2" />
                  <path d="m9 20 3-6 2 3 3 5" />
                  <path d="m6 10 3-1 3 3 4-2" />
                  <line x1="18" y1="12" x2="20" y2="21" />
                </svg>
              </div>
              <span className="cat-label">Experiences</span>
            </a>

            <a href="/locals" className="hero-cat-item">
              <div className="cat-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="cat-label">Guides</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;