import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProviderRequests, respondToBooking } from '../../lib/api';

export default function ProviderPortalModal() {
  const { activeModal, closeModal, user, isHost, demoLogin, showToast, refreshKey, triggerRefresh } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRespondingId, setActiveRespondingId] = useState(null);
  const [decision, setDecision] = useState('accept'); // 'accept' | 'decline'
  const [providerNote, setProviderNote] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (activeModal === 'providerPortal' && isHost) {
      setLoading(true);
      getProviderRequests()
        .then((data) => setRequests(data || []))
        .catch((err) => console.warn('Could not fetch provider requests:', err))
        .finally(() => setLoading(false));
    }
  }, [activeModal, isHost, refreshKey]);

  if (activeModal !== 'providerPortal') return null;

  const handleStartResponse = (booking, type) => {
    setActiveRespondingId(booking.id);
    setDecision(type);
    setProviderNote(
      type === 'accept'
        ? `Delighted to accompany you! Let us meet at ${booking.activity_type || 'the valley trailhead'}.`
        : 'Apologies, I am unavailable on this date.'
    );
    setSuggestedDate('');
  };

  const handleSendResponse = async (bookingId) => {
    setSubmitting(true);
    try {
      await respondToBooking(bookingId, {
        decision,
        notes: providerNote,
        suggested_date: decision === 'decline' ? suggestedDate : null,
      });
      showToast(
        decision === 'accept'
          ? `Request #${bookingId} ACCEPTED! Traveler notified.`
          : `Request #${bookingId} DECLINED.`,
        decision === 'accept' ? 'success' : 'info'
      );
      setActiveRespondingId(null);
      triggerRefresh();
      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === bookingId
            ? { ...r, status: decision === 'accept' ? 'confirmed' : 'declined', provider_notes: providerNote }
            : r
        )
      );
    } catch (err) {
      showToast(err.message || 'Could not update request status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'confirmed') return r.status === 'confirmed';
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(10, 37, 27, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          backgroundColor: '#FAF8F2',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(6, 25, 18, 0.4)',
          border: '1px solid rgba(16, 38, 29, 0.12)',
          position: 'relative',
          padding: '32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '20px',
            color: '#536B5E',
            cursor: 'pointer',
            padding: '6px',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#174D39', fontWeight: 700 }}>
            Local Companion & Host Hub
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', color: '#10251D', margin: '4px 0 6px 0' }}>
            Provider Booking Requests
          </h2>
          <p style={{ color: '#536B5E', fontSize: '14px', margin: 0 }}>
            Review incoming traveler requests, accept bookings based on availability, or suggest alternate dates.
          </p>
        </div>

        {!isHost ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F3EFE6', borderRadius: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌲</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#10251D' }}>Provider Access Required</h4>
            <p style={{ color: '#536B5E', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              You are currently logged in as {user?.role || 'Guest'}. Switch to a local host account to test accepting and declining traveler requests.
            </p>
            <button
              onClick={() => demoLogin('host')}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Log in as Demo Local Guide (Rahul Sharma)
            </button>
          </div>
        ) : (
          <>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {[
                { id: 'all', label: `All Requests (${requests.length})` },
                { id: 'pending', label: `Pending Review (${requests.filter((r) => r.status === 'pending').length})` },
                { id: 'confirmed', label: `Confirmed (${requests.filter((r) => r.status === 'confirmed').length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: filter === f.id ? '#174D39' : '#EAE6DB',
                    color: filter === f.id ? '#FFFFFF' : '#10251D',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#536B5E' }}>
                Fetching your dispatch requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F3EFE6', borderRadius: '14px' }}>
                <p style={{ color: '#536B5E', fontSize: '14px', margin: 0 }}>
                  No requests matching this filter.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '20px',
                      border: '1px solid rgba(16, 38, 29, 0.1)',
                      boxShadow: '0 4px 12px rgba(10, 37, 27, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#174D39', fontWeight: 700 }}>
                          Request #{req.id} • {req.activity_type || 'Companionship'}
                        </span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#10251D', fontWeight: 700 }}>
                          {req.item_title}
                        </h4>
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor:
                            req.status === 'confirmed'
                              ? 'rgba(23, 77, 57, 0.15)'
                              : req.status === 'declined'
                              ? 'rgba(200, 109, 81, 0.15)'
                              : 'rgba(217, 154, 56, 0.2)',
                          color:
                            req.status === 'confirmed'
                              ? '#174D39'
                              : req.status === 'declined'
                              ? '#a3391b'
                              : '#99630c',
                        }}
                      >
                        {req.status === 'confirmed'
                          ? '✓ Confirmed'
                          : req.status === 'declined'
                          ? 'Declined'
                          : 'Pending Response'}
                      </span>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#FAF8F2',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: '#10251D',
                        marginBottom: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                      }}
                    >
                      <div>👤 <strong>Traveler:</strong> {req.traveler_name}</div>
                      <div>📧 <strong>Email:</strong> {req.traveler_email}</div>
                      <div>📞 <strong>Phone:</strong> {req.traveler_phone || 'Not provided'}</div>
                      <div>📅 <strong>Date:</strong> {req.travel_date}</div>
                      <div>⏰ <strong>Slot:</strong> {req.time_slot === 'full_day' ? 'Full Day' : req.time_slot}</div>
                      <div>👥 <strong>Travelers:</strong> {req.guests}</div>
                      <div>💰 <strong>Honorarium:</strong> {req.total_price} (Direct Meetup)</div>
                    </div>

                    {req.message && (
                      <div
                        style={{
                          fontSize: '13px',
                          fontStyle: 'italic',
                          color: '#536B5E',
                          backgroundColor: '#F3EFE6',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          marginBottom: '14px',
                        }}
                      >
                        Note from traveler: "{req.message}"
                      </div>
                    )}

                    {/* Action buttons if pending */}
                    {req.status === 'pending' && activeRespondingId !== req.id && (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(16, 38, 29, 0.08)' }}>
                        <button
                          type="button"
                          onClick={() => handleStartResponse(req, 'decline')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '9999px',
                            backgroundColor: 'transparent',
                            color: '#a3391b',
                            border: '1px solid rgba(200, 109, 81, 0.3)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Decline Request
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartResponse(req, 'accept')}
                          style={{
                            padding: '8px 20px',
                            borderRadius: '9999px',
                            backgroundColor: '#174D39',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(23, 77, 57, 0.2)',
                          }}
                        >
                          ✓ Accept Request
                        </button>
                      </div>
                    )}

                    {/* Active responding inline form */}
                    {activeRespondingId === req.id && (
                      <div
                        style={{
                          backgroundColor: decision === 'accept' ? 'rgba(23, 77, 57, 0.06)' : 'rgba(200, 109, 81, 0.06)',
                          padding: '16px',
                          borderRadius: '10px',
                          border: `1.5px solid ${decision === 'accept' ? '#174D39' : '#c86d51'}`,
                          marginTop: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#10251D', marginBottom: '8px' }}>
                          {decision === 'accept' ? 'Accepting Request — Add Meetup Note' : 'Declining Request — Reason / Alternate Date'}
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                            Message to Traveler:
                          </label>
                          <textarea
                            rows={2}
                            value={providerNote}
                            onChange={(e) => setProviderNote(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(16, 38, 29, 0.2)',
                              fontSize: '13px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        {decision === 'decline' && (
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                              Suggest Alternative Date (Optional):
                            </label>
                            <input
                              type="date"
                              value={suggestedDate}
                              onChange={(e) => setSuggestedDate(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(16, 38, 29, 0.2)',
                                fontSize: '13px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setActiveRespondingId(null)}
                            disabled={submitting}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              color: '#536B5E',
                              fontSize: '13px',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendResponse(req.id)}
                            disabled={submitting}
                            style={{
                              padding: '8px 20px',
                              borderRadius: '9999px',
                              backgroundColor: decision === 'accept' ? '#174D39' : '#a3391b',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '13px',
                              border: 'none',
                              cursor: submitting ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {submitting ? 'Updating...' : decision === 'accept' ? 'Confirm Acceptance' : 'Confirm Decline'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
