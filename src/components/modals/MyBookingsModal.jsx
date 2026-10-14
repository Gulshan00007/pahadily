import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, updateBookingStatus } from '../../lib/api';

export default function MyBookingsModal() {
  const { activeModal, closeModal, user, openAuth, showToast, refreshKey, triggerRefresh } = useAuth();
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    if (activeModal === 'myBookings' && user) {
      setLoading(true);
      getMyBookings()
        .then((data) => setBookingsList(data || []))
        .catch((err) => console.warn('Failed to load bookings:', err))
        .finally(() => setLoading(false));
    }
  }, [activeModal, user, refreshKey]);

  if (activeModal !== 'myBookings') return null;

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      showToast('Booking cancelled.', 'info');
      triggerRefresh();
      // Update local state
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
            ⏳ Pending Host Review
          </span>
        );
    }
  };

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
          maxWidth: '680px',
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

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#174D39', fontWeight: 700 }}>
            Traveler Dashboard
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', color: '#10251D', margin: '4px 0 6px 0' }}>
            My Himalayan Bookings & Requests
          </h2>
          <p style={{ color: '#536B5E', fontSize: '14px', margin: 0 }}>
            Track the status of your local companion requests, meetups, and digital vouchers.
          </p>
        </div>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F3EFE6', borderRadius: '14px' }}>
            <p style={{ fontSize: '15px', color: '#10251D', marginBottom: '16px' }}>
              Please sign in to view your bookings and vouchers.
            </p>
            <button
              onClick={() => openAuth('login')}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Sign In / Quick Demo Login
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#536B5E' }}>
            Loading your Himalayan journey records...
          </div>
        ) : bookingsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F3EFE6', borderRadius: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌲</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#10251D' }}>No Bookings Yet</h4>
            <p style={{ color: '#536B5E', fontSize: '14px', maxWidth: '380px', margin: '0 auto 18px auto' }}>
              You haven't requested any local companions or experiences yet. Explore our pilot valleys in Kullu to get started!
            </p>
            <button
              onClick={closeModal}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Discover Pilot Valleys
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookingsList.map((b) => (
              <div
                key={b.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid rgba(16, 38, 29, 0.1)',
                  boxShadow: '0 4px 12px rgba(10, 37, 27, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#536B5E', fontWeight: 600 }}>Voucher #{b.id}</span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#10251D', fontWeight: 700 }}>
                      {b.item_title}
                    </h4>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#536B5E',
                    marginBottom: '14px',
                    backgroundColor: '#FAF8F2',
                    padding: '12px',
                    borderRadius: '8px',
                  }}
                >
                  <div>📅 <strong>Date:</strong> {b.travel_date}</div>
                  <div>⏰ <strong>Slot:</strong> {b.time_slot === 'full_day' ? 'Full Day' : b.time_slot}</div>
                  <div>👥 <strong>Travelers:</strong> {b.guests}</div>
                  <div>💰 <strong>Honorarium:</strong> {b.total_price} (Meetup Pay)</div>
                  {b.provider_name && <div>👤 <strong>Provider:</strong> {b.provider_name}</div>}
                  <div>🔍 <strong>Ref:</strong> {b.transaction_ref}</div>
                </div>

                {/* Provider Note / Suggested Date */}
                {b.provider_notes && (
                  <div
                    style={{
                      backgroundColor: b.status === 'confirmed' ? 'rgba(23, 77, 57, 0.08)' : 'rgba(200, 109, 81, 0.1)',
                      borderLeft: `3px solid ${b.status === 'confirmed' ? '#174D39' : '#c86d51'}`,
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '13px',
                      color: '#10251D',
                      marginBottom: '14px',
                    }}
                  >
                    <strong>Host Message:</strong> "{b.provider_notes}"
                    {b.suggested_date && (
                      <div style={{ marginTop: '4px', color: '#174D39', fontWeight: 600 }}>
                        💡 Host suggests alternative date: {b.suggested_date}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(16, 38, 29, 0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(b)}
                    style={{
                      fontSize: '13px',
                      color: '#174D39',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    📄 View Digital Voucher
                  </button>

                  {['pending', 'confirmed'].includes(b.status) && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      style={{
                        fontSize: '12px',
                        color: '#c86d51',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '4px 8px',
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

        {/* Modal voucher detail preview popup */}
        {selectedVoucher && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2500,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setSelectedVoucher(null)}
          >
            <div
              style={{
                backgroundColor: '#FAF8F2',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '480px',
                width: '100%',
                border: '2px dashed #174D39',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#174D39', letterSpacing: '0.1em' }}>
                  OFFICIAL HIMALAYAN TRAVEL VOUCHER
                </span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', margin: '4px 0' }}>
                  Pahadíly #{selectedVoucher.id}
                </h3>
                <div style={{ fontSize: '12px', color: '#536B5E' }}>Issued for {selectedVoucher.traveler_name}</div>
              </div>

              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#10251D', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', marginBottom: '18px' }}>
                <div><strong>Experience:</strong> {selectedVoucher.item_title}</div>
                <div><strong>Local Provider:</strong> {selectedVoucher.provider_name}</div>
                <div><strong>Date:</strong> {selectedVoucher.travel_date} ({selectedVoucher.time_slot})</div>
                <div><strong>Status:</strong> {selectedVoucher.status.toUpperCase()}</div>
                <div><strong>Amount to Pay on Meetup:</strong> {selectedVoucher.total_price}</div>
                <div><strong>Reference:</strong> {selectedVoucher.transaction_ref}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    backgroundColor: '#174D39',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Print / Save Voucher
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    color: '#536B5E',
                    fontSize: '13px',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
