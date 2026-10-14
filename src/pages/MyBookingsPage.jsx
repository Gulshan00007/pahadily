import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, updateBookingStatus } from '../lib/api';

export default function MyBookingsPage() {
  const { user, openAuth, showToast, refreshKey, triggerRefresh } = useAuth();
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      setLoading(true);
      getMyBookings()
        .then((data) => setBookingsList(data || []))
        .catch((err) => console.warn('Failed to load bookings:', err))
        .finally(() => setLoading(false));
    }
  }, [user, refreshKey]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request? Free cancellation is guaranteed prior to confirmed start.')) return;
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      showToast('Booking cancelled.', 'info');
      triggerRefresh();
      setBookingsList((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      showToast(err.message || 'Could not cancel booking', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span style={{ backgroundColor: 'rgba(23, 77, 57, 0.15)', color: '#174D39', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
            ✓ Confirmed by Host
          </span>
        );
      case 'declined':
        return (
          <span style={{ backgroundColor: 'rgba(200, 109, 81, 0.15)', color: '#a3391b', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
            ✕ Provider Unavailable
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ backgroundColor: 'rgba(100, 100, 100, 0.15)', color: '#666', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
            Cancelled
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: 'rgba(217, 154, 56, 0.2)', color: '#99630c', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
            ⏳ Pending Provider Review
          </span>
        );
    }
  };

  const filteredBookings = bookingsList.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  if (!user) {
    return (
      <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '20px', border: '1px solid rgba(16, 37, 29, 0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎒</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#10251D', marginBottom: '12px' }}>
            Sign In to View Your Bookings
          </h2>
          <p style={{ color: '#536B5E', fontSize: '14.5px', marginBottom: '24px' }}>
            Please sign in with your traveler account to track your pending and confirmed Himalayan experience requests.
          </p>
          <button
            type="button"
            onClick={() => openAuth('login')}
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              backgroundColor: '#174D39',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sign In Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section style={{ backgroundColor: '#10251D', color: '#F7F5EE', padding: '48px 0 36px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8EE49A', fontWeight: 700 }}>
            Traveler Dashboard
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', color: '#FFFFFF', margin: '4px 0 8px 0' }}>
            My Experience & Stay Bookings
          </h1>
          <p style={{ fontSize: '14.5px', color: 'rgba(247, 245, 238, 0.8)', margin: 0 }}>
            Signed in as <strong>{user.full_name}</strong> ({user.email})
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(16, 37, 29, 0.08)', padding: '14px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: `All (${bookingsList.length})` },
            { id: 'pending', label: 'Pending Review' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? '#174D39' : 'transparent',
                  color: active ? '#FFFFFF' : '#10251D',
                  border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Bookings List */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#536B5E' }}>
            Loading your bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
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
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏔️</div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', marginBottom: '6px' }}>
              No Bookings Found
            </h3>
            <p style={{ color: '#536B5E', fontSize: '13.5px', marginBottom: '20px' }}>
              You don’t have any {statusFilter !== 'all' ? statusFilter : ''} bookings yet. Discover hidden valleys and connect with a local companion.
            </p>
            <Link
              to="/explore"
              style={{
                display: 'inline-block',
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Explore Himachal Places →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(16, 37, 29, 0.1)',
                  boxShadow: '0 4px 16px rgba(16, 37, 29, 0.04)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#536B5E', fontWeight: 600 }}>
                    Request #{b.id} • {b.service_type?.toUpperCase()}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    color: '#10251D',
                    margin: '0 0 6px 0',
                    lineHeight: 1.25,
                  }}
                >
                  {b.item_title}
                </h3>

                <div style={{ fontSize: '13px', color: '#536B5E', marginBottom: '16px' }}>
                  📍 {b.location}
                </div>

                {/* Booking details table */}
                <div
                  style={{
                    backgroundColor: '#FAF8F2',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '12.5px',
                    color: '#1e362c',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ color: '#536B5E', display: 'block' }}>Date:</span>
                    <strong>{b.date}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#536B5E', display: 'block' }}>Group Size:</span>
                    <strong>{b.party_size} Guest{b.party_size > 1 ? 's' : ''}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#536B5E', display: 'block' }}>Local Provider:</span>
                    <strong>{b.provider_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#536B5E', display: 'block' }}>Total Honorarium:</span>
                    <strong style={{ color: '#174D39' }}>{b.total_price}</strong>
                  </div>
                </div>

                {/* Provider Note if present */}
                {b.provider_note && (
                  <div
                    style={{
                      backgroundColor: 'rgba(23, 77, 57, 0.08)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: '#174D39',
                      marginBottom: '16px',
                    }}
                  >
                    <strong>Host Note:</strong> {b.provider_note}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  {b.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher(b)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '9999px',
                        backgroundColor: '#174D39',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      View Mountain Voucher
                    </button>
                  )}

                  {b.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '9999px',
                        backgroundColor: 'transparent',
                        color: '#c86d51',
                        border: '1px solid rgba(200, 109, 81, 0.3)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voucher Modal */}
      {selectedVoucher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(16, 37, 29, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedVoucher(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '32px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#174D39', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Official Mountain Travel Voucher
              </span>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#10251D', margin: '4px 0' }}>
                {selectedVoucher.item_title}
              </h3>
              <div style={{ fontSize: '13px', color: '#536B5E' }}>
                Booking Ref #{selectedVoucher.id} • {selectedVoucher.status.toUpperCase()}
              </div>
            </div>

            <div style={{ backgroundColor: '#FAF8F2', borderRadius: '12px', padding: '16px', fontSize: '13px', lineHeight: 1.8, marginBottom: '20px' }}>
              <div><strong>Traveler:</strong> {selectedVoucher.traveler_name}</div>
              <div><strong>Assigned Local Provider:</strong> {selectedVoucher.provider_name}</div>
              <div><strong>Date:</strong> {selectedVoucher.date}</div>
              <div><strong>Location:</strong> {selectedVoucher.location}</div>
              <div><strong>Total Honorarium:</strong> {selectedVoucher.total_price} (Pay on completion)</div>
            </div>

            <div style={{ fontSize: '12px', color: '#536B5E', lineHeight: 1.5, marginBottom: '20px', textAlign: 'center' }}>
              Please present this voucher or reference ID #{selectedVoucher.id} to your local host upon arrival.
            </div>

            <button
              type="button"
              onClick={() => setSelectedVoucher(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close Voucher
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
