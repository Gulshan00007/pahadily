import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPlaces } from "../lib/api";

const FALLBACK_DESTINATIONS = [
  {
    id: 1,
    name: "Tirthan Valley River Sanctuary",
    tagline: "Rivers, forests and quiet trails",
    image: "/images/destinations/tirthan-valley.jpg",
    price: "₹2,400",
    unit: "/night",
  },
  {
    id: 2,
    name: "Pangi Valley Remote Hamlet",
    tagline: "Raw beauty for real explorers",
    image: "/images/destinations/pangi-valley.jpg",
    price: "₹1,800",
    unit: "/night",
  },
  {
    id: 3,
    name: "Jibhi Pine Woods Retreat",
    tagline: "Small place, big experiences",
    image: "/images/destinations/jibhi.jpg",
    price: "₹2,100",
    unit: "/night",
  }
];

function FeaturedDestinations() {
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const { openBooking } = useAuth();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const places = await getPlaces();
        if (places && places.length > 0) {
          setDestinations(places.slice(0, 3));
        }
      } catch (err) {
        console.warn("Using fallback featured places:", err);
      }
    }
    loadFeatured();
  }, []);

  return (
    <section className="featured-section" id="explore">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div className="section-header-text">
            <span className="section-eyebrow">FEATURED SANCTUARIES</span>
            <h2 className="section-title">Handpicked for a Deeper Journey</h2>
          </div>

          <a href="/explore" className="view-all-btn">
            View All Stays <span className="btn-arrow">→</span>
          </a>
        </div>

        {/* Destination Cards Grid */}
        <div className="destination-cards-grid">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <a
                href={dest.region ? `/book-stay?valley=${dest.region}` : "/explore"}
                className="destination-img-wrap"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="destination-img"
                  loading="lazy"
                />
                <div className="destination-gradient-overlay"></div>
                {dest.price && (
                  <span className="home-dest-price-pill">
                    {dest.price} {dest.unit || "/night"}
                  </span>
                )}
              </a>

              <div className="destination-card-content">
                <a
                  href={dest.region ? `/book-stay?valley=${dest.region}` : "/explore"}
                  className="destination-text"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3 className="destination-name">{dest.name}</h3>
                  <p className="destination-desc">{dest.tagline}</p>
                </a>

                <a
                  href={dest.region ? `/book-stay?valley=${dest.region}` : "/explore"}
                  className="home-book-stay-btn"
                  aria-label={`Book stay in ${dest.name}`}
                  title={`View homestays and camps in ${dest.name}`}
                >
                  <span>Book Stay</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDestinations;
