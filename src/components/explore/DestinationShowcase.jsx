import { useState, useEffect } from "react";

function DestinationShowcase({ destination, onOpenMap }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Reset image index when destination changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [destination?.id]);

  if (!destination) return null;

  const images = Array.isArray(destination.images) && destination.images.length > 0
    ? destination.images
    : [destination.image || "/images/destinations/tirthan-valley.jpg"];

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="dest-showcase-section" aria-label={`Featured destination: ${destination.name}`}>
      <div className="dest-showcase-card">
        {/* Left Column: Image Slideshow & Thumbnails */}
        <div className="dest-showcase-gallery-col">
          <div className="dest-main-img-wrap">
            <img
              src={images[activeImageIdx]}
              alt={`${destination.name} - View ${activeImageIdx + 1}`}
              className="dest-main-img"
              key={activeImageIdx}
              loading="lazy"
            />
            <div className="dest-img-gradient-overlay" />

            {/* Popular Destination Pill */}
            <div className="dest-badge-pill-popular">
              <span className="badge-flame-icon">🔥</span>
              <span>{destination.badge || "Popular Destination"}</span>
            </div>

            {/* 360 / Expand Icon Button */}
            <button
              type="button"
              className="dest-btn-360"
              title="Explore panoramic views"
              aria-label="Panoramic view mode"
              onClick={nextImage}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="dest-nav-arrow left"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="dest-nav-arrow right"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="dest-thumbs-carousel" aria-label="Destination photo gallery">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`dest-thumb-item${idx === activeImageIdx ? " active" : ""}`}
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Destination Details & Metadata */}
        <div className="dest-showcase-info-col">
          {/* Breadcrumb & Wishlist */}
          <div className="dest-top-meta-row">
            <nav className="dest-breadcrumb" aria-label="Breadcrumb">
              <span>Explore</span>
              <span className="sep">&gt;</span>
              <span>Himachal Pradesh</span>
              <span className="sep">&gt;</span>
              <span className="current">{destination.name}</span>
            </nav>

            <button
              type="button"
              className={`dest-wishlist-btn${isWishlisted ? " active" : ""}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "#e11d48" : "none"} stroke={isWishlisted ? "#e11d48" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Title & Pin Location */}
          <h1 className="dest-main-title">{destination.name}</h1>
          <div className="dest-pin-loc">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{destination.location || "Himachal Pradesh, India"}</span>
          </div>

          {/* Description */}
          <p className="dest-narrative-desc">{destination.description}</p>

          {/* 3 Info Cards: Best Time, Ideal For, Elevation */}
          <div className="dest-info-cards-grid">
            <div className="dest-info-box">
              <span className="dest-info-icon" aria-hidden="true">⏱️</span>
              <div className="dest-info-text">
                <span className="dest-info-label">Best Time</span>
                <span className="dest-info-value">{destination.bestTime || "Mar - Jun, Sep - Nov"}</span>
              </div>
            </div>

            <div className="dest-info-box">
              <span className="dest-info-icon" aria-hidden="true">🧭</span>
              <div className="dest-info-text">
                <span className="dest-info-label">Ideal For</span>
                <span className="dest-info-value">{destination.idealFor || "Nature, Trekking, Local Culture"}</span>
              </div>
            </div>

            <div className="dest-info-box">
              <span className="dest-info-icon" aria-hidden="true">⛰️</span>
              <div className="dest-info-text">
                <span className="dest-info-label">Elevation</span>
                <span className="dest-info-value">{destination.elevation || "~1,600 m"}</span>
              </div>
            </div>
          </div>

          {/* Mini Topographic Map Box */}
          <div className="dest-mini-map-card">
            <div className="mini-map-topo-bg">
              <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#dcefe3" />
                    <stop offset="100%" stopColor="#c5e3d1" />
                  </linearGradient>
                </defs>
                <rect width="300" height="120" fill="url(#mapGrad)" />
                {/* Elevation Contours */}
                <path d="M0 30 Q75 10 150 25 T300 15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                <path d="M0 60 Q90 40 180 55 T300 45" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <path d="M0 90 Q60 80 150 95 T300 75" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                {/* River line */}
                <path d="M20 0 Q60 40 100 70 Q140 100 180 120" fill="none" stroke="#70b4c8" strokeWidth="2.5" opacity="0.7" />
              </svg>
            </div>

            <div className="mini-map-pin-badge">
              <span className="pin-dot-red" />
              <span className="pin-title">{destination.name}</span>
            </div>

            <button
              type="button"
              className="mini-map-view-btn"
              onClick={onOpenMap}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>View on Map</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DestinationShowcase;
