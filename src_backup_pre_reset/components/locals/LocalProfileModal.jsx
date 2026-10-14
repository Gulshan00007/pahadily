import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createBooking, getProviderBusyDates } from "../../lib/api";

function LocalProfileModal({ local, onClose }) {
  const { user, showToast, setMyBookingsOpen } = useAuth();
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryDate, setInquiryDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("full_day"); // 'full_day' | 'morning' | 'afternoon'
  const [guests, setGuests] = useState("2");
  const [activityType, setActivityType] = useState("Village & Trail Exploration");
  const [message, setMessage] = useState("");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [busyDates, setBusyDates] = useState([]);
  const [conflictWarning, setConflictWarning] = useState("");

  useEffect(() => {
    if (user) {
      if (!travelerName) setTravelerName(user.full_name || "");
      if (!travelerEmail) setTravelerEmail(user.email || "");
      if (!travelerPhone && user.phone) setTravelerPhone(user.phone || "");
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

  // Fetch busy dates for this provider
  useEffect(() => {
    if (local?.id) {
      getProviderBusyDates(local.id).then((dates) => {
        setBusyDates(dates || []);
      });
    }
  }, [local?.id]);

  // Check for conflict on inquiryDate or timeSlot change
  useEffect(() => {
    if (!inquiryDate) {
      setConflictWarning("");
      return;
    }
    const matchingBusy = busyDates.find((b) => {
      if (b.date !== inquiryDate) return false;
      return b.time_slot === "full_day" || timeSlot === "full_day" || b.time_slot === timeSlot;
    });

    if (matchingBusy) {
      setConflictWarning(
        `⚠️ ${local?.name?.split(" ")[0] || "This provider"} already has a confirmed journey on ${inquiryDate} (${matchingBusy.time_slot.replace("_", " ")}). Please pick another date or slot.`
      );
    } else {
      setConflictWarning("");
    }
  }, [inquiryDate, timeSlot, busyDates, local?.name]);

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

  const isTrekGuide = local.category === "trek-guides" || local.role?.toLowerCase().includes("trek");

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (conflictWarning) {
      showToast("Please choose an available date and time slot", "error");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        booking_type: isTrekGuide ? "guide" : "companion",
        item_id: Number(local.id) || 1,
        item_title: `${local.name} (${local.role})`,
        item_image: local.image || null,
        provider_name: local.name,
        traveler_name: travelerName || user?.full_name || "Mountain Traveler",
        traveler_email: travelerEmail || user?.email || "traveler@pahadily.com",
        traveler_phone: travelerPhone || user?.phone || null,
        travel_date: inquiryDate,
        time_slot: timeSlot,
        activity_type: activityType,
        guests: String(guests),
        total_price: local.price,
        message: message || `Visiting ${local.location} and would love to explore together with local guidance.`,
      };

      const res = await createBooking(payload);
      setBookingResult(res);
      setInquirySent(true);
      showToast(`Booking request dispatched to ${local.name.split(" ")[0]}!`);
    } catch (err) {
      showToast(err.message || "Could not submit booking request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="local-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="local-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840 }}
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
              <span className="local-modal-badge" title="Pahadíly Verified Local Resident">
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
                <span style={{ fontSize: "12px", background: "rgba(43, 112, 80, 0.12)", color: "var(--color-forest-medium)", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                  {local.role}
                </span>
              </div>
            </div>

            <div className="local-modal-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{local.location} (Kullu District)</span>
            </div>

            <div className="local-modal-badges-row">
              {isTrekGuide && local.certified ? (
                <span className="local-badge-pill cert" style={{ background: "rgba(26, 92, 159, 0.15)", color: "#1a5c9f", border: "1px solid #1a5c9f" }}>
                  🎖️ Verified Mountaineering Guide
                </span>
              ) : (
                <span className="local-badge-pill role" style={{ background: "rgba(43, 112, 80, 0.12)", color: "var(--color-forest-medium)" }}>
                  🤝 Native Village Companion
                </span>
              )}

              <span className="local-badge-pill lang">
                🗣️ {local.lang}
              </span>
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
                  `Born and raised in Himachal Pradesh, ${local.name.split(" ")[0]} shares authentic mountain traditions, quiet forest glades, and heritage trails with mindful visitors.`}
              </p>
            </section>

            <section className="local-modal-section">
              <h3 className="local-section-heading">Specialties & Local Expertise</h3>
              <div className="local-specialties-grid">
                {(local.tags || ["Village Trails", "Local Lore", "Safe Guiding"]).map((tag) => (
                  <div key={tag} className="specialty-item">
                    <span className="specialty-dot">🌲</span>
                    <span className="specialty-name">{tag}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Honest verification note */}
            <div style={{ background: "var(--color-bg-card)", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "13px", color: "var(--color-text-muted)" }}>
              <strong style={{ color: "var(--color-forest-dark)", display: "block", marginBottom: "4px" }}>
                🛡️ Pahadíly Community Standard
              </strong>
              {isTrekGuide
                ? "This provider leads alpine treks and holds verified high-altitude training credentials."
                : "This companion is a native resident helping visitors explore familiar local walking paths, villages, and culture within their stated capabilities. Not an extreme mountaineering guide."}
            </div>
          </div>

          {/* Right: Booking Request Box */}
          <div className="local-modal-right">
            <div className="local-booking-card">
              <div className="booking-price-header">
                <div>
                  <span className="price-tag">{local.price}</span>
                  <span className="price-unit"> {local.unit}</span>
                </div>
                <span className="price-note">100% direct to host</span>
              </div>

              {inquirySent ? (
                <div className="inquiry-success-message">
                  <div className="success-check-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4>Booking Request Submitted!</h4>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: "1.5" }}>
                    Your request has been routed to <strong>{local.name}</strong>. The provider will review their schedule and respond.
                  </p>

                  {bookingResult && (
                    <div className="inquiry-ref-box" style={{ background: "var(--color-bg-ivory)", padding: "12px", borderRadius: "8px", margin: "14px 0" }}>
                      <div style={{ fontSize: "12px", color: "var(--color-text-faint)" }}>Request Reference</div>
                      <strong style={{ fontSize: "16px", color: "var(--color-forest-dark)" }}>#PHD-REQ-{bookingResult.id}</strong>
                      <div style={{ fontSize: "12px", color: "var(--color-terracotta-warm)", marginTop: "4px", fontWeight: 700 }}>
                        ⏳ Status: Pending Provider Approval
                      </div>
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
                      Track in My Trips
                    </button>
                    <button
                      type="button"
                      className="send-another-btn"
                      onClick={() => setInquirySent(false)}
                    >
                      Modify Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="local-inquiry-form">
                  {/* Step 1: Date */}
                  <div className="form-group">
                    <label>Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      className="inquiry-input"
                    />
                  </div>

                  {/* Step 2: Time Slot */}
                  <div className="form-group">
                    <label>Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="inquiry-input"
                    >
                      <option value="full_day">Full Day (approx. 9:00 AM – 5:00 PM)</option>
                      <option value="morning">Morning Walk (8:30 AM – 1:00 PM)</option>
                      <option value="afternoon">Afternoon & Sunset (1:30 PM – 6:00 PM)</option>
                    </select>
                  </div>

                  {/* Conflict indicator */}
                  {conflictWarning && (
                    <div style={{ background: "#fdf2ef", border: "1px solid var(--color-terracotta-warm)", color: "var(--color-terracotta-warm)", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                      {conflictWarning}
                    </div>
                  )}

                  {/* Step 3: Group Size */}
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

                  {/* Step 4: Activity Focus */}
                  <div className="form-group">
                    <label>Desired Experience</label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="inquiry-input"
                    >
                      <option value="Village & Heritage Walk">Village & Heritage Walk</option>
                      <option value="Hidden Waterfalls & Streams">Hidden Waterfalls & Streams</option>
                      <option value="Quiet Pine Ridge Trails">Quiet Pine Ridge Trails</option>
                      <option value="Local Food & Farm Experience">Local Food & Farm Experience</option>
                      <option value="Slow Exploration & Storytelling">Slow Exploration & Storytelling</option>
                    </select>
                  </div>

                  {!user && (
                    <>
                      <div className="form-group">
                        <label>Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Maya Verma"
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
                      <div className="form-group">
                        <label>Phone / WhatsApp (Optional)</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={travelerPhone}
                          onChange={(e) => setTravelerPhone(e.target.value)}
                          className="inquiry-input"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Special Requests / Notes</label>
                    <textarea
                      rows="2"
                      placeholder={`Hi ${local.name.split(" ")[0]}, we are traveling at a gentle pace and would love to discover quiet viewpoints...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="inquiry-input inquiry-textarea"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="local-inquiry-submit"
                    disabled={submitting || !!conflictWarning}
                    style={{ opacity: conflictWarning ? 0.6 : 1 }}
                  >
                    {submitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Request Availability</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>

                  <div className="booking-trust-points" style={{ marginTop: "12px", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "10px" }}>
                    <small style={{ display: "block", color: "var(--color-text-muted)" }}>
                      📌 <strong>Availability Request:</strong> No money is charged now. {local.name.split(" ")[0]} reviews the request and confirms availability.
                    </small>
                    <small style={{ display: "block", color: "var(--color-forest-medium)", marginTop: "4px" }}>
                      🌿 Direct local community earning with zero middleman commissions.
                    </small>
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
