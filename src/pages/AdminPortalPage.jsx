import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats, getHostApplications, updateHostApplicationStatus, getBookings } from '../lib/api';

export default function AdminPortalPage() {
  const { user, isAdmin, showToast, refreshKey, triggerRefresh } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'stats' | 'bookings'
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user) {
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
  }, [user, refreshKey]);

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
      showToast('Application declined.', 'info');
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

  if (!user || !isAdmin) {
    return (
      <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '36px', textAlign: 'center', border: '1px solid rgba(16, 37, 29, 0.1)', boxShadow: '0 8px 30px rgba(16, 37, 29, 0.06)' }}>
          <div style={{ fontSize: '42px', marginBottom: '14px' }}>🏔️</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#10251D', marginBottom: '10px' }}>
            Administrator Access Required
          </h2>
          <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.55, marginBottom: '24px' }}>
            The Pahadíly Operations Console is restricted to authorized platform administrators. Please sign in with an administrator account to view marketplace metrics and review host applications.
          </p>
          <a href="/" style={{ padding: '10px 22px', borderRadius: '9999px', backgroundColor: '#174D39', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}>
            Return to Homepage
          </a>
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
                Operations & Governance Console
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', color: '#FFFFFF', margin: '4px 0 8px 0' }}>
                Pahadíly Platform Administrator
              </h1>
              <p style={{ fontSize: '14.5px', color: 'rgba(247, 245, 238, 0.8)', margin: 0 }}>
                Manage local provider vetting, platform throughput, and operational bookings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(16, 37, 29, 0.08)', padding: '14px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px' }}>
          {[
            { id: 'applications', label: `Host Applications (${applications.filter((a) => a.status === 'pending').length} Pending)` },
            { id: 'stats', label: 'Platform Stats & Metrics' },
            { id: 'bookings', label: `All Bookings (${allBookings.length})` },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content Body */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#536B5E' }}>
            Loading platform telemetry...
          </div>
        ) : (
          <>
            {/* TAB: HOST APPLICATIONS */}
            {activeTab === 'applications' && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', marginBottom: '20px' }}>
                  Local Host & Companion Review Queue
                </h3>

                {applications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: '#536B5E' }}>
                    No pending host applications.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid rgba(16, 37, 29, 0.1)',
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', color: '#536B5E', fontWeight: 600 }}>
                            App #{app.id} • {app.region?.toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
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
                            {app.status?.toUpperCase()}
                          </span>
                        </div>

                        <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', margin: '0 0 4px 0' }}>
                          {app.name}
                        </h4>
                        <div style={{ fontSize: '13px', color: '#174D39', fontWeight: 600, marginBottom: '12px' }}>
                          {app.skill} • {app.price} {app.unit}
                        </div>

                        <div style={{ backgroundColor: '#FAF8F2', borderRadius: '10px', padding: '12px', fontSize: '12.5px', lineHeight: 1.6, color: '#1e362c', marginBottom: '14px' }}>
                          <div><strong>Phone:</strong> {app.phone}</div>
                          <div><strong>Email:</strong> {app.email}</div>
                          <div><strong>Languages:</strong> {app.languages}</div>
                          {app.property_name && <div><strong>Property:</strong> {app.property_name}</div>}
                        </div>

                        <p style={{ fontSize: '13px', color: '#536B5E', lineHeight: 1.5, margin: '0 0 20px 0', flex: 1 }}>
                          "{app.bio}"
                        </p>

                        {app.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                            <button
                              type="button"
                              disabled={processingId === app.id}
                              onClick={() => handleApprove(app.id)}
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
                              {processingId === app.id ? 'Processing...' : 'Approve & Publish'}
                            </button>
                            <button
                              type="button"
                              disabled={processingId === app.id}
                              onClick={() => handleReject(app.id)}
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
                        ) : (
                          <div style={{ fontSize: '12px', color: '#536B5E', marginTop: 'auto', fontStyle: 'italic' }}>
                            Reviewed by admin. Notes: {app.admin_notes || 'None'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: STATS & METRICS */}
            {activeTab === 'stats' && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', marginBottom: '20px' }}>
                  Platform Health & Economic Retention
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  {[
                    { label: 'Total Verified Locals', value: stats?.total_locals || 24, icon: '🌲' },
                    { label: 'Total Registered Users', value: stats?.total_users || 12, icon: '🎒' },
                    { label: 'Platform Bookings', value: stats?.total_bookings || allBookings.length, icon: '📅' },
                    { label: 'Pending Host Reviews', value: applications.filter((a) => a.status === 'pending').length, icon: '⏳' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                        boxShadow: '0 4px 16px rgba(16, 37, 29, 0.04)',
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#174D39' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: '13px', color: '#536B5E', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
                  <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: '#10251D', marginBottom: '12px' }}>
                    Economic Impact Formula
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#536B5E', lineHeight: 1.6, margin: 0 }}>
                    Pahadíly strictly operates on a 90% direct payout model: 90% of each traveler honorarium is distributed directly to the native host or guide, while 10% covers SMS confirmation gateways, server hosting, and mountain safety emergency coordination.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ALL BOOKINGS */}
            {activeTab === 'bookings' && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', marginBottom: '20px' }}>
                  All Operational Bookings
                </h3>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16, 37, 29, 0.1)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(16, 37, 29, 0.1)', color: '#536B5E', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em' }}>
                          <th style={{ padding: '14px 16px' }}>ID</th>
                          <th style={{ padding: '14px 16px' }}>Service / Item</th>
                          <th style={{ padding: '14px 16px' }}>Traveler</th>
                          <th style={{ padding: '14px 16px' }}>Provider</th>
                          <th style={{ padding: '14px 16px' }}>Date</th>
                          <th style={{ padding: '14px 16px' }}>Price</th>
                          <th style={{ padding: '14px 16px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBookings.map((b) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid rgba(16, 37, 29, 0.06)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>#{b.id}</td>
                            <td style={{ padding: '12px 16px', color: '#10251D', fontWeight: 600 }}>{b.item_title}</td>
                            <td style={{ padding: '12px 16px' }}>{b.traveler_name}</td>
                            <td style={{ padding: '12px 16px' }}>{b.provider_name}</td>
                            <td style={{ padding: '12px 16px' }}>{b.date}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#174D39' }}>{b.total_price}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
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
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
