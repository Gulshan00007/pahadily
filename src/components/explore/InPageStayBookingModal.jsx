import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { createBooking } from "../../lib/api";

function extractNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, ""), 10) || 0;
}

function InPageStayBookingModal({ isOpen, onClose, stay, destination }) {
  const { user } = useAuth();

  // Slideshow state
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Form state
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);
  const dayAfterTomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  const [checkIn, setCheckIn] = useState(tomorrowStr);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrowStr);
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);

  // Traveler info
  const [travelerName, setTravelerName] = useState(user?.full_name || "");
  const [travelerEmail, setTravelerEmail] = useState(user?.email || "");
  const [travelerPhone, setTravelerPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Images for slideshow
  const slideImages = useMemo(() => {
    if (!stay) return [];
    if (Array.isArray(stay.images) && stay.images.length > 0) {
      return stay.images;
    }
    if (stay.image) {
      return [stay.image];
    }
    return [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=85",
    ];
  }, [stay]);

  const stayOptions = useMemo(() => {
    if (stay?.stayOptions && stay.stayOptions.length > 0) {
      return stay.stayOptions;
    }
    if (stay?.stay_options && stay.stay_options.length > 0) {
      return stay.stay_options;
    }
    return [
      {
        id: "opt-std",
        name: stay?.name || "Standard Room",
        price: stay?.price || "₹2,500",
        capacity: "2 Guests",
        features: ["Attached Bath", "Hot Water", "Mountain View", "Organic Breakfast"],
      },
      {
        id: "opt-dlx",
        name: "Deluxe Alpine Room",
        price: `₹${Math.round(extractNumber(stay?.price || 2500) * 1.3)}`,
        capacity: "3 Guests",
        features: ["Private Balcony", "Bukhari Fireplace", "Valley View", "Breakfast Included"],
      },
    ];
  }, [stay]);

  const currentOption = stayOptions[selectedOptionIdx] || stayOptions[0];

  // Calculate nights
  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Pricing calculation
  const nightlyRate = useMemo(() => {
    return extractNumber(currentOption?.price || stay?.price || 2500);
  }, [currentOption, stay]);

  const totalAmount = nightlyRate * nightsCount;

  // Slide navigation
  const nextSlide = useCallback(() => {
    if (slideImages.length === 0) return;
    setActiveSlideIdx((prev) => (prev + 1) % slideImages.length);
  }, [slideImages]);

  const prevSlide = useCallback(() => {
    if (slideImages.length === 0) return;
    setActiveSlideIdx((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  }, [slideImages]);

  // Auto-advance slideshow every 4.5 seconds
  useEffect(() => {
    if (!isOpen || isPaused || slideImages.length <= 1) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [isOpen, isPaused, nextSlide, slideImages.length]);

  // Pre-fill user data when user changes
  useEffect(() => {
    if (user) {
      if (user.full_name && !travelerName) setTravelerName(user.full_name);
      if (user.email && !travelerEmail) setTravelerEmail(user.email);
      if (user.phone && !travelerPhone) setTravelerPhone(user.phone);
    }
  }, [user]);

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      setActiveSlideIdx(0);
      setIsPaused(false);
      setSelectedOptionIdx(0);
      setConfirmedBooking(null);
      setSubmitError("");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard escape
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, prevSlide, nextSlide]);

  if (!isOpen || !stay) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!travelerName.trim()) {
      setSubmitError("Please enter your name");
      return;
    }
    if (!travelerEmail.trim() || !travelerEmail.includes("@")) {
      setSubmitError("Please enter a valid email address");
      return;
    }
    if (!travelerPhone.trim()) {
      setSubmitError("Please provide a contact phone number for host arrival coordination");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        booking_type: "place",
        item_id: stay.id || 1,
        item_title: `${stay.name} — ${currentOption.name}`,
        item_image: slideImages[0] || stay.image,
        traveler_name: travelerName.trim(),
        traveler_email: travelerEmail.trim(),
        traveler_phone: travelerPhone.trim(),
        travel_date: checkIn,
        end_date: checkOut,
        guests: String(guestsCount),
        nights: nightsCount,
        total_price: `₹${totalAmount.toLocaleString("en-IN")}`,
        payment_method: "upi",
        payment_status: "paid",
        message: `Option: ${currentOption.name}. ${specialRequests ? `Special Requests: ${specialRequests}` : ""}`,
      };

      const result = await createBooking(payload);
      setConfirmedBooking(result);
    } catch (err) {
      console.error("Booking submission error:", err);
      setSubmitError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stay-book-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Book ${stay.name}`}>
      <div className="stay-book-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="stay-book-close-btn" onClick={onClose} aria-label="Close booking form">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {confirmedBooking ? (
          /* Confirmation Screen */
          <div className="stay-book-confirmed-view">
            <div className="stay-book-success-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="stay-book-confirmed-eyebrow">RESERVATION CONFIRMED</span>
            <h2 className="stay-book-confirmed-title">You&apos;re Heading to {stay.name}!</h2>
            <p className="stay-book-confirmed-sub">
              Your stay has been registered directly with <strong>{stay.host || "your native host"}</strong>. Booking voucher #{confirmedBooking.id} has been dispatched to <strong>{confirmedBooking.traveler_email}</strong>.
            </p>

            <div className="stay-book-voucher-card">
              <div className="voucher-row">
                <span className="v-label">Booking Reference:</span>
                <span className="v-value">#{confirmedBooking.id} • {confirmedBooking.transaction_ref || confirmedBooking.payment_id}</span>
              </div>
              <div className="voucher-row">
                <span className="v-label">Stay & Tier:</span>
                <span className="v-value">{stay.name} ({currentOption.name})</span>
              </div>
              <div className="voucher-row">
                <span className="v-label">Dates:</span>
                <span className="v-value">{checkIn} to {checkOut} ({nightsCount} {nightsCount === 1 ? "Night" : "Nights"})</span>
              </div>
              <div className="voucher-row">
                <span className="v-label">Guests:</span>
                <span className="v-value">{guestsCount} Guests</span>
              </div>
              <div className="voucher-row highlight">
                <span className="v-label">Total Amount Paid:</span>
                <span className="v-value">{confirmedBooking.total_price} (Zero Middleman Fees)</span>
              </div>
            </div>

            <div className="stay-book-confirmed-actions">
              <button
                type="button"
                className="stay-book-action-btn primary"
                onClick={onClose}
              >
                Back to Explore Page
              </button>
            </div>
          </div>
        ) : (
          /* Main Two-Column Layout: Slideshow (Left) & Booking Form (Right) */
          <div className="stay-book-layout">
            {/* Left Column: Photo Slideshow & Stay Information */}
            <div
              className="stay-book-slideshow-col"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Slideshow Viewport */}
              <div className="stay-slideshow-viewport">
                <img
                  src={slideImages[activeSlideIdx]}
                  alt={`${stay.name} photo ${activeSlideIdx + 1}`}
                  className="stay-slideshow-img"
                  key={activeSlideIdx}
                  loading="lazy"
                />
                <div className="stay-slideshow-overlay" />

                {/* Top Badges */}
                <div className="stay-slideshow-badges">
                  <span className="badge-stay-type">🏡 Verified Homestay</span>
                  <span className="badge-slide-count">{activeSlideIdx + 1} / {slideImages.length}</span>
                </div>

                {/* Navigation Arrows */}
                {slideImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="stay-slide-arrow left"
                      onClick={prevSlide}
                      aria-label="Previous photo"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="stay-slide-arrow right"
                      onClick={nextSlide}
                      aria-label="Next photo"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {slideImages.length > 1 && (
                <div className="stay-slideshow-thumbs-strip" aria-label="Photo thumbnails">
                  {slideImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`stay-thumb-item${idx === activeSlideIdx ? " active" : ""}`}
                      onClick={() => setActiveSlideIdx(idx)}
                      aria-label={`Show photo ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* Stay Meta & Details */}
              <div className="stay-info-details-box">
                <div className="stay-info-header">
                  <div>
                    <h3 className="stay-info-name">{stay.name}</h3>
                    <div className="stay-info-loc">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{stay.subLocation || destination?.location || "Himachal Pradesh"}</span>
                    </div>
                  </div>
                  <div className="stay-info-rating-tag">
                    <span className="star">★</span>
                    <span className="score">{stay.rating || 4.8}</span>
                    <span className="count">({stay.reviewsCount || 20})</span>
                  </div>
                </div>

                <p className="stay-info-desc">
                  {stay.description || stay.tagline || "Authentic Himachali wooden architecture with panoramic pine and snow peaks view."}
                </p>

                {/* Amenities Pills */}
                {Array.isArray(stay.amenities) && stay.amenities.length > 0 && (
                  <div className="stay-info-amenities">
                    <span className="amenity-title">Included Amenities:</span>
                    <div className="amenity-pills-row">
                      {stay.amenities.map((am, i) => (
                        <span key={i} className="am-pill">✓ {am}</span>
                      ))}
                      <span className="am-pill">✓ Hot Water</span>
                      <span className="am-pill">✓ Mountain Balcony</span>
                    </div>
                  </div>
                )}

                {/* Host Info */}
                <div className="stay-host-strip">
                  <div className="host-avatar-mini">
                    {stay.host ? stay.host.charAt(0) : "H"}
                  </div>
                  <div>
                    <span className="host-title">Hosted by {stay.host || "Local Himalayan Family"}</span>
                    <span className="host-sub">100% earnings go directly to the mountain community</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: In-Page Booking System in a Form */}
            <div className="stay-book-form-col">
              <div className="stay-form-header">
                <span className="stay-form-badge">⚡ Instant Confirmation</span>
                <h3 className="stay-form-title">Reserve Your Stay</h3>
                <p className="stay-form-subtitle">Direct community booking with instant voucher</p>
              </div>

              {submitError && (
                <div className="stay-form-alert error" role="alert">
                  <span>⚠️ {submitError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="stay-booking-form">
                {/* 1. Room / Option Tier Selector */}
                <div className="form-group">
                  <label className="form-label">Select Stay Option / Tier</label>
                  <div className="stay-options-tier-list">
                    {stayOptions.map((opt, idx) => (
                      <button
                        key={opt.id || idx}
                        type="button"
                        className={`opt-tier-card${selectedOptionIdx === idx ? " selected" : ""}`}
                        onClick={() => setSelectedOptionIdx(idx)}
                      >
                        <div className="tier-radio-circle">
                          {selectedOptionIdx === idx && <span className="inner-dot" />}
                        </div>
                        <div className="tier-info">
                          <span className="tier-name">{opt.name}</span>
                          <span className="tier-cap">👥 {opt.capacity}</span>
                        </div>
                        <div className="tier-price">
                          <span className="price">{opt.price}</span>
                          <span className="unit">/night</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date Pickers (Check-in & Check-out) */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="stay-checkin" className="form-label">Check-in Date</label>
                    <input
                      id="stay-checkin"
                      type="date"
                      className="form-input"
                      min={todayStr}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (e.target.value >= checkOut) {
                          const nextD = new Date(e.target.value);
                          nextD.setDate(nextD.getDate() + 1);
                          setCheckOut(nextD.toISOString().split("T")[0]);
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="stay-checkout" className="form-label">Check-out Date</label>
                    <input
                      id="stay-checkout"
                      type="date"
                      className="form-input"
                      min={checkIn || todayStr}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 3. Number of Guests */}
                <div className="form-group">
                  <label htmlFor="stay-guests" className="form-label">Number of Guests</label>
                  <div className="guests-counter-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`guest-count-pill${guestsCount === num ? " active" : ""}`}
                        onClick={() => setGuestsCount(num)}
                      >
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Traveler Contact Details */}
                <div className="form-divider" />
                <span className="form-section-label">Traveler Details</span>

                <div className="form-group">
                  <label htmlFor="stay-name" className="form-label">Full Name</label>
                  <input
                    id="stay-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aarav Sharma"
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="stay-email" className="form-label">Email Address</label>
                    <input
                      id="stay-email"
                      type="email"
                      className="form-input"
                      placeholder="aarav@gmail.com"
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="stay-phone" className="form-label">Mobile Phone</label>
                    <input
                      id="stay-phone"
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={travelerPhone}
                      onChange={(e) => setTravelerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="stay-requests" className="form-label">Special Requests (Optional)</label>
                  <input
                    id="stay-requests"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vegetarian dinner, airport taxi pickup, bonfire"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                {/* 5. Live Pricing Breakdown */}
                <div className="stay-price-breakdown">
                  <div className="price-row">
                    <span>{currentOption.price} × {nightsCount} {nightsCount === 1 ? "night" : "nights"}</span>
                    <span>₹{(nightlyRate * nightsCount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="price-row">
                    <span>Community Platform Fee</span>
                    <span className="free">₹0 (Zero Fee)</span>
                  </div>
                  <div className="price-row">
                    <span>Taxes & Local Tourism Levy</span>
                    <span>Included</span>
                  </div>
                  <div className="price-row total">
                    <span>Total Amount</span>
                    <span className="total-val">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* 6. Submit Button */}
                <button
                  type="submit"
                  className="stay-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Processing Reservation...</span>
                  ) : (
                    <span>Confirm & Book Stay (₹{totalAmount.toLocaleString("en-IN")})</span>
                  )}
                </button>

                <p className="stay-form-footer-note">
                  🔒 Free cancellation up to 48 hours before check-in. Instant confirmation sent via email.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InPageStayBookingModal;
