import { useState, useEffect, useCallback } from "react";

/**
 * NearbySlideshow
 * Opens when the user clicks "Book Stay" on a place card.
 * Shows:
 *  1. Auto-playing slideshow of nearby locations (with distance)
 *  2. Available stay options list (editable via admin/backend)
 *  3. A CTA to proceed to booking
 */
function NearbySlideshow({ isOpen, onClose, place, onProceedToBook }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);

  // Fallback nearby locations if none from backend
  const FALLBACK_NEARBY = [
    {
      name: "Jalori Pass",
      distance: "12 km",
      image: "/images/destinations/jibhi.jpg",
      description: "Ancient mountain pass at 3,120m with panoramic Himalayan views",
      type: "Trekking Spot",
    },
    {
      name: "Great Himalayan National Park",
      distance: "8 km",
      image: "/images/destinations/tirthan-valley.jpg",
      description: "UNESCO World Heritage Site — pristine alpine forests and wildlife",
      type: "National Park",
    },
    {
      name: "Serolsar Lake",
      distance: "18 km",
      image: "/images/destinations/parvati-valley.jpg",
      description: "Sacred glacial lake surrounded by dense oak and rhododendron forests",
      type: "Sacred Lake",
    },
    {
      name: "Chehni Kothi",
      distance: "5 km",
      image: "/images/destinations/pangi-valley.jpg",
      description: "Ancient 1,500-year-old heritage stone tower from Kullu kingdom",
      type: "Heritage Site",
    },
  ];

  // Fallback stay options if none from backend
  const FALLBACK_STAY_OPTIONS = [
    {
      name: "Deluxe Riverside Tent",
      price: "₹1,800",
      unit: "/night",
      distance: "0.2 km from main road",
      capacity: "2 guests",
      amenities: ["Bonfire", "Attached Bath", "Breakfast Included"],
    },
    {
      name: "Heritage Wooden Cottage",
      price: "₹2,500",
      unit: "/night",
      distance: "0.5 km from main road",
      capacity: "4 guests",
      amenities: ["Mountain View", "Kitchen Access", "Guided Treks"],
    },
    {
      name: "Premium Alpine Suite",
      price: "₹3,800",
      unit: "/night",
      distance: "1.2 km from main road",
      capacity: "2 guests",
      amenities: ["Private Deck", "Jacuzzi", "All Meals Included"],
    },
  ];

  const nearbyLocations =
    place?.nearby_locations && place.nearby_locations.length > 0
      ? place.nearby_locations
      : FALLBACK_NEARBY;

  const stayOptions =
    place?.stay_options && place.stay_options.length > 0
      ? place.stay_options
      : FALLBACK_STAY_OPTIONS;

  const totalSlides = nearbyLocations.length;

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideIndex((i) => (i + 1) % totalSlides);
    setTimeout(() => setIsAnimating(false), 400);
  }, [totalSlides, isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideIndex((i) => (i - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAnimating(false), 400);
  }, [totalSlides, isAnimating]);

  // Auto-advance slideshow every 4 seconds
  useEffect(() => {
    if (!isOpen || isPaused) return;
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [isOpen, isPaused, goToNext]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSlideIndex(0);
      setIsPaused(false);
      setSelectedOptionIdx(null);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, goToNext, goToPrev]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !place) return null;

  const currentSlide = nearbyLocations[slideIndex];

  return (
    <div className="ns-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Nearby Locations">
      <div className="ns-container" onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button className="ns-close-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Left Panel: Slideshow */}
        <div
          className="ns-slideshow-panel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Image */}
          <div
            className="ns-slide-bg"
            style={{
              backgroundImage: `url('${currentSlide.image || "/images/destinations/tirthan-valley.jpg"}')`,
            }}
            key={slideIndex}
          />
          <div className="ns-slide-gradient" />

          {/* Top Badge */}
          <div className="ns-slide-header">
            <span className="ns-slide-badge">📍 NEARBY ATTRACTIONS</span>
            <span className="ns-stay-name">{place.name}</span>
          </div>

          {/* Slide Content */}
          <div className="ns-slide-content">
            <span className="ns-slide-type">{currentSlide.type || "Nearby"}</span>
            <h2 className="ns-slide-title">{currentSlide.name}</h2>
            <div className="ns-slide-distance">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{currentSlide.distance} from this stay</span>
            </div>
            <p className="ns-slide-desc">{currentSlide.description}</p>
          </div>

          {/* Slideshow Controls */}
          <div className="ns-slide-controls">
            <button className="ns-nav-btn ns-prev" onClick={goToPrev} aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="ns-dots">
              {nearbyLocations.map((_, i) => (
                <button
                  key={i}
                  className={`ns-dot${i === slideIndex ? " active" : ""}`}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button className="ns-nav-btn ns-next" onClick={goToNext} aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="ns-progress-bar">
            <div
              className={`ns-progress-fill${isPaused ? " paused" : ""}`}
              key={`${slideIndex}-${isPaused}`}
            />
          </div>
        </div>

        {/* Right Panel: Stay Options */}
        <div className="ns-options-panel">
          <div className="ns-options-header">
            <h3 className="ns-options-title">Available Stay Options</h3>
            <p className="ns-options-subtitle">
              Select your perfect retreat at <strong>{place.name}</strong>
            </p>
          </div>

          <div className="ns-options-list">
            {stayOptions.map((opt, idx) => (
              <div
                key={idx}
                className={`ns-option-card${selectedOptionIdx === idx ? " selected" : ""}`}
                onClick={() => setSelectedOptionIdx(idx)}
                role="radio"
                aria-checked={selectedOptionIdx === idx}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedOptionIdx(idx); }}
              >
                {/* Selection checkmark */}
                <div className={`ns-option-check${selectedOptionIdx === idx ? " checked" : ""}`}>
                  {selectedOptionIdx === idx && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <div className="ns-option-top">
                  <div>
                    <h4 className="ns-option-name">{opt.name}</h4>
                    <div className="ns-option-meta">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{opt.distance || "On-site"}</span>
                      {opt.capacity && (
                        <>
                          <span className="ns-meta-sep">•</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span>{opt.capacity}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ns-option-price-wrap">
                    <span className="ns-option-price">{opt.price}</span>
                    <span className="ns-option-unit">{opt.unit || "/night"}</span>
                  </div>
                </div>

                {opt.amenities && opt.amenities.length > 0 && (
                  <div className="ns-option-amenities">
                    {opt.amenities.map((a, ai) => (
                      <span key={ai} className="ns-amenity-pill">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Proceed CTA */}
          <div className="ns-cta-area">
            {selectedOptionIdx !== null ? (
              <div className="ns-cta-info">
                <span className="ns-cta-badge">✓ Selected: {stayOptions[selectedOptionIdx].name}</span>
                <p className="ns-cta-note">
                  {stayOptions[selectedOptionIdx].price}{stayOptions[selectedOptionIdx].unit || "/night"} • Direct booking • Zero middleman fees
                </p>
              </div>
            ) : (
              <div className="ns-cta-info">
                <span className="ns-cta-badge">⚡ Instant Confirmation</span>
                <p className="ns-cta-note">
                  Select a stay option above to continue
                </p>
              </div>
            )}
            <button
              className={`ns-proceed-btn${selectedOptionIdx === null ? " disabled" : ""}`}
              disabled={selectedOptionIdx === null}
              onClick={() => {
                if (selectedOptionIdx === null) return;
                const selected = stayOptions[selectedOptionIdx];
                onClose();
                // Merge selected option details into place for booking modal
                onProceedToBook({
                  ...place,
                  name: `${place.name} — ${selected.name}`,
                  price: selected.price || place.price,
                  unit: selected.unit || "/night",
                });
              }}
            >
              <span>
                {selectedOptionIdx !== null
                  ? `Book — ${stayOptions[selectedOptionIdx].price}${stayOptions[selectedOptionIdx].unit || "/night"}`
                  : "Select a Stay Option"}
              </span>
              {selectedOptionIdx !== null && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NearbySlideshow;
