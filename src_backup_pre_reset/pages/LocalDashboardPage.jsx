import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/common/SEO";
import { useAuth } from "../context/AuthContext";
import { getProviderBookings, respondToBookingRequest, updateBookingStatus } from "../lib/api";

function LocalDashboardPage() {
  const { user, isAuthenticated, openAuthModal, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState("incoming"); // 'incoming' | 'confirmed' | 'completed' | 'calendar'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of booking being updated

  // Decline modal state
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [suggestedDate, setSuggestedDate] = useState("");

  // Accept modal state with custom greeting
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [acceptNote, setAcceptNote] = useState("Excited to guide you through our valley! Looking forward to meeting you.");

  const loadBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getProviderBookings();
      setBookings(data);
    } catch (err) {
      showToast(err.message || "Failed to load provider bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, loadBookings]);

  const incomingRequests = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "completed" || b.status === "declined" || b.status === "cancelled");

  const totalEstimatedEarnings = confirmedBookings
    .concat(completedBookings.filter((b) => b.status === "completed"))
    .reduce((sum, b) => {
      const priceNum = parseInt(String(b.total_price || "").replace(/[^0-9]/g, ""), 10) || 0;
      return sum + priceNum;
    }, 0);

  const handleAcceptConfirm = async () => {
    if (!acceptTarget) return;
    setActionLoading(acceptTarget.id);
    try {
      await respondToBookingRequest(acceptTarget.id, {
        decision: "accept",
        notes: acceptNote,
      });
      showToast(`Booking #${acceptTarget.id} accepted! Traveler has been notified.`);
      setAcceptTarget(null);
      await loadBookings();
    } catch (err) {
      showToast(err.message || "Could not accept booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineTarget) return;
    setActionLoading(declineTarget.id);
    try {
      await respondToBookingRequest(declineTarget.id, {
        decision: "decline",
        notes: declineReason || "Provider is unavailable on this date.",
        suggested_date: suggestedDate || undefined,
      });
      showToast(`Request #${declineTarget.id} declined.`);
      setDeclineTarget(null);
      setDeclineReason("");
      setSuggestedDate("");
      await loadBookings();
    } catch (err) {
      showToast(err.message || "Could not decline booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    if (!window.confirm("Confirm that this guided journey or experience has concluded successfully?")) {
      return;
    }
    setActionLoading(bookingId);
    try {
      await updateBookingStatus(bookingId, "completed");
      showToast(`Booking #${bookingId} marked as completed! Thank you for hosting.`);
      await loadBookings();
    } catch (err) {
      showToast(err.message || "Failed to mark as completed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pahadily-app">
        <SEO
          title="Provider & Host Dashboard | Pahadíly"
          description="Manage traveler companion requests, check availability, and accept authentic Himalayan bookings."
          canonicalPath="/local-dashboard"
        />
        <Navbar activePage="locals" />
        <main className="section-container" style={{ padding: "80px 0", textAlign: "center" }}>
          <div style={{ maxWidth: 540, margin: "0 auto", background: "#ffffff", padding: "40px", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "16px" }}>🏔️</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--color-forest-dark)", marginBottom: "12px" }}>
              Local Provider Portal
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
              Please log in with your Pahadíly host or companion account to manage incoming traveler requests and calendar availability.
            </p>
            <button
              type="button"
              className="view-all-btn"
              onClick={() => openAuthModal("login")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Log In to Provider Portal
            </button>
            <p style={{ marginTop: "20px", fontSize: "14px", color: "var(--color-text-faint)" }}>
              Want to become a local companion or guide?{" "}
              <Link to="/become-a-local" style={{ color: "var(--color-forest-medium)", fontWeight: 600, textDecoration: "underline" }}>
                Apply to join Pahadíly
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pahadily-app">
      <SEO
        title="Local Companion & Provider Hub | Pahadíly"
        description="Review traveler booking requests, manage your Himalayan service area, and avoid double bookings."
        canonicalPath="/local-dashboard"
      />
      <Navbar activePage="locals" />

      <main className="provider-dashboard-main" style={{ padding: "40px 0 80px", background: "var(--color-bg-ivory)", minHeight: "80vh" }}>
        <div className="section-container">
          {/* Header Banner */}
          <div style={{ background: "linear-gradient(135deg, #10251d 0%, #174d39 100%)", borderRadius: "20px", padding: "36px 40px", color: "#ffffff", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", padding: "4px 14px", borderRadius: "9999px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: "var(--color-sage-light)", marginBottom: "12px" }}>
                <span>🌲 Community Host Hub</span>
                <span>•</span>
                <span>Kullu Valley Pilot</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.01em" }}>
                Welcome, {user.full_name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.82)", maxWidth: "680px", fontSize: "15px", lineHeight: "1.6" }}>
                Connect mindful travelers with authentic Himalayan stories, trails, and village culture. Review incoming requests below and accept only dates you can fully commit to.
              </p>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: "14px", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Pending Requests
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: incomingRequests.length > 0 ? "var(--color-terracotta-warm)" : "var(--color-forest-dark)", marginTop: "4px" }}>
                {incomingRequests.length}
              </div>
              <span style={{ fontSize: "12px", color: "var(--color-text-faint)" }}>Requires your response</span>
            </div>

            <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: "14px", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Confirmed Bookings
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-forest-medium)", marginTop: "4px" }}>
                {confirmedBookings.length}
              </div>
              <span style={{ fontSize: "12px", color: "var(--color-text-faint)" }}>Upcoming trips</span>
            </div>

            <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: "14px", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Completed Journeys
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-forest-dark)", marginTop: "4px" }}>
                {completedBookings.filter((b) => b.status === "completed").length}
              </div>
              <span style={{ fontSize: "12px", color: "var(--color-text-faint)" }}>Travelers guided</span>
            </div>

            <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: "14px", border: "1px solid var(--color-border-subtle)", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Estimated Direct Earnings
              </span>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-forest-dark)", marginTop: "4px" }}>
                ₹{totalEstimatedEarnings.toLocaleString()}
              </div>
              <span style={{ fontSize: "12px", color: "var(--color-sage-accent)", fontWeight: 600 }}>100% direct to host</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid var(--color-border-subtle)", paddingBottom: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveTab("incoming")}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "14px",
                background: activeTab === "incoming" ? "var(--color-forest-dark)" : "#ffffff",
                color: activeTab === "incoming" ? "#ffffff" : "var(--color-text-body)",
                border: "1px solid " + (activeTab === "incoming" ? "var(--color-forest-dark)" : "var(--color-border-subtle)"),
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📩 Incoming Requests</span>
              {incomingRequests.length > 0 && (
                <span style={{ background: "var(--color-terracotta-warm)", color: "#ffffff", padding: "2px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800 }}>
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("confirmed")}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "14px",
                background: activeTab === "confirmed" ? "var(--color-forest-dark)" : "#ffffff",
                color: activeTab === "confirmed" ? "#ffffff" : "var(--color-text-body)",
                border: "1px solid " + (activeTab === "confirmed" ? "var(--color-forest-dark)" : "var(--color-border-subtle)"),
                cursor: "pointer",
              }}
            >
              ✅ Confirmed Trips ({confirmedBookings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "14px",
                background: activeTab === "calendar" ? "var(--color-forest-dark)" : "#ffffff",
                color: activeTab === "calendar" ? "#ffffff" : "var(--color-text-body)",
                border: "1px solid " + (activeTab === "calendar" ? "var(--color-forest-dark)" : "var(--color-border-subtle)"),
                cursor: "pointer",
              }}
            >
              📅 Schedule & Busy Dates
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "14px",
                background: activeTab === "completed" ? "var(--color-forest-dark)" : "#ffffff",
                color: activeTab === "completed" ? "#ffffff" : "var(--color-text-body)",
                border: "1px solid " + (activeTab === "completed" ? "var(--color-forest-dark)" : "var(--color-border-subtle)"),
                cursor: "pointer",
              }}
            >
              📜 Past History ({completedBookings.length})
            </button>
          </div>

          {/* TAB 1: INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <div>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
                  Loading incoming requests...
                </div>
              ) : incomingRequests.length === 0 ? (
                <div style={{ background: "#ffffff", padding: "60px 30px", borderRadius: "16px", textAlign: "center", border: "1px dashed var(--color-border-card)" }}>
                  <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🌿</span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--color-forest-dark)", marginBottom: "8px" }}>
                    No Pending Requests at This Moment
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "14px", maxWidth: "500px", margin: "0 auto" }}>
                    When travelers discover your profile or your valley experiences, their availability requests will appear right here for your approval.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid rgba(200, 109, 81, 0.3)",
                        boxShadow: "var(--shadow-sm)",
                        padding: "24px 28px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "16px", marginBottom: "16px" }}>
                        <div>
                          <div style={{ display: "inline-block", background: "rgba(200, 109, 81, 0.12)", color: "var(--color-terracotta-warm)", fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", marginBottom: "8px" }}>
                            ⏳ Action Required: Pending Approval
                          </div>
                          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-forest-dark)", margin: "0 0 4px" }}>
                            {req.item_title}
                          </h3>
                          <span style={{ fontSize: "13px", color: "var(--color-text-faint)" }}>
                            Request ID #{req.id} • Received {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-forest-dark)" }}>
                            {req.total_price}
                          </span>
                          <span style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)" }}>
                            Estimated host remuneration
                          </span>
                        </div>
                      </div>

                      {/* Request Details Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", background: "var(--color-bg-card)", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px" }}>
                        <div>
                          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", display: "block" }}>
                            Requested Date
                          </span>
                          <strong style={{ fontSize: "15px", color: "var(--color-forest-dark)" }}>
                            📅 {req.travel_date}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", display: "block" }}>
                            Time Slot
                          </span>
                          <strong style={{ fontSize: "15px", color: "var(--color-forest-dark)", textTransform: "capitalize" }}>
                            ⏱️ {req.time_slot ? req.time_slot.replace("_", " ") : "Full Day"}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", display: "block" }}>
                            Group Size
                          </span>
                          <strong style={{ fontSize: "15px", color: "var(--color-forest-dark)" }}>
                            👥 {req.guests}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", display: "block" }}>
                            Traveler
                          </span>
                          <strong style={{ fontSize: "15px", color: "var(--color-forest-dark)" }}>
                            {req.traveler_name}
                          </strong>
                          <span style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)" }}>
                            {req.traveler_email}
                          </span>
                        </div>
                      </div>

                      {/* Traveler Note */}
                      <div style={{ marginBottom: "20px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>
                          Traveler Message / Expectations:
                        </span>
                        <p style={{ margin: 0, fontSize: "14px", fontStyle: "italic", background: "#fcfbf7", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", color: "var(--color-text-body)" }}>
                          "{req.message || "Looking forward to an authentic mountain experience."}"
                        </p>
                      </div>

                      {/* Decision Action Buttons */}
                      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setDeclineTarget(req);
                            setDeclineReason("");
                            setSuggestedDate("");
                          }}
                          disabled={actionLoading === req.id}
                          style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--color-terracotta-warm)",
                            background: "#ffffff",
                            border: "1.5px solid var(--color-terracotta-warm)",
                            cursor: "pointer",
                          }}
                        >
                          Decline Request
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAcceptTarget(req);
                            setAcceptNote(`Excited to guide you on ${req.travel_date}! We will meet in the valley.`);
                          }}
                          disabled={actionLoading === req.id}
                          style={{
                            padding: "10px 26px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#ffffff",
                            background: "var(--color-forest-medium)",
                            border: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span>Accept Request</span>
                          <span>✓</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONFIRMED TRIPS */}
          {activeTab === "confirmed" && (
            <div>
              {confirmedBookings.length === 0 ? (
                <div style={{ background: "#ffffff", padding: "60px 30px", borderRadius: "16px", textAlign: "center", border: "1px solid var(--color-border-card)" }}>
                  <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>📅</span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-forest-dark)", marginBottom: "6px" }}>
                    No Upcoming Confirmed Bookings
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                    Once you accept incoming requests, they will show up here along with traveler contact info.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {confirmedBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid rgba(43, 112, 80, 0.3)",
                        padding: "24px",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                        <div>
                          <span style={{ display: "inline-block", background: "rgba(43, 112, 80, 0.12)", color: "var(--color-forest-medium)", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                            ✓ Confirmed Booking
                          </span>
                          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-forest-dark)", margin: "0 0 4px" }}>
                            {b.item_title}
                          </h3>
                          <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                            Voucher Reference #{b.id}
                          </span>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-forest-dark)" }}>
                            {b.total_price}
                          </span>
                          <span style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)" }}>
                            Payment on Meetup
                          </span>
                        </div>
                      </div>

                      {/* Details row */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", background: "var(--color-bg-ivory)", padding: "14px 18px", borderRadius: "10px", marginBottom: "16px" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Date & Slot</span>
                          <div style={{ fontWeight: 600, color: "var(--color-forest-dark)" }}>
                            {b.travel_date} ({b.time_slot ? b.time_slot.replace("_", " ") : "Full Day"})
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Traveler Name</span>
                          <div style={{ fontWeight: 600, color: "var(--color-forest-dark)" }}>{b.traveler_name}</div>
                        </div>

                        <div>
                          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Traveler Contact</span>
                          <div style={{ fontSize: "13px" }}>
                            <a href={`mailto:${b.traveler_email}`} style={{ color: "var(--color-forest-medium)", textDecoration: "underline" }}>
                              {b.traveler_email}
                            </a>
                            {b.traveler_phone && (
                              <div style={{ color: "var(--color-text-body)" }}>📞 {b.traveler_phone}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer: Mark completed action */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "12px", borderTop: "1px solid var(--color-border-subtle)" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                          Trip Note: {b.provider_notes || "Confirmed by host."}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMarkCompleted(b.id)}
                          disabled={actionLoading === b.id}
                          style={{
                            padding: "8px 18px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            background: "#ffffff",
                            color: "var(--color-forest-dark)",
                            border: "1px solid var(--color-forest-dark)",
                            cursor: "pointer",
                          }}
                        >
                          Mark as Completed 🏔️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALENDAR & BUSY DATES */}
          {activeTab === "calendar" && (
            <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid var(--color-border-card)" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--color-forest-dark)", marginBottom: "8px" }}>
                Committed Dates & Conflict Prevention
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px", maxWidth: "600px" }}>
                Pahadíly strictly checks availability before confirming requests. You cannot receive or confirm overlapping bookings on dates marked as busy below.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
                {confirmedBookings.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", padding: "20px", background: "var(--color-bg-ivory)", borderRadius: "10px", color: "var(--color-text-muted)", textAlign: "center" }}>
                    Your schedule is currently completely open!
                  </div>
                ) : (
                  confirmedBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: "16px",
                        borderRadius: "10px",
                        borderLeft: "4px solid var(--color-forest-medium)",
                        background: "var(--color-bg-ivory)",
                      }}
                    >
                      <strong style={{ fontSize: "16px", color: "var(--color-forest-dark)", display: "block" }}>
                        📅 {b.travel_date}
                      </strong>
                      <span style={{ fontSize: "13px", color: "var(--color-text-muted)", display: "block", margin: "4px 0" }}>
                        Slot: {b.time_slot ? b.time_slot.replace("_", " ") : "Full Day"}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--color-forest-medium)", fontWeight: 600 }}>
                        With {b.traveler_name} ({b.item_title.split("(")[0]})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMPLETED & PAST */}
          {activeTab === "completed" && (
            <div>
              {completedBookings.length === 0 ? (
                <div style={{ background: "#ffffff", padding: "40px", borderRadius: "14px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  No past records yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {completedBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: "#ffffff",
                        padding: "18px 22px",
                        borderRadius: "10px",
                        border: "1px solid var(--color-border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: b.status === "completed" ? "rgba(43, 112, 80, 0.1)" : "rgba(100, 100, 100, 0.1)",
                          color: b.status === "completed" ? "var(--color-forest-medium)" : "var(--color-text-muted)",
                          marginBottom: "4px",
                        }}>
                          {b.status}
                        </span>
                        <div style={{ fontWeight: 600, color: "var(--color-forest-dark)" }}>{b.item_title}</div>
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                          Date: {b.travel_date} • Traveler: {b.traveler_name}
                        </span>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <strong>{b.total_price}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ACCEPT REQUEST */}
      {acceptTarget && (
        <div className="pahadily-modal-overlay" onClick={() => setAcceptTarget(null)}>
          <div className="booking-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--color-forest-dark)", marginBottom: "8px" }}>
              Accept Traveler Request
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
              You are confirming your availability for <strong>{acceptTarget.traveler_name}</strong> on <strong>{acceptTarget.travel_date} ({acceptTarget.time_slot || "Full Day"})</strong>.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--color-text-body)", marginBottom: "6px" }}>
                Welcome message / Meeting note for traveler:
              </label>
              <textarea
                rows={3}
                value={acceptNote}
                onChange={(e) => setAcceptNote(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border-card)", fontFamily: "inherit", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setAcceptTarget(null)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--color-border-card)", background: "#ffffff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptConfirm}
                disabled={actionLoading === acceptTarget.id}
                style={{ padding: "10px 24px", borderRadius: "8px", background: "var(--color-forest-medium)", color: "#ffffff", fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                {actionLoading === acceptTarget.id ? "Accepting..." : "Confirm Acceptance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DECLINE REQUEST */}
      {declineTarget && (
        <div className="pahadily-modal-overlay" onClick={() => setDeclineTarget(null)}>
          <div className="booking-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--color-terracotta-warm)", marginBottom: "8px" }}>
              Decline Traveler Request
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
              Let <strong>{declineTarget.traveler_name}</strong> know why you cannot accept this date or suggest an alternate date.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--color-text-body)", marginBottom: "6px" }}>
                Reason for decline:
              </label>
              <input
                type="text"
                placeholder="e.g., Already committed to farm harvest or previous trek"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border-card)", fontFamily: "inherit", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--color-text-body)", marginBottom: "6px" }}>
                Optional: Suggest an Alternative Date
              </label>
              <input
                type="date"
                value={suggestedDate}
                onChange={(e) => setSuggestedDate(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border-card)", fontFamily: "inherit", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--color-border-card)", background: "#ffffff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeclineConfirm}
                disabled={actionLoading === declineTarget.id}
                style={{ padding: "10px 24px", borderRadius: "8px", background: "var(--color-terracotta-warm)", color: "#ffffff", fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                {actionLoading === declineTarget.id ? "Declining..." : "Send Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default LocalDashboardPage;
