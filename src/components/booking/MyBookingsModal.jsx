import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyBookings, updateBookingStatus } from "../../lib/api";

function MyBookingsModal() {
  const { myBookingsOpen, setMyBookingsOpen, user, openAuthModal, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myBookingsOpen) {
      fetchBookings();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [myBookingsOpen, user]);

  if (!myBookingsOpen) return null;

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Any paid amounts will be marked for immediate refund.")) return;
    setActionLoading(id);
    try {
      await updateBookingStatus(id, "cancelled");
      showToast("Booking cancelled. Refund initiated if paid.", "info");
      await fetchBookings();
    } catch (err) {
      showToast(err.message || "Could not cancel booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    switch (status) {
      case "confirmed":
        return <span className="booking-status-pill confirmed">🟢 Confirmed Reservation</span>;
      case "completed":
        return <span className="booking-status-pill completed">🔵 Completed Journey</span>;
      case "cancelled":
        return <span className="booking-status-pill cancelled">🔴 Cancelled {paymentStatus === "refunded" ? "(Refunded)" : ""}</span>;
      default:
        return <span className="booking-status-pill pending">🟡 Pending Host Acknowledgment</span>;
    }
  };

  return (
    <div className="pahadily-modal-overlay" onClick={() => setMyBookingsOpen(false)}>
      <div className="my-bookings-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="my-bookings-header">
          <div>
            <div className="my-bookings-eyebrow">YOUR HIMALAYAN RESERVATIONS & PAYMENTS</div>
            <h2 className="my-bookings-title">My Bookings & Trips</h2>
          </div>
          <button
            className="auth-modal-close"
            onClick={() => setMyBookingsOpen(false)}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!user ? (
          <div className="my-bookings-empty-guest">
            <p>Please log in or select a demo profile to view your personal bookings and payment vouchers.</p>
            <button
              className="btn-login-prompt"
              onClick={() => {
                setMyBookingsOpen(false);
                openAuthModal("login");
              }}
            >
              Log In / Select Demo Profile
            </button>
          </div>
        ) : loading ? (
          <div className="bookings-loading-state">
            <span className="spinner-dot"></span>
            <span>Fetching your reservations and payment vouchers...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="my-bookings-empty">
            <div className="empty-icon">🏔️</div>
            <h3>No Active Bookings Yet</h3>
            <p>You haven&apos;t reserved any mountain stays, native companions, or experiences yet.</p>
            <button
              className="btn-browse-cta"
              onClick={() => {
                setMyBookingsOpen(false);
                window.location.href = "/explore";
              }}
            >
              Explore Mountain Stays
            </button>
          </div>
        ) : (
          <div className="my-bookings-list">
            {bookings.map((b) => (
              <div key={b.id} className="booking-trip-card">
                <div className="booking-trip-img-wrap">
                  <img
                    src={b.item_image || "/images/destinations/tirthan-valley.jpg"}
                    alt={b.item_title}
                  />
                  <span className="booking-type-chip">
                    {b.booking_type === "local" ? "🌲 Local Host" : b.booking_type === "place" ? "🏔️ Stay" : "🎒 Experience"}
                  </span>
                </div>

                <div className="booking-trip-details">
                  <div className="booking-trip-top">
                    <div>
                      <span className="booking-ref-id">
                        Ref: #{b.id} • {b.payment_id || `PHD-PAY-${b.id}`}
                      </span>
                      <h3 className="booking-trip-name">{b.item_title}</h3>
                    </div>
                    {getStatusBadge(b.status, b.payment_status)}
                  </div>

                  <div className="booking-trip-meta-grid">
                    <div className="meta-item">
                      <span className="meta-lbl">Dates</span>
                      <strong className="meta-val">
                        📅 {b.travel_date} {b.end_date ? `to ${b.end_date}` : ""}
                      </strong>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Guests</span>
                      <strong className="meta-val">👥 {b.guests}</strong>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Total Amount</span>
                      <strong className="meta-val price-accent">{b.total_price || "₹2,200"}</strong>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Payment</span>
                      <div className="booking-pay-summary">
                        <span className={`payment-pill ${b.payment_status || "paid"}`}>
                          {(b.payment_status || "PAID").toUpperCase()}
                        </span>
                        <small className="pay-method-small">{(b.payment_method || "UPI").toUpperCase()}</small>
                      </div>
                    </div>
                  </div>

                  {b.message && (
                    <div className="booking-trip-note">
                      <span>Host Note:</span> &ldquo;{b.message}&rdquo;
                    </div>
                  )}

                  <div className="booking-trip-footer">
                    <div className="booking-voucher-hint">
                      <span>✓ Official Pahadíly e-voucher active</span>
                    </div>

                    {b.status !== "cancelled" && (
                      <button
                        type="button"
                        className="btn-cancel-trip"
                        disabled={actionLoading === b.id}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        {actionLoading === b.id ? "Cancelling..." : "Cancel Reservation"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsModal;
