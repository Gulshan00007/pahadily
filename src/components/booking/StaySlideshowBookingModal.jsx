import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { createBooking } from "../../lib/api";

const DEFAULT_NEARBY = [
  {
    name: "Jalori Pass & Ridge Trail",
    distance: "12 km",
    image: "/images/destinations/jibhi.jpg",
    description: "Ancient high-altitude mountain pass at 3,120m connecting Kullu with Shimla, with panoramic Himalayan panoramas.",
    type: "Trekking Spot",
  },
  {
    name: "Great Himalayan National Park",
    distance: "8 km",
    image: "/images/destinations/tirthan-valley.jpg",
    description: "UNESCO World Heritage Site with untouched cedar pine forests, glacial trout streams, and endangered western tragopans.",
    type: "National Park",
  },
  {
    name: "Serolsar Lake Sacred Meadow",
    distance: "18 km",
    image: "/images/destinations/parvati-valley.jpg",
    description: "Sacred crystalline glacial pond surrounded by dense kharsu oak forests and guarded by the legendary deity Buddhi Nagin.",
    type: "Sacred Lake",
  },
  {
    name: "Chehni Kothi Ancient Citadel",
    distance: "5 km",
    image: "/images/destinations/pangi-valley.jpg",
    description: "1,500-year-old towering indigenous Kath-Kuni dry-stone and cedar wood defensive watchtower overlooking the valley.",
    type: "Heritage Site",
  },
];

const DEFAULT_STAY_OPTIONS = [
  {
    id: "stay-opt-1",
    name: "Deluxe Riverside Alpine Chalet",
    price: "₹1,800",
    unit: "/night",
    distance: "Beside trout stream",
    capacity: "2 Guests",
    features: ["Attached Stone Bath", "Bonfire Evening", "Fresh Mountain Breakfast", "Cedar Balcony"],
  },
  {
    id: "stay-opt-2",
    name: "Heritage Kath-Kuni Family Suite",
    price: "₹2,500",
    unit: "/night",
    distance: "0.4 km from village square",
    capacity: "4 Guests",
    features: ["Mountain Range View", "Wood Fireplace / Bukhari", "Local Siddu Feasts", "Trail Guide Support"],
  },
  {
    id: "stay-opt-3",
    name: "Stargazer Glamping Bell Tent",
    price: "₹1,600",
    unit: "/night",
    distance: "Riverside meadow",
    capacity: "2 Guests",
    features: ["Translucent Sky Roof", "Private Firepit", "Hammock Under Pines", "Solar Lanterns"],
  },
];

