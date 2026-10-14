import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStats, getHostApplications, updateHostApplicationStatus, getBookings } from '../../lib/api';

export default function AdminPortalModal() {
  const { activeModal, closeModal, user, isAdmin, demoLogin, showToast, refreshKey, triggerRefresh } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'stats' | 'bookings'
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (activeModal === 'adminPortal' && isAdmin) {
      setLoading(true);
      Promise.all([
        getStats().catch(() => null),
        getHostApplications().catch(() => []),
        getBookings().catch(() => []),
      ])
        .then(([statsData, appsData, bookingsData]) => {
          setStats(statsData);
          setApplications(appsData || []);
          setAllBookings(bookingsData || []);
        })
        .finally(() => setLoading(false));
    }
  }, [activeModal, isAdmin, refreshKey]);

  if (activeModal !== 'adminPortal') return null;

  const handleApprove = async (appId) => {
    setProcessingId(appId);
    try {
      const res = await updateHostApplicationStatus(appId, {
        status_val: 'approved',
        admin_notes: 'Verified local credentials. Approved and published to marketplace.',
      });
      showToast(res.message || 'Host application approved and published!');
      triggerRefresh();
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'approved' } : a))
      );
    } catch (err) {
      showToast(err.message || 'Failed to approve application', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appId) => {
    const reason = window.prompt('Enter reason for declining application:');
    if (reason === null) return;
    setProcessingId(appId);
    try {
      await updateHostApplicationStatus(appId, {
        status_val: 'rejected',
        admin_notes: reason || 'Application did not meet local verification criteria.',
      });
      showToast('Application marked as rejected.', 'info');
      triggerRefresh();
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'rejected' } : a))
      );
    } catch (err) {
      showToast(err.message || 'Failed to reject application', 'error');
    } finally {
      setProcessingId(null);
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
          maxWidth: '820px',
          maxHeight: '90vh',
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
            Master Administration
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', color: '#10251D', margin: '4px 0 6px 0' }}>
            Pahadíly Platform Operations
          </h2>
          <p style={{ color: '#536B5E', fontSize: '14px', margin: 0 }}>
            Curate pilot providers, review host applications, and monitor community booking throughput.
          </p>
        </div>

        {!isAdmin ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F3EFE6', borderRadius: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏔️</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#10251D' }}>Administrator Privileges Required</h4>
            <p style={{ color: '#536B5E', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              You are currently logged in as {user?.role || 'Guest'}. Switch to the platform administrator account to manage applications and oversight.
            </p>
            <button
              onClick={() => demoLogin('admin')}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Log in as Demo Administrator
            </button>
          </div>
        ) : (
          <>
            {/* Top Stat summary cards */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 38, 29, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Total Bookings</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#174D39', marginTop: '2px' }}>{stats.bookings}</div>
                  <div style={{ fontSize: '11px', color: '#536B5E' }}>{stats.bookings_confirmed} confirmed</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 38, 29, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Host Payout Volume</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#10251D', marginTop: '2px' }}>{stats.total_revenue}</div>
                  <div style={{ fontSize: '11px', color: '#536B5E' }}>Direct to locals</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 38, 29, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Pilot Providers</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#174D39', marginTop: '2px' }}>{stats.locals}</div>
                  <div style={{ fontSize: '11px', color: '#536B5E' }}>Kullu valley natives</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 38, 29, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Pending Apps</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#d99a38', marginTop: '2px' }}>
                    {applications.filter((a) => a.status === 'pending').length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#536B5E' }}>Requires review</div>
                </div>
              </div>
            )}

            {/* Navigation tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(16, 38, 29, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('applications')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'applications' ? '#174D39' : '#EAE6DB',
                  color: activeTab === 'applications' ? '#FFFFFF' : '#10251D',
                }}
              >
                Host & Companion Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'bookings' ? '#174D39' : '#EAE6DB',
                  color: activeTab === 'bookings' ? '#FFFFFF' : '#10251D',
                }}
              >
                Platform Bookings Oversight ({allBookings.length})
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#536B5E' }}>
                Fetching operational records...
              </div>
            ) : activeTab === 'applications' ? (
              applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#F3EFE6', borderRadius: '12px' }}>
                  No host applications submitted yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        padding: '18px',
                        border: '1px solid rgba(16, 38, 29, 0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#536B5E', fontWeight: 600 }}>App #{app.id}</span>
                          <h4 style={{ margin: '2px 0 0 0', fontSize: '17px', color: '#10251D', fontWeight: 700 }}>
                            {app.name} — {app.skill || 'Local Host'} ({app.region})
                          </h4>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            backgroundColor:
                              app.status === 'approved'
                                ? 'rgba(23, 77, 57, 0.15)'
                                : app.status === 'rejected'
                                ? 'rgba(200, 109, 81, 0.15)'
                                : 'rgba(217, 154, 56, 0.2)',
                            color:
                              app.status === 'approved'
                                ? '#174D39'
                                : app.status === 'rejected'
                                ? '#a3391b'
                                : '#99630c',
                          }}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#FAF8F2',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          color: '#10251D',
                          marginBottom: '10px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                        }}
                      >
                        <div>📞 <strong>Phone:</strong> {app.phone || 'N/A'}</div>
                        <div>📧 <strong>Email:</strong> {app.email || 'N/A'}</div>
                        <div>🗣️ <strong>Languages:</strong> {app.languages || 'Hindi, Pahadi'}</div>
                        <div>💰 <strong>Proposed Rate:</strong> {app.price} {app.unit}</div>
                        {app.property_name && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            🏡 <strong>Homestay Listing:</strong> {app.property_name} ({app.category || 'Homestay'}, {app.altitude})
                          </div>
                        )}
                      </div>

                      {app.bio && (
                        <p style={{ fontSize: '13px', color: '#536B5E', margin: '0 0 12px 0', fontStyle: 'italic' }}>
                          "{app.bio}"
                        </p>
                      )}

                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(16, 38, 29, 0.08)' }}>
                          <button
                            type="button"
                            onClick={() => handleReject(app.id)}
                            disabled={processingId === app.id}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              color: '#a3391b',
                              border: '1px solid rgba(200, 109, 81, 0.3)',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Decline Application
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(app.id)}
                            disabled={processingId === app.id}
                            style={{
                              padding: '6px 18px',
                              borderRadius: '9999px',
                              backgroundColor: '#174D39',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            ✓ Approve & Publish to Marketplace
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid rgba(16, 38, 29, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#10251D' }}>
                        #{b.id} — {b.item_title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#536B5E', marginTop: '2px' }}>
                        Traveler: {b.traveler_name} ({b.traveler_email}) • Provider: {b.provider_name} • Date: {b.travel_date}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor:
                            b.status === 'confirmed'
                              ? 'rgba(23, 77, 57, 0.15)'
                              : b.status === 'declined'
                              ? 'rgba(200, 109, 81, 0.15)'
                              : 'rgba(217, 154, 56, 0.2)',
                          color:
                            b.status === 'confirmed'
                              ? '#174D39'
                              : b.status === 'declined'
                              ? '#a3391b'
                              : '#99630c',
                        }}
                      >
                        {b.status.toUpperCase()}
                      </span>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#10251D', marginTop: '4px' }}>
                        {b.total_price}
                      </div>
                    </div>
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
