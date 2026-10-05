import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createBooking } from "../../lib/api";

function LocalProfileModal({ local, onClose }) {
  const { user, showToast, setMyBookingsOpen } = useAuth();
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryDate, setInquiryDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [message, setMessage] = useState("");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (user) {
      if (!travelerName) setTravelerName(user.full_name || "");
      if (!travelerEmail) setTravelerEmail(user.email || "");
    }
  }, [user]);

  // Set default travel date
  useEffect(() => {
    if (!inquiryDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setInquiryDate(tomorrow.toISOString().split("T")[0]);
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!local) return null;

  const initials = local.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        booking_type: "local",
        item_id: Number(local.id) || 1,
        item_title: `${local.name} (${local.role})`,
        item_image: local.image || null,
        traveler_name: travelerName || user?.full_name || "Mountain Traveler",
        traveler_email: travelerEmail || user?.email || "traveler@pahadily.com",
        travel_date: inquiryDate,
        guests: String(guests),
        total_price: local.price,
        message: message || `Visiting ${local.location} and would love to connect.`,
      };

      const res = await createBooking(payload);
      setBookingResult(res);
      setInquirySent(true);
      showToast(`Inquiry sent to ${local.name.split(" ")[0]}!`);
    } catch (err) {
      showToast(err.message || "Could not submit inquiry", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="local-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="local-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="local-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="local-modal-header">
          <div className="local-modal-avatar-wrap">
            {local.image ? (
              <img src={local.image} alt={local.name} className="local-modal-avatar" />
            ) : (
              <div
                className="local-modal-avatar-fallback"
                style={{ background: local.gradient || "linear-gradient(135deg, #174231, #78caa0)" }}
              >
                <span>{initials}</span>
              </div>
            )}
            {local.verified && (
              <span className="local-modal-badge" title="Pahadíly Verified Local">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>

          <div className="local-modal-header-info">
            <div className="local-modal-title-row">
              <h2 className="local-modal-name">{local.name}</h2>
              <div className="local-modal-rating">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="rating-score">{local.rating}</span>
                <span className="rating-count">({local.reviews} verified reviews)</span>
              </div>
            </div>

            <div className="local-modal-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{local.location}</span>
            </div>

            <div className="local-modal-badges-row">
              <span className="local-badge-pill role">{local.role}</span>
              <span className="local-badge-pill lang">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {local.lang}
              </span>
              {local.certified && (
                <span className="local-badge-pill cert">Certified High-Altitude Guide</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="local-modal-body">
          {/* Left: Bio & Details */}
          <div className="local-modal-left">
            <section className="local-modal-section">
              <h3 className="local-section-heading">About {local.name.split(" ")[0]}</h3>
              <p className="local-bio-text">
                {local.bio ||
                  `Born and raised in the heart of Himachal Pradesh, ${local.name.split(" ")[0]} has been welcoming travelers and exploring quiet trails for over 6 years. With deep knowledge of native traditions, foraging paths, and secret vistas, journeys with ${local.name.split(" ")[0]} are authentic, heartwarming, and slow.`}
              </p>
            </section>

            <section className="local-modal-section">
              <h3 className="local-section-heading">What I Specialize In</h3>
              <div className="local-specialties-grid">
                {(local.tags || ["Village Trails", "Local Lore", "Safe Guiding"]).map((tag) => (
                  <div key={tag} className="specialty-item">
                    <span className="specialty-dot">🌲</span>
                    <span className="specialty-name">{tag}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="local-modal-section">
              <h3 className="local-section-heading">Host Highlights</h3>
              <div className="local-highlights-list">
                <div className="highlight-item">
                  <span className="highlight-icon">⏱️</span>
                  <div>
                    <strong>Response Time:</strong> Within 2 hours
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">🏔️</span>
                  <div>
                    <strong>Local Knowledge:</strong> Native resident (10+ years)
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">🤝</span>
                  <div>
                    <strong>Pahadíly Promise:</strong> 100% direct remuneration to host
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Booking / Inquiry Box */}
          <div className="local-modal-right">
            <div className="local-booking-card">
              <div className="booking-price-header">
                <div>
                  <span className="price-tag">{local.price}</span>
                  <span className="price-unit"> {local.unit}</span>
                </div>
                <span className="price-note">All-inclusive host fee</span>
              </div>

              {inquirySent ? (
                <div className="inquiry-success-message">
                  <div className="success-check-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4>Inquiry Sent Successfully!</h4>
                  <p>
                    {local.name.split(" ")[0]} will review your request and get back to you within 2 hours.
                  </p>
                  {bookingResult && (
                    <div className="inquiry-ref-box">
                      <span>Booking Ref: </span>
                      <strong>#PAH-{bookingResult.id.toString().padStart(4, "0")}</strong>
                    </div>
                  )}
                  <div className="inquiry-success-buttons">
                    <button
                      type="button"
                      className="btn-view-bookings"
                      onClick={() => {
                        onClose();
                        setMyBookingsOpen(true);
                      }}
                    >
                      View in My Bookings
                    </button>
                    <button
                      type="button"
                      className="send-another-btn"
                      onClick={() => setInquirySent(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="local-inquiry-form">
                  <div className="form-group">
                    <label>Preferred Travel Date</label>
                    <input
                      type="date"
                      required
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      className="inquiry-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Group Size</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="inquiry-input"
                    >
                      <option value="1">1 Solo Traveler</option>
                      <option value="2">2 Travelers (Couple/Friends)</option>
                      <option value="3-4">3 - 4 Travelers (Small Group)</option>
                      <option value="5+">5+ Travelers (Family/Group)</option>
                    </select>
                  </div>

                  {!user && (
                    <>
                      <div className="form-group">
                        <label>Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maya Verma"
                          value={travelerName}
                          onChange={(e) => setTravelerName(e.target.value)}
                          className="inquiry-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Your Email</label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={travelerEmail}
                          onChange={(e) => setTravelerEmail(e.target.value)}
                          className="inquiry-input"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Message / What are you looking for?</label>
                    <textarea
                      rows="3"
                      placeholder={`Hi ${local.name.split(" ")[0]}, we are visiting ${local.location.split(",")[0]} and would love to connect...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="inquiry-input inquiry-textarea"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="local-inquiry-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <span>Connect with {local.name.split(" ")[0]}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>

                  <div className="booking-trust-points">
                    <small>🛡️ No upfront payment required to inquire</small>
                    <small>🌿 Direct support to native mountain families</small>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalProfileModal;
