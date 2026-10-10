import { useState } from "react";

function StaysNearSection({ destination, onSelectStay }) {
  const [wishlistedIds, setWishlistedIds] = useState([]);

  if (!destination) return null;

  const stays = Array.isArray(destination.stays) && destination.stays.length > 0
    ? destination.stays
    : [];

  if (stays.length === 0) return null;

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="stays-near-section" aria-label={`Homestays and cottages near ${destination.name}`}>
      {/* Section Header */}
      <div className="section-title-strip">
        <div className="section-title-left">
          <div className="section-icon-badge stay">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h2 className="section-heading-text">Stay Near This Destination</h2>
            <p className="section-subheading-text">
              Find homestays, cottages and camps near {destination.name} for a comfortable stay
            </p>
          </div>
        </div>

        <button
          type="button"
          className="section-view-all-link"
          onClick={() => {
            const first = stays[0];
            if (first) onSelectStay(first);
          }}
        >
          <span>View All Stays</span>
          <span className="arrow">→</span>
        </button>
      </div>

      {/* 4 Stays Grid */}
      <div className="stays-near-grid">
        {stays.map((stay) => {
          const isWish = wishlistedIds.includes(stay.id);
          const thumb = stay.images?.[0] || stay.image || "/images/destinations/tirthan-valley.jpg";

          return (
            <article
              key={stay.id}
              className="stay-card-ref"
              onClick={() => onSelectStay(stay)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectStay(stay);
                }
              }}
            >
              {/* Media with Wishlist & Price Tag */}
              <div className="stay-card-media">
                <img
                  src={thumb}
                  alt={stay.name}
                  className="stay-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
                  }}
                />
                <div className="stay-card-media-overlay" />

                {/* Wishlist Heart */}
                <button
                  type="button"
                  className={`stay-card-wish-btn${isWish ? " active" : ""}`}
                  onClick={(e) => toggleWishlist(e, stay.id)}
                  aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill={isWish ? "#e11d48" : "none"} stroke={isWish ? "#e11d48" : "#ffffff"} strokeWidth="2.2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                {/* Price Pill */}
                <div className="stay-card-price-pill">
                  <span className="p-amount">{stay.price}</span>
                  <span className="p-unit">{stay.unit || "/ night"}</span>
                </div>
              </div>

              {/* Body */}
              <div className="stay-card-body">
                <h3 className="stay-card-name">{stay.name}</h3>

                {/* Rating & Reviews */}
                <div className="stay-card-rating-row">
                  <span className="star">★</span>
                  <span className="score">{stay.rating || 4.8}</span>
                  <span className="count">({stay.reviewsCount || 20})</span>
                </div>

                {/* Location */}
                <div className="stay-card-loc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{stay.subLocation || destination.name}</span>
                </div>

                {/* Amenities */}
                {Array.isArray(stay.amenities) && stay.amenities.length > 0 && (
                  <div className="stay-card-amenities-row">
                    {stay.amenities.map((am, i) => (
                      <span key={i} className="stay-amenity-chip">
                        {am === "WiFi" && "📶"}
                        {am === "Meals" && "🍽️"}
                        {am === "Parking" && "🚗"}
                        {am === "Bonfire" && "🔥"}
                        {am === "Garden" && "🌿"}
                        {am === "Trekking" && "🥾"}
                        {am === "Balcony" && "🏔️"}
                        {!["WiFi", "Meals", "Parking", "Bonfire", "Garden", "Trekking", "Balcony"].includes(am) && "✓"}{" "}
                        {am}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Action Button */}
                <button
                  type="button"
                  className="stay-card-cta-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStay(stay);
                  }}
                >
                  <span>View Details</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default StaysNearSection;
