import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyBookings, updateBookingStatus } from "../../lib/api";

function MyBookingsModal() {
  const { myBookingsOpen, setMyBookingsOpen, user, openAuthModal, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (myBookingsOpen) {
      fetchBookings();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [myBookingsOpen, fetchBookings]);

  if (!myBookingsOpen) return null;

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    setActionLoading(id);
    try {
      await updateBookingStatus(id, "cancelled");
      showToast("Booking request cancelled.", "info");
      await fetchBookings();
    } catch (err) {
      showToast(err.message || "Could not cancel booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(43, 112, 80, 0.12)", color: "var(--color-forest-medium)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>
            <span>✅ Confirmed by Host</span>
          </span>
        );
      case "completed":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(10, 37, 27, 0.08)", color: "var(--color-forest-dark)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>
            <span>🏔️ Journey Completed</span>
          </span>
        );
      case "declined":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(200, 109, 81, 0.15)", color: "var(--color-terracotta-warm)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>
            <span>❌ Request Declined</span>
          </span>
        );
      case "cancelled":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(120, 144, 131, 0.15)", color: "var(--color-text-faint)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(217, 154, 56, 0.15)", color: "var(--color-gold-warm)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>
            <span>⏳ Awaiting Host Response</span>
          </span>
        );
    }
  };

  return (
    <div className="pahadily-modal-overlay" onClick={() => setMyBookingsOpen(false)}>
      <div className="my-bookings-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="my-bookings-header">
          <div>
            <div className="my-bookings-eyebrow">YOUR HIMALAYAN JOURNEYS & EXPERIENCES</div>
            <h2 className="my-bookings-title">My Trips & Requests</h2>
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
            <p>Please log in to your account to view your travel requests and companion bookings.</p>
            <button
              className="btn-login-prompt"
              onClick={() => {
                setMyBookingsOpen(false);
                openAuthModal("login");
              }}
            >
              Sign In to Your Account
            </button>
          </div>
        ) : loading ? (
          <div className="bookings-loading-state">
            <span className="spinner-dot"></span>
            <span>Fetching your travel requests...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="my-bookings-empty">
            <div className="empty-icon">🏔️</div>
            <h3>No Active Requests Yet</h3>
            <p>You haven&apos;t requested any mountain companions or local experiences yet.</p>
            <button
              className="btn-browse-cta"
              onClick={() => {
                setMyBookingsOpen(false);
                window.location.href = "/locals";
              }}
            >
              Find a Local Companion
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
                    {b.booking_type === "companion" || b.booking_type === "local" ? "🤝 Companion" : b.booking_type === "guide" ? "🎖️ Trek Guide" : b.booking_type === "place" ? "🏔️ Stay" : "🎒 Experience"}
                  </span>
                </div>

                <div className="booking-trip-details">
                  <div className="booking-trip-top">
                    <div>
                      <span className="booking-ref-id">
                        Voucher #{b.id}
                      </span>
                      <h3 className="booking-trip-name">{b.item_title}</h3>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>

                  <div className="booking-trip-meta-grid">
                    <div className="meta-item">
                      <span className="meta-lbl">Date & Time</span>
                      <strong className="meta-val">
                        📅 {b.travel_date}
                        {b.time_slot && (
                          <span style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                            ⏱️ {b.time_slot.replace("_", " ")}
                          </span>
                        )}
                      </strong>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Group Size</span>
                      <strong className="meta-val">👥 {b.guests}</strong>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Estimated Price</span>
                      <strong className="meta-val price-accent">{b.total_price || "₹500"}</strong>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Remuneration</span>
                      <div className="booking-pay-summary">
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-forest-medium)" }}>
                          Direct on Meetup
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status explanation & notes */}
                  {b.status === "pending" && (
                    <div style={{ background: "#fdfbf5", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(217, 154, 56, 0.3)", fontSize: "13px", color: "var(--color-text-body)", margin: "10px 0" }}>
                      ⏳ <strong>Waiting for Host:</strong> Your companion will review their availability for {b.travel_date}. You will be notified once they accept or suggest an alternate time.
                    </div>
                  )}

                  {b.status === "confirmed" && (
                    <div style={{ background: "#f2f8f5", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(43, 112, 80, 0.3)", fontSize: "13px", color: "var(--color-forest-dark)", margin: "10px 0" }}>
                      ✅ <strong>Confirmed by {b.provider_name || "Host"}:</strong> "{b.provider_notes || "Looking forward to guiding you in the valley!"}"
                    </div>
                  )}

                  {b.status === "declined" && (
                    <div style={{ background: "#fdf4f2", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(200, 109, 81, 0.3)", fontSize: "13px", color: "var(--color-terracotta-warm)", margin: "10px 0" }}>
                      ❌ <strong>Unavailable:</strong> {b.provider_notes || "The host is committed to other duties on this date."}
                      {b.suggested_date && (
                        <div style={{ marginTop: "4px", fontWeight: 600 }}>
                          💡 Host suggested alternate date: {b.suggested_date}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="booking-trip-footer">
                    <div className="booking-voucher-hint">
                      {b.status === "confirmed" ? (
                        <span style={{ color: "var(--color-forest-medium)", fontWeight: 600 }}>✓ Verified Himalayan Companion confirmed</span>
                      ) : b.status === "pending" ? (
                        <span>Dispatched to native host</span>
                      ) : (
                        <span>Request archived</span>
                      )}
                    </div>

                    {b.status === "pending" && (
                      <button
                        type="button"
                        className="btn-cancel-trip"
                        disabled={actionLoading === b.id}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        {actionLoading === b.id ? "Cancelling..." : "Cancel Request"}
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
