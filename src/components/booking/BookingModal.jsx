import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createBooking } from "../../lib/api";

function BookingModal() {
  const {
    bookingModalOpen,
    setBookingModalOpen,
    bookingTarget,
    user,
    setMyBookingsOpen,
    showToast,
  } = useAuth();

  const item = bookingTarget?.item;
  const bookingType = bookingTarget?.type || "place"; // "local" | "place" | "experience"

  const [travelDate, setTravelDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [error, setError] = useState("");

  // Pre-fill user information when available
  useEffect(() => {
    if (user) {
      if (!travelerName) setTravelerName(user.full_name || "");
      if (!travelerEmail) setTravelerEmail(user.email || "");
      if (!travelerPhone && user.phone) setTravelerPhone(user.phone || "");
    }
  }, [user, bookingModalOpen]);

  // Set default date to tomorrow and default check-out
  useEffect(() => {
    if (bookingModalOpen && !travelDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTravelDate(tomorrow.toISOString().split("T")[0]);

      if (bookingType === "place") {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 3);
        setEndDate(nextDay.toISOString().split("T")[0]);
      }
    }
    setBookingSuccess(null);
    setError("");
  }, [bookingModalOpen, bookingType]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setBookingModalOpen(false);
    };
    if (bookingModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [bookingModalOpen, setBookingModalOpen]);

  if (!bookingModalOpen || !item) return null;

  const itemTitle = item.name || item.title || "Mountain Experience";
  const itemImage =
    item.image ||
    (bookingType === "local"
      ? "/images/locals/rahul.jpg"
      : "/images/destinations/tirthan-valley.jpg");
  const itemPrice = item.price || "₹2,200";
  const itemUnit = item.unit || (bookingType === "place" ? "/night" : "/person");

  // Calculate estimated price
  const numericPrice = parseInt(itemPrice.toString().replace(/[^0-9]/g, ""), 10) || 2000;
  const numGuests = parseInt(guests, 10) || 1;
  let nightsCount = 1;

  if (bookingType === "place" && travelDate && endDate) {
    const d1 = new Date(travelDate);
    const d2 = new Date(endDate);
    nightsCount = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  }

  const estimatedTotal =
    bookingType === "place"
      ? numericPrice * nightsCount
      : numericPrice * numGuests;

  const formattedTotal = `₹${estimatedTotal.toLocaleString("en-IN")}`;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        booking_type: bookingType,
        item_id: Number(item.id) || 1,
        item_title: itemTitle,
        item_image: itemImage,
        traveler_name: travelerName,
        traveler_email: travelerEmail,
        traveler_phone: travelerPhone || null,
        travel_date: travelDate,
        end_date: bookingType === "place" && endDate ? endDate : null,
        guests: `${guests} Guest(s)`,
        nights: nightsCount,
        total_price: formattedTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cash_on_arrival" ? "pending" : "paid",
        message: message || "Looking forward to this authentic Himalayan journey.",
      };

      const result = await createBooking(payload);
      setBookingSuccess(result);
      showToast(`Reservation for "${itemTitle}" confirmed successfully!`);
    } catch (err) {
      setError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMyBookings = () => {
    setBookingModalOpen(false);
    setMyBookingsOpen(true);
  };

  return (
    <div className="pahadily-modal-overlay" onClick={() => setBookingModalOpen(false)}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="booking-modal-close"
          onClick={() => setBookingModalOpen(false)}
          aria-label="Close booking modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {bookingSuccess ? (
          <div className="booking-success-view">
            <div className="booking-success-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="booking-success-badge">RESERVATION & PAYMENT CONFIRMED</span>
            <h3 className="booking-success-title">Your Journey is Booked!</h3>
            <p className="booking-success-subtitle">
              We have dispatched your reservation details directly to <strong>{itemTitle}</strong>. An official e-voucher
              has been emailed to <strong>{bookingSuccess.traveler_email}</strong>.
            </p>

            <div className="booking-summary-receipt">
              <div className="receipt-header-row">
                <span>PAHADÍLY OFFICIAL RESERVATION VOUCHER</span>
              </div>
              <div className="receipt-row">
                <span>Booking Reference</span>
                <strong>#{bookingSuccess.id} • {bookingSuccess.payment_id || `PHD-PAY-${bookingSuccess.id}`}</strong>
              </div>
              <div className="receipt-row">
                <span>Sanctuary / Entity</span>
                <strong>{bookingSuccess.item_title}</strong>
              </div>
              <div className="receipt-row">
                <span>Travel Dates</span>
                <strong>
                  {bookingSuccess.travel_date} {bookingSuccess.end_date ? `to ${bookingSuccess.end_date} (${bookingSuccess.nights || nightsCount} nights)` : ""}
                </strong>
              </div>
              <div className="receipt-row">
                <span>Traveler</span>
                <strong>{bookingSuccess.traveler_name} ({bookingSuccess.guests})</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Method</span>
                <strong>{(bookingSuccess.payment_method || "UPI").toUpperCase()}</strong>
              </div>
              <div className="receipt-row total">
                <span>Total Amount</span>
                <strong>{bookingSuccess.total_price || formattedTotal}</strong>
              </div>
              <div className="receipt-row status">
                <span>Payment Status</span>
                <span className={`payment-pill ${bookingSuccess.payment_status || "paid"}`}>
                  ✓ {bookingSuccess.payment_status?.toUpperCase() || "PAID"}
                </span>
              </div>
            </div>

            <div className="booking-success-actions">
              <button
                type="button"
                className="btn-view-bookings"
                onClick={handleOpenMyBookings}
              >
                View in My Bookings →
              </button>
              <button
                type="button"
                className="btn-done-close"
                onClick={() => setBookingModalOpen(false)}
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="booking-modal-layout">
            {/* Top Summary Header */}
            <div className="booking-item-header">
              <div className="booking-item-img-wrap">
                <img src={itemImage} alt={itemTitle} />
              </div>
              <div className="booking-item-info">
                <span className="booking-category-tag">
                  {bookingType === "local"
                    ? "🌲 LOCAL COMPANION / GUIDE"
                    : bookingType === "place"
                    ? "🏔️ MOUNTAIN STAY & RETREAT"
                    : "🎒 CURATED EXPERIENCE"}
                </span>
                <h3 className="booking-target-title">{itemTitle}</h3>
                <p className="booking-target-location">
                  📍 {item.location || (item.region ? `${item.region.toUpperCase()} Valley` : "Himachal Pradesh")}
                </p>
                <div className="booking-target-rate">
                  <span className="rate-amount">{itemPrice}</span>
                  <span className="rate-unit"> {itemUnit}</span>
                  {item.rating && (
                    <span className="rate-stars">
                      ★ {item.rating} ({item.reviews || 24}+ reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="booking-error-banner" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="booking-form-grid">
              {/* Date & Guest Inputs */}
              <div className="form-row-dates">
                <div className="form-field">
                  <label>
                    {bookingType === "place" ? "Check-in Date" : "Travel Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="booking-input"
                  />
                </div>

                {bookingType === "place" && (
                  <div className="form-field">
                    <label>Check-out Date ({nightsCount} nights)</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      min={travelDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="booking-input"
                    />
                  </div>
                )}

                <div className="form-field">
                  <label>Party Size</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="booking-input"
                  >
                    <option value="1">1 Solo Traveler</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests (Group)</option>
                  </select>
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="form-row-contact">
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    className="booking-input"
                  />
                </div>

                <div className="form-field">
                  <label>Email (For Booking Voucher)</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={travelerEmail}
                    onChange={(e) => setTravelerEmail(e.target.value)}
                    className="booking-input"
                  />
                </div>

                <div className="form-field">
                  <label>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+91 98160 00000"
                    value={travelerPhone}
                    onChange={(e) => setTravelerPhone(e.target.value)}
                    className="booking-input"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="form-field">
                <label>Select Payment Method</label>
                <div className="payment-options-grid">
                  <label className={`payment-option-card${paymentMethod === "upi" ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="pay-option-content">
                      <span className="pay-option-icon">⚡</span>
                      <div>
                        <strong>UPI / QR Instant (GPay / PhonePe / Paytm)</strong>
                        <small>Instant reservation confirmation & receipt</small>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option-card${paymentMethod === "card" ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="pay-option-content">
                      <span className="pay-option-icon">💳</span>
                      <div>
                        <strong>Credit / Debit Card / Net Banking</strong>
                        <small>Visa, Mastercard, RuPay & all major banks</small>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option-card${paymentMethod === "cash_on_arrival" ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash_on_arrival"
                      checked={paymentMethod === "cash_on_arrival"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="pay-option-content">
                      <span className="pay-option-icon">🏡</span>
                      <div>
                        <strong>Pay at Sanctuary (Check-in)</strong>
                        <small>Direct payment to mountain host on arrival</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>Special Requests or Notes for Host (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Dietary preferences, arrival time, bonfire arrangement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="booking-input booking-textarea"
                />
              </div>

              {/* Price Calculation Summary */}
              <div className="booking-cost-calc">
                <div className="calc-row">
                  <span>Base Rate</span>
                  <span>{itemPrice} {itemUnit}</span>
                </div>
                {bookingType === "place" && (
                  <div className="calc-row">
                    <span>Duration</span>
                    <span>{nightsCount} Night{nightsCount > 1 ? "s" : ""}</span>
                  </div>
                )}
                <div className="calc-row total-highlight">
                  <span>Total Amount Payable</span>
                  <strong>{formattedTotal}</strong>
                </div>
                <small className="calc-note">
                  🛡️ All taxes, mountain host verification, and Pahadíly Traveler Support included.
                </small>
              </div>

              <button
                type="submit"
                className="booking-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="btn-spinner-wrap">
                    <span className="spinner-dot"></span>
                    Securing Reservation & Payment...
                  </span>
                ) : (
                  <>
                    <span>Confirm & Pay {formattedTotal}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingModal;
