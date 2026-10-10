import { useState } from "react";

function PlacesNearbySection({ destination, onSelectAttraction }) {
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  if (!destination) return null;

  const attractions = Array.isArray(destination.nearbyAttractions) && destination.nearbyAttractions.length > 0
    ? destination.nearbyAttractions
    : [];

  if (attractions.length === 0) return null;

  const handleAttractionClick = (attraction) => {
    setSelectedAttraction(attraction);
    if (onSelectAttraction) onSelectAttraction(attraction);
  };

  return (
    <section className="places-nearby-section" aria-label={`Attractions around ${destination.name}`}>
      {/* Section Header */}
      <div className="section-title-strip">
        <div className="section-title-left">
          <div className="section-icon-badge mountain">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <div>
            <h2 className="section-heading-text">Places to Explore Nearby</h2>
            <p className="section-subheading-text">
              Discover waterfalls, villages, viewpoints and other attractions around {destination.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="section-view-all-link"
          onClick={() => {
            const first = attractions[0];
            if (first) handleAttractionClick(first);
          }}
        >
          <span>View All Attractions</span>
          <span className="arrow">→</span>
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="places-nearby-grid">
        {attractions.map((attraction) => (
          <article
            key={attraction.id}
            className="attraction-card"
            onClick={() => handleAttractionClick(attraction)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleAttractionClick(attraction);
              }
            }}
          >
            {/* Media with Distance Pill */}
            <div className="attraction-media">
              <img
                src={attraction.image}
                alt={attraction.name}
                className="attraction-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="attraction-img-overlay" />
              <div className="attraction-distance-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{attraction.distance}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="attraction-body">
              <div className="attraction-cat-row">
                <div className="attraction-cat-icon">
                  {attraction.icon === "mountain" && "⛰️"}
                  {attraction.icon === "lake" && "🌊"}
                  {attraction.icon === "park" && "🌲"}
                  {attraction.icon === "fort" && "🏰"}
                  {!["mountain", "lake", "park", "fort"].includes(attraction.icon) && "📍"}
                </div>
                <div className="attraction-title-block">
                  <h3 className="attraction-name">{attraction.name}</h3>
                  <span className="attraction-cat-tag">{attraction.category}</span>
                </div>
              </div>

              <p className="attraction-desc">{attraction.description}</p>

              <button
                type="button"
                className="attraction-view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttractionClick(attraction);
                }}
              >
                <span>View Details</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Simple Details Popup for Attraction */}
      {selectedAttraction && (
        <div className="attraction-modal-backdrop" onClick={() => setSelectedAttraction(null)}>
          <div className="attraction-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="attraction-modal-close" onClick={() => setSelectedAttraction(null)} aria-label="Close">
              ✕
            </button>
            <img
              src={selectedAttraction.image}
              alt={selectedAttraction.name}
              className="attraction-modal-img"
              loading="lazy"
            />
            <div className="attraction-modal-content">
              <span className="attraction-modal-dist">📍 {selectedAttraction.distance} from {destination.name}</span>
              <h3 className="attraction-modal-title">{selectedAttraction.name}</h3>
              <span className="attraction-modal-cat">{selectedAttraction.category}</span>
              <p className="attraction-modal-desc">{selectedAttraction.description}</p>
              <div className="attraction-modal-tips">
                <strong>Himalayan Travel Tip:</strong> Best visited during early morning or sunset for golden lighting and serene crowd-free mountain solitude. Ask your native homestay host to arrange a local walking guide.
              </div>
              <button
                type="button"
                className="attraction-modal-done-btn"
                onClick={() => setSelectedAttraction(null)}
              >
                Done Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PlacesNearbySection;