export default function StaySlideshowBookingModal({
  isOpen,
  onClose,
  place,
  initialStayOption = null,
}) {
  const { user, setMyBookingsOpen, showToast } = useAuth();

  // Slide state
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Form state
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);
  const [travelDate, setTravelDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState("2 Guests");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [formError, setFormError] = useState("");

  // Prepare slides list: first slide is the stay/place itself, then nearby sights
  const stayImage = place?.image || "/images/destinations/tirthan-valley.jpg";
  const rawNearby = Array.isArray(place?.nearby_locations) && place.nearby_locations.length > 0
    ? place.nearby_locations
    : DEFAULT_NEARBY;

  const slides = [
    {
      name: place?.name || "Sanctuary Grounds",
      distance: "On-site sanctuary grounds",
      image: stayImage,
      description: place?.tagline || place?.description || "Authentic Himachali sanctuary with native hosts, organic food, and mountain trails.",
      type: "Featured Stay",
    },
    ...rawNearby,
  ];

  const totalSlides = slides.length;

  // Prepare stay options
  const stayOptions = Array.isArray(place?.stay_options) && place.stay_options.length > 0
    ? place.stay_options
    : DEFAULT_STAY_OPTIONS;

  // Initialize dates and traveler profile
  useEffect(() => {
    if (isOpen) {
      setSlideIndex(0);
      setIsPaused(false);
      setBookingSuccess(null);
      setFormError("");

      // Default check-in tomorrow, check-out 2 days later
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 3);

      setTravelDate(tomorrow.toISOString().split("T")[0]);
      setEndDate(dayAfter.toISOString().split("T")[0]);

      if (user) {
        if (!travelerName) setTravelerName(user.full_name || "");
        if (!travelerEmail) setTravelerEmail(user.email || "");
        if (!travelerPhone && user.phone) setTravelerPhone(user.phone || "");
      }

      // Check if an initial option matches
      if (initialStayOption) {
        const foundIdx = stayOptions.findIndex(
          (opt) => opt.name === initialStayOption.name || opt.id === initialStayOption.id
        );
        if (foundIdx >= 0) {
          setSelectedOptionIdx(foundIdx);
        } else {
          setSelectedOptionIdx(0);
        }
      } else {
        setSelectedOptionIdx(0);
      }
    }
  }, [isOpen, user, initialStayOption]);

  // Slideshow advance
  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideIndex((i) => (i + 1) % totalSlides);
    setTimeout(() => setIsAnimating(false), 380);
  }, [totalSlides, isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideIndex((i) => (i - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAnimating(false), 380);
  }, [totalSlides, isAnimating]);

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    if (!isOpen || isPaused || bookingSuccess) return;
    const interval = setInterval(goToNext, 4500);
    return () => clearInterval(interval);
  }, [isOpen, isPaused, bookingSuccess, goToNext]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose, goToNext, goToPrev]);

  if (!isOpen || !place) return null;

  const currentSlide = slides[slideIndex] || slides[0];
  const activeOption = stayOptions[selectedOptionIdx] || stayOptions[0];

  // Price and Nights calculation
  const parsePrice = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 1800;
    const cleaned = val.toString().replace(/[^0-9]/g, "");
    return parseInt(cleaned, 10) || 1800;
  };

  const nightlyRate = parsePrice(activeOption?.price || place?.price);

  let nightsCount = 1;
  if (travelDate && endDate) {
    const d1 = new Date(travelDate);
    const d2 = new Date(endDate);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    nightsCount = Math.max(1, diff);
  }

  const subtotal = nightlyRate * nightsCount;
  const formattedSubtotal = `₹${subtotal.toLocaleString("en-IN")}`;

  // Form submission handler
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!travelerName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!travelerEmail.trim() || !travelerEmail.includes("@")) {
      setFormError("Please enter a valid email address for your e-voucher.");
      return;
    }
    if (!travelDate) {
      setFormError("Please select a check-in date.");
      return;
    }

    setSubmitting(true);

    try {
      const fullStayTitle = `${activeOption.name} at ${place.name}`;
      const payload = {
        booking_type: "place",
        item_id: Number(place.id) || 1,
        item_title: fullStayTitle,
        item_image: currentSlide.image || stayImage,
        traveler_name: travelerName.trim(),
        traveler_email: travelerEmail.trim(),
        traveler_phone: travelerPhone.trim() || null,
        travel_date: travelDate,
        end_date: endDate || null,
        guests: guests,
        nights: nightsCount,
        total_price: formattedSubtotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cash_on_arrival" ? "pending" : "paid",
        message: notes.trim() || `Booked ${activeOption.name} with authentic local experience.`,
      };

      const result = await createBooking(payload);
      setBookingSuccess(result);
      if (showToast) {
        showToast(`🎉 Reservation confirmed for ${fullStayTitle}!`);
      }
    } catch (err) {
      setFormError(err.message || "Failed to submit reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="sbm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Booking and slideshow for ${place.name}`}
    >
      <div className="sbm-container" onClick={(e) => e.stopPropagation()}>
        {/* Floating Close Button */}
        <button
          type="button"
          className="sbm-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ============================================================ */}
        {/* LEFT COLUMN: INTERACTIVE HIMALAYAN SLIDESHOW                */}
        {/* ============================================================ */}
        <div
          className="sbm-slideshow-panel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Slide Image with Crossfade */}
          <div
            className="sbm-slide-bg"
            style={{ backgroundImage: `url('${currentSlide.image}')` }}
            key={`slide-${slideIndex}`}
          />
          <div className="sbm-slide-gradient" />

          {/* Slide Top Badge */}
          <div className="sbm-slide-header">
            <span className="sbm-slide-badge">
              📍 {place.region ? `${place.region.toUpperCase()} VALLEY` : "HIMACHAL"}
            </span>
            <span className="sbm-stay-name">{place.name}</span>
          </div>

          {/* Slide Bottom Caption */}
          <div className="sbm-slide-content">
            <div className="sbm-slide-meta-row">
              <span className="sbm-slide-type">{currentSlide.type || "Scenic Attraction"}</span>
              <span className="sbm-slide-distance">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {currentSlide.distance}
              </span>
            </div>

            <h3 className="sbm-slide-title">{currentSlide.name}</h3>
            <p className="sbm-slide-desc">{currentSlide.description}</p>
          </div>

          {/* Slideshow Navigation Controls */}
          <div className="sbm-slide-controls">
            <button
              type="button"
              className="sbm-nav-btn sbm-prev"
              onClick={goToPrev}
              aria-label="Previous slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Slide Dots */}
            <div className="sbm-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`sbm-dot${i === slideIndex ? " active" : ""}`}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="sbm-nav-btn sbm-next"
              onClick={goToNext}
              aria-label="Next slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Slide Counter & Pause Status */}
          <div className="sbm-slide-status-bar">
            <span className="sbm-slide-counter">
              Photo {slideIndex + 1} of {totalSlides}
            </span>
            {isPaused && <span className="sbm-paused-indicator">⏸ Paused</span>}
          </div>

          {/* Progress Bar */}
          <div className="sbm-progress-bar">
            <div
              className={`sbm-progress-fill${isPaused ? " paused" : ""}`}
              key={`${slideIndex}-${isPaused}`}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: BOOKING SYSTEM IN A FORM                      */}
        {/* ============================================================ */}
        <div className="sbm-booking-panel">
          {bookingSuccess ? (
            /* ------------------ SUCCESS RECEIPT VIEW ------------------ */
            <div className="sbm-success-wrap">
              <div className="sbm-success-icon-wrap">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.8">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <span className="sbm-success-badge">OFFICIAL RESERVATION CONFIRMED</span>
              <h2 className="sbm-success-title">Your Mountain Sanctuary is Reserved!</h2>
              <p className="sbm-success-subtitle">
                An e-voucher has been dispatched to <strong>{bookingSuccess.traveler_email}</strong>.
                Your native host at <strong>{place.name}</strong> has been notified.
              </p>

              <div className="sbm-receipt-box">
                <div className="sbm-receipt-top">
                  <span>PAHADÍLY SANCTUARY VOUCHER</span>
                  <strong>REF #{bookingSuccess.id || "1024"}</strong>
                </div>

                <div className="sbm-receipt-row">
                  <span>Reserved Sanctuary</span>
                  <strong>{bookingSuccess.item_title}</strong>
                </div>
                <div className="sbm-receipt-row">
                  <span>Valley Location</span>
                  <strong>📍 {place.region ? `${place.region.toUpperCase()} Valley` : "Himachal"}</strong>
                </div>
                <div className="sbm-receipt-row">
                  <span>Check-In & Nights</span>
                  <strong>
                    {bookingSuccess.travel_date}
                    {bookingSuccess.end_date ? ` to ${bookingSuccess.end_date}` : ""}
                    {" "}({nightsCount} {nightsCount === 1 ? "night" : "nights"})
                  </strong>
                </div>
                <div className="sbm-receipt-row">
                  <span>Guests & Traveler</span>
                  <strong>{bookingSuccess.traveler_name} • {bookingSuccess.guests}</strong>
                </div>
                <div className="sbm-receipt-row">
                  <span>Payment Mode</span>
                  <strong>{(bookingSuccess.payment_method || "UPI").toUpperCase()}</strong>
                </div>
                <div className="sbm-receipt-row total">
                  <span>Total Amount</span>
                  <strong className="sbm-receipt-total">{bookingSuccess.total_price || formattedSubtotal}</strong>
                </div>
              </div>

              <div className="sbm-success-actions">
                <button
                  type="button"
                  className="sbm-btn-view-bookings"
                  onClick={() => {
                    onClose();
                    setMyBookingsOpen(true);
                  }}
                >
                  View in My Bookings →
                </button>
                <button
                  type="button"
                  className="sbm-btn-done"
                  onClick={onClose}
                >
                  Return to Explore
                </button>
              </div>
            </div>
          ) : (
            /* ------------------ ACTIVE BOOKING FORM ------------------ */
            <div className="sbm-form-scrollable">
              {/* Header Box */}
              <div className="sbm-panel-header">
                <div className="sbm-header-tags">
                  <span className="sbm-tag-valley">
                    📍 {place.region ? `${place.region.toUpperCase()} VALLEY` : "HIMACHAL"}
                  </span>
                  {place.altitude && <span className="sbm-tag-alt">⛰️ {place.altitude}</span>}
                  <span className="sbm-tag-host">👤 Host: {place.host_name || "Verified Native Host"}</span>
                </div>
                <h2 className="sbm-panel-title">{place.name}</h2>
                <p className="sbm-panel-tagline">
                  {place.tagline || "Handcrafted cedar chalet & riverside sanctuary with native Himachali hospitality."}
                </p>
              </div>

              {/* 1. Stay Options Selector */}
              <div className="sbm-section">
                <label className="sbm-section-label">
                  1. Select Stay Option / Room Tier:
                </label>
                <div className="sbm-stay-options-list" role="radiogroup">
                  {stayOptions.map((opt, idx) => {
                    const isSelected = selectedOptionIdx === idx;
                    const optPrice = opt.price || place.price || "₹1,800";
                    const optUnit = opt.unit || "/night";
                    const features = Array.isArray(opt.features)
                      ? opt.features
                      : Array.isArray(opt.amenities)
                      ? opt.amenities
                      : ["Mountain View", "Organic Breakfast", "Bonfire"];

                    return (
                      <div
                        key={opt.id || idx}
                        className={`sbm-option-card${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedOptionIdx(idx)}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setSelectedOptionIdx(idx);
                        }}
                      >
                        <div className="sbm-option-radio-dot">
                          {isSelected && <span className="sbm-radio-inner" />}
                        </div>

                        <div className="sbm-option-info">
                          <div className="sbm-option-title-row">
                            <h4 className="sbm-option-name">{opt.name}</h4>
                            <div className="sbm-option-price-badge">
                              <span className="sbm-opt-price">{optPrice}</span>
                              <span className="sbm-opt-unit">{optUnit}</span>
                            </div>
                          </div>

                          <div className="sbm-option-meta">
                            {opt.capacity && <span>👥 {opt.capacity}</span>}
                            {opt.distance && <span>• 📍 {opt.distance}</span>}
                          </div>

                          <div className="sbm-option-features-row">
                            {features.slice(0, 3).map((f, fIdx) => (
                              <span key={fIdx} className="sbm-feat-pill">
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Booking Form Fields */}
              <form onSubmit={handleSubmitBooking} className="sbm-booking-form">
                <div className="sbm-section">
                  <label className="sbm-section-label">
                    2. Dates & Guests:
                  </label>

                  <div className="sbm-form-grid-2">
                    <div className="sbm-field">
                      <label htmlFor="sbm-checkin">Check-In Date *</label>
                      <input
                        id="sbm-checkin"
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="sbm-input"
                      />
                    </div>

                    <div className="sbm-field">
                      <label htmlFor="sbm-checkout">Check-Out Date *</label>
                      <input
                        id="sbm-checkout"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={travelDate || new Date().toISOString().split("T")[0]}
                        required
                        className="sbm-input"
                      />
                    </div>
                  </div>

                  <div className="sbm-form-grid-2" style={{ marginTop: "10px" }}>
                    <div className="sbm-field">
                      <label htmlFor="sbm-guests">Number of Guests *</label>
                      <select
                        id="sbm-guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="sbm-input sbm-select"
                      >
                        <option value="1 Guest">1 Guest (Solo Traveler)</option>
                        <option value="2 Guests">2 Guests (Couple / Friends)</option>
                        <option value="3 Guests">3 Guests</option>
                        <option value="4 Guests">4 Guests (Family Suite)</option>
                        <option value="5+ Group">5+ Guests (Private Group)</option>
                      </select>
                    </div>

                    <div className="sbm-field sbm-nights-field">
                      <label>Trip Duration</label>
                      <div className="sbm-nights-display">
                        🌙 {nightsCount} {nightsCount === 1 ? "Night" : "Nights"} Stay
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Traveler Contact Information */}
                <div className="sbm-section">
                  <label className="sbm-section-label">
                    3. Traveler Details:
                  </label>

                  <div className="sbm-field">
                    <label htmlFor="sbm-name">Your Full Name *</label>
                    <input
                      id="sbm-name"
                      type="text"
                      placeholder="e.g., Ananya Sharma"
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      required
                      className="sbm-input"
                    />
                  </div>

                  <div className="sbm-form-grid-2" style={{ marginTop: "10px" }}>
                    <div className="sbm-field">
                      <label htmlFor="sbm-email">Email Address *</label>
                      <input
                        id="sbm-email"
                        type="email"
                        placeholder="For official e-voucher"
                        value={travelerEmail}
                        onChange={(e) => setTravelerEmail(e.target.value)}
                        required
                        className="sbm-input"
                      />
                    </div>

                    <div className="sbm-field">
                      <label htmlFor="sbm-phone">WhatsApp / Phone *</label>
                      <input
                        id="sbm-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={travelerPhone}
                        onChange={(e) => setTravelerPhone(e.target.value)}
                        required
                        className="sbm-input"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Payment Method & Special Notes */}
                <div className="sbm-section">
                  <label className="sbm-section-label">
                    4. Payment & Host Notes:
                  </label>

                  <div className="sbm-payment-options">
                    <label className={`sbm-pay-pill${paymentMethod === "upi" ? " active" : ""}`}>
                      <input
                        type="radio"
                        name="sbm-pay"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />
                      <span>⚡ UPI / GPay / PhonePe (Instant Confirmation)</span>
                    </label>

                    <label className={`sbm-pay-pill${paymentMethod === "cash_on_arrival" ? " active" : ""}`}>
                      <input
                        type="radio"
                        name="sbm-pay"
                        value="cash_on_arrival"
                        checked={paymentMethod === "cash_on_arrival"}
                        onChange={() => setPaymentMethod("cash_on_arrival")}
                      />
                      <span>🤝 Pay on Arrival to Native Host</span>
                    </label>
                  </div>

                  <div className="sbm-field" style={{ marginTop: "10px" }}>
                    <label htmlFor="sbm-notes">Special Requests / Arrival Notes (Optional)</label>
                    <textarea
                      id="sbm-notes"
                      rows={2}
                      placeholder="e.g., Arriving via morning bus from Chandigarh, would love home-cooked Siddu for dinner..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="sbm-input sbm-textarea"
                    />
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="sbm-price-summary-box">
                  <div className="sbm-price-row">
                    <span>
                      {activeOption.name} ({nightlyRate} × {nightsCount} {nightsCount === 1 ? "night" : "nights"})
                    </span>
                    <strong>{formattedSubtotal}</strong>
                  </div>
                  <div className="sbm-price-row">
                    <span>Native Host Community Fund & Mountain Conservation</span>
                    <strong className="sbm-free-tag">₹0 (Zero Middleman Fee)</strong>
                  </div>
                  <div className="sbm-price-divider" />
                  <div className="sbm-price-row sbm-price-grand-total">
                    <span>Total Amount Payable</span>
                    <span className="sbm-grand-amount">{formattedSubtotal}</span>
                  </div>
                </div>

                {formError && (
                  <div className="sbm-error-alert" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Submit Button */}
                <div className="sbm-cta-row">
                  <button
                    type="submit"
                    className="sbm-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="sbm-submitting-label">
                        <span className="sbm-spinner" />
                        Confirming with Native Host...
                      </span>
                    ) : (
                      <>
                        <span>Confirm Reservation — {formattedSubtotal}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="sbm-guarantee-note">
                    🔒 Direct connection with native Himalayan host • No hidden platform charges
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
