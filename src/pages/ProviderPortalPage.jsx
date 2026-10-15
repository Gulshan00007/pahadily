import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProviderRequests, respondToBooking } from '../lib/api';

export default function ProviderPortalPage() {
  const { user, isHost, showToast, refreshKey, triggerRefresh } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRespondingId, setActiveRespondingId] = useState(null);
  const [decision, setDecision] = useState('accept');
  const [providerNote, setProviderNote] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      setLoading(true);
      getProviderRequests()
        .then((data) => setRequests(data || []))
        .catch((err) => console.warn('Could not fetch provider requests:', err))
        .finally(() => setLoading(false));
    }
  }, [user, refreshKey]);

  const handleStartResponse = (booking, type) => {
    setActiveRespondingId(booking.id);
    setDecision(type);
    setProviderNote(
      type === 'accept'
        ? `Delighted to host you in the valley! Let's meet at ${booking.location || 'the village meeting spot'}.`
        : 'Apologies, trail conditions or existing commitments prevent hosting on this date.'
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
          ? `Booking #${bookingId} accepted! Traveler notified.`
          : `Booking #${bookingId} declined.`,
        decision === 'accept' ? 'success' : 'info'
      );
      setActiveRespondingId(null);
      triggerRefresh();
      setRequests((prev) =>
        prev.map((r) =>
          r.id === bookingId
            ? { ...r, status: decision === 'accept' ? 'confirmed' : 'declined', provider_notes: providerNote }
            : r
        )
      );
    } catch (err) {
      showToast(err.message || 'Could not update booking response', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  if (!user || (!isHost && user?.role !== 'admin')) {
    return (
      <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '520px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '36px', textAlign: 'center', border: '1px solid rgba(16, 37, 29, 0.1)', boxShadow: '0 8px 30px rgba(16, 37, 29, 0.06)' }}>
          <div style={{ fontSize: '42px', marginBottom: '14px' }}>🌲</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#10251D', marginBottom: '10px' }}>
            Provider Access Restricted
          </h2>
          <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.55, marginBottom: '24px' }}>
            The Companion & Host Dashboard requires an approved local provider account. If you are a native valley resident offering homestays or guiding, please submit an application for administrator review.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/become-a-local" style={{ padding: '10px 22px', borderRadius: '9999px', backgroundColor: '#174D39', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}>
              Apply to Become a Local
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section style={{ backgroundColor: '#10251D', color: '#F7F5EE', padding: '48px 0 36px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8EE49A', fontWeight: 700 }}>
                Himalayan Local Host Operations
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', color: '#FFFFFF', margin: '4px 0 8px 0' }}>
                Provider Dispatch Hub
              </h1>
              <p style={{ fontSize: '14.5px', color: 'rgba(247, 245, 238, 0.8)', margin: 0 }}>
                Manage incoming traveler requests for guiding, homestays, and experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(16, 37, 29, 0.08)', padding: '14px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: `All Requests (${requests.length})` },
            { id: 'pending', label: '⏳ Pending Action' },
            { id: 'confirmed', label: '✓ Confirmed' },
            { id: 'declined', label: '✕ Declined' },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? 'var(--color-forest-light, #205540)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--color-text-main, #0C2017)',
                  border: active ? '1px solid #205540' : '1px solid rgba(10, 37, 27, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Requests Grid */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#536B5E' }}>
            Loading incoming requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌲</div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', marginBottom: '6px' }}>
              No Requests in Queue
            </h3>
            <p style={{ color: '#536B5E', fontSize: '13.5px', margin: 0 }}>
              You do not have any requests in this state. New booking requests from travelers will appear here in real time.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                  borderRadius: '14px',
                  border: '1px solid rgba(10, 37, 27, 0.08)',
                  boxShadow: '0 2px 8px rgba(10, 37, 27, 0.04)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(101, 184, 142, 0.45)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(10, 37, 27, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#536B5E', fontWeight: 600 }}>
                    Request #{req.id} • {req.service_type?.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor:
                        req.status === 'confirmed'
                          ? 'rgba(32, 85, 64, 0.15)'
                          : req.status === 'declined'
                          ? 'rgba(200, 109, 81, 0.15)'
                          : 'rgba(217, 154, 56, 0.2)',
                      color:
                        req.status === 'confirmed'
                          ? 'var(--color-forest-light, #205540)'
                          : req.status === 'declined'
                          ? 'var(--color-terracotta-warm, #c86d51)'
                          : 'var(--color-gold-warm, #d99a38)',
                    }}
                  >
                    {req.status === 'confirmed' ? '✓ Confirmed' : req.status === 'declined' ? '✕ Declined' : '⏳ Pending'}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    color: '#10251D',
                    margin: '0 0 6px 0',
                  }}
                >
                  {req.item_title}
                </h3>

                <div style={{ fontSize: '13px', color: '#536B5E', marginBottom: '16px' }}>
                  📍 {req.location}
                </div>

                {/* Traveler info */}
                <div
                  style={{
                    backgroundColor: '#FAF8F2',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '12.5px',
                    lineHeight: 1.6,
                    color: '#1e362c',
                    marginBottom: '16px',
                  }}
                >
                  <div><strong>Traveler:</strong> {req.traveler_name} ({req.traveler_email})</div>
                  <div><strong>Date:</strong> {req.date}</div>
                  <div><strong>Party:</strong> {req.party_size} person(s)</div>
                  <div><strong>Total Honorarium:</strong> <span style={{ color: '#174D39', fontWeight: 700 }}>{req.total_price}</span></div>
                  {req.special_requests && (
                    <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#536B5E' }}>
                      "{req.special_requests}"
                    </div>
                  )}
                </div>

                {/* Decision Form if open */}
                {activeRespondingId === req.id ? (
                  <div style={{ borderTop: '1px solid rgba(16, 37, 29, 0.1)', paddingTop: '16px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setDecision('accept')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          backgroundColor: decision === 'accept' ? '#174D39' : '#EDE8DC',
                          color: decision === 'accept' ? '#FFFFFF' : '#10251D',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Accept Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision('decline')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          backgroundColor: decision === 'decline' ? '#c86d51' : '#EDE8DC',
                          color: decision === 'decline' ? '#FFFFFF' : '#10251D',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Decline
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={providerNote}
                      onChange={(e) => setProviderNote(e.target.value)}
                      placeholder="Message for traveler (meeting spot, trail preparation, or decline reason)..."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        fontSize: '12.5px',
                        marginBottom: '10px',
                        fontFamily: 'inherit',
                      }}
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSendResponse(req.id)}
                        style={{
                          flex: 1,
                          padding: '9px',
                          borderRadius: '8px',
                          backgroundColor: decision === 'accept' ? '#174D39' : '#c86d51',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {submitting ? 'Updating...' : `Confirm ${decision === 'accept' ? 'Acceptance' : 'Decline'}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRespondingId(null)}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#EDE8DC',
                          color: '#10251D',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => handleStartResponse(req, 'accept')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '9999px',
                          backgroundColor: '#174D39',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Accept Request
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartResponse(req, 'decline')}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '9999px',
                          backgroundColor: 'transparent',
                          color: '#c86d51',
                          border: '1px solid rgba(200, 109, 81, 0.3)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
